package com.dunamismax.site.content;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class ContentService {

  private final MarkdownRenderer markdown;
  private List<Project> projectsCache = List.of();
  private List<Post> postsCache = List.of();
  private String aboutHtmlCache;

  public ContentService(MarkdownRenderer markdown) {
    this.markdown = markdown;
  }

  @PostConstruct
  public void load() {
    projectsCache = ContentLoader.loadProjects(new ClassPathResource("content/projects.toml"));
    postsCache = ContentLoader.loadPosts("classpath*:content/posts/*.md", markdown::render);
    String aboutMarkdown = ContentLoader.loadPageMarkdown(new ClassPathResource("content/pages/about.md"));
    aboutHtmlCache = aboutMarkdown == null ? null : markdown.render(aboutMarkdown);
  }

  public List<Project> projects() {
    return projectsCache;
  }

  public Map<ProjectCategory, List<Project>> projectsByCategory() {
    Map<ProjectCategory, List<Project>> grouped = new LinkedHashMap<>();
    Arrays.stream(ProjectCategory.values())
        .forEach(category -> grouped.put(
            category,
            projectsCache.stream().filter(project -> project.category() == category).toList()));
    return grouped;
  }

  public List<Project> featuredProjects() {
    return projectsCache.stream().filter(Project::featured).toList();
  }

  public List<Post> publishedPosts() {
    return postsCache.stream().filter(post -> !post.draft()).toList();
  }

  public Post postBySlug(String slug) {
    return postsCache.stream()
        .filter(post -> post.slug().equals(slug) && !post.draft())
        .findFirst()
        .orElse(null);
  }

  public Post latestPost() {
    return publishedPosts().stream().findFirst().orElse(null);
  }

  public String aboutHtml() {
    if (aboutHtmlCache == null) {
      throw new IllegalStateException("missing content/pages/about.md");
    }
    return aboutHtmlCache;
  }
}
