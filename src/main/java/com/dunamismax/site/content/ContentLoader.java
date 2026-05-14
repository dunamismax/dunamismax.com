package com.dunamismax.site.content;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.tomlj.Toml;
import org.tomlj.TomlArray;
import org.tomlj.TomlParseResult;
import org.tomlj.TomlTable;

final class ContentLoader {

  private static final String FRONTMATTER_DELIM = "+++";

  private ContentLoader() {
  }

  static List<Project> loadProjects(Resource resource) {
    if (!resource.exists()) {
      throw new IllegalArgumentException("missing " + resource.getDescription());
    }
    try (var input = resource.getInputStream()) {
      TomlParseResult parsed = Toml.parse(input);
      if (parsed.hasErrors()) {
        throw new IllegalArgumentException("invalid TOML in " + resource.getDescription() + ": " + parsed.errors());
      }
      TomlArray rawArray = parsed.getArray("projects");
      if (rawArray == null) {
        throw new IllegalArgumentException("missing [[projects]] array in " + resource.getDescription());
      }

      Set<String> seen = new HashSet<>();
      List<Project> projects = new ArrayList<>(rawArray.size());
      for (int i = 0; i < rawArray.size(); i++) {
        TomlTable table = rawArray.getTable(i);
        if (table == null) {
          throw new IllegalArgumentException("project at index " + i + " is not a table");
        }
        String slug = requireString(table, "slug");
        if (!seen.add(slug)) {
          throw new IllegalArgumentException("duplicate project slug: " + slug);
        }
        projects.add(new Project(
            slug,
            requireString(table, "name"),
            ProjectCategory.fromSlug(requireString(table, "category")),
            ProjectStatus.fromSlug(requireString(table, "status")),
            table.getLong("position") == null ? 999 : table.getLong("position").intValue(),
            Boolean.TRUE.equals(table.getBoolean("featured")),
            table.getString("visibility") == null ? "public" : table.getString("visibility"),
            requireString(table, "tagline"),
            stringList(table, "stack"),
            table.getString("repo") == null ? "" : table.getString("repo"),
            table.getString("url") == null ? "" : table.getString("url")));
      }
      projects.sort(Comparator.comparingInt(Project::position).thenComparing(Project::name));
      return List.copyOf(projects);
    } catch (IOException ex) {
      throw new UncheckedIOException(ex);
    }
  }

  static List<Post> loadPosts(String pattern, Function<String, String> render) {
    var resolver = new PathMatchingResourcePatternResolver(ContentLoader.class.getClassLoader());
    Resource[] resources;
    try {
      resources = resolver.getResources(pattern);
    } catch (IOException ex) {
      resources = new Resource[0];
    }
    List<Post> posts = new ArrayList<>();
    for (Resource resource : resources) {
      String filename = resource.getFilename();
      if (filename != null && filename.endsWith(".md")) {
        posts.add(parsePost(resource, render));
      }
    }
    posts.sort(Comparator.comparing(Post::publishedOn).reversed());
    return List.copyOf(posts);
  }

  static String loadPageMarkdown(Resource resource) {
    if (!resource.exists()) {
      return null;
    }
    try (var input = resource.getInputStream()) {
      return new String(input.readAllBytes(), StandardCharsets.UTF_8);
    } catch (IOException ex) {
      throw new UncheckedIOException(ex);
    }
  }

  private static Post parsePost(Resource resource, Function<String, String> render) {
    try (var input = resource.getInputStream()) {
      String text = new String(input.readAllBytes(), StandardCharsets.UTF_8);
      Frontmatter frontmatter = splitFrontmatter(text, resource.getDescription());
      TomlParseResult meta = Toml.parse(frontmatter.meta());
      if (meta.hasErrors()) {
        throw new IllegalArgumentException("invalid frontmatter in " + resource.getDescription() + ": " + meta.errors());
      }
      String slug = meta.getString("slug");
      if (slug == null) {
        String filename = resource.getFilename();
        if (filename == null) {
          throw new IllegalArgumentException("post resource has no filename");
        }
        slug = filename.replaceFirst("\\.md$", "");
      }
      for (String key : List.of("title", "description", "published_on")) {
        if (!meta.contains(key)) {
          throw new IllegalArgumentException(resource.getDescription() + ": missing frontmatter key " + key);
        }
      }
      return new Post(
          slug,
          requireString(meta, "title"),
          requireString(meta, "description"),
          parseDate(meta.get("published_on")),
          stringList(meta, "tags"),
          frontmatter.body(),
          render.apply(frontmatter.body()),
          Boolean.TRUE.equals(meta.getBoolean("draft")));
    } catch (IOException ex) {
      throw new UncheckedIOException(ex);
    }
  }

  private static Frontmatter splitFrontmatter(String text, String label) {
    if (!text.startsWith(FRONTMATTER_DELIM)) {
      throw new IllegalArgumentException(label + ": missing TOML frontmatter (delimit with " + FRONTMATTER_DELIM + ")");
    }
    int end = text.indexOf("\n" + FRONTMATTER_DELIM, FRONTMATTER_DELIM.length());
    if (end == -1) {
      throw new IllegalArgumentException(label + ": frontmatter opened with " + FRONTMATTER_DELIM + " but never closed");
    }
    String meta = text.substring(FRONTMATTER_DELIM.length(), end).trim();
    String body = text.substring(end + ("\n" + FRONTMATTER_DELIM).length());
    if (body.startsWith("\n")) {
      body = body.substring(1);
    }
    return new Frontmatter(meta, body);
  }

  private static LocalDate parseDate(Object value) {
    if (value instanceof LocalDate date) {
      return date;
    }
    if (value instanceof LocalDateTime dateTime) {
      return dateTime.toLocalDate();
    }
    if (value instanceof String text) {
      return LocalDate.parse(text);
    }
    throw new IllegalArgumentException("unsupported published_on value: " + value);
  }

  private static List<String> stringList(TomlTable table, String key) {
    Object raw = table.get(key);
    if (raw instanceof String text) {
      return splitCommaList(text);
    }
    TomlArray array = table.getArray(key);
    if (array == null) {
      return List.of();
    }
    List<String> values = new ArrayList<>(array.size());
    for (int i = 0; i < array.size(); i++) {
      String value = array.getString(i);
      if (value != null) {
        values.add(value);
      }
    }
    return List.copyOf(values);
  }

  private static List<String> splitCommaList(String text) {
    return java.util.Arrays.stream(text.split(","))
        .map(String::trim)
        .filter(value -> !value.isEmpty())
        .toList();
  }

  private static String requireString(TomlTable table, String key) {
    String value = table.getString(key);
    if (value == null) {
      throw new IllegalArgumentException("missing required string key " + key);
    }
    return value;
  }

  private record Frontmatter(String meta, String body) {
  }
}
