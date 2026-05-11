package com.dunamismax.site.content

import org.springframework.core.io.Resource
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.tomlj.Toml
import org.tomlj.TomlParseResult
import org.tomlj.TomlTable
import java.nio.charset.StandardCharsets
import java.time.LocalDate

internal object ContentLoader {
    private const val FRONTMATTER_DELIM = "+++"

    fun loadProjects(resource: Resource): List<Project> {
        require(resource.exists()) { "missing ${resource.description}" }
        val parsed: TomlParseResult = resource.inputStream.use { Toml.parse(it) }
        require(!parsed.hasErrors()) {
            "invalid TOML in ${resource.description}: " + parsed.errors().joinToString { it.toString() }
        }
        val rawArray = parsed.getArray("projects")
            ?: error("missing [[projects]] array in ${resource.description}")

        val seen = mutableSetOf<String>()
        val projects = ArrayList<Project>(rawArray.size())
        for (i in 0 until rawArray.size()) {
            val table: TomlTable = rawArray.getTable(i)
                ?: error("project at index $i is not a table")
            val slug = table.requireString("slug")
            require(seen.add(slug)) { "duplicate project slug: $slug" }
            val stackRaw = table.get("stack")
            val stack: List<String> = when (stackRaw) {
                is String -> stackRaw.split(",").map { it.trim() }.filter { it.isNotEmpty() }
                else -> {
                    val arr = table.getArray("stack")
                    if (arr == null) emptyList()
                    else (0 until arr.size()).map { arr.getString(it) }
                }
            }
            projects.add(
                Project(
                    slug = slug,
                    name = table.requireString("name"),
                    category = ProjectCategory.fromSlug(table.requireString("category")),
                    status = ProjectStatus.fromSlug(table.requireString("status")),
                    position = table.getLong("position")?.toInt() ?: 999,
                    featured = table.getBoolean("featured") ?: false,
                    visibility = table.getString("visibility") ?: "public",
                    tagline = table.requireString("tagline"),
                    stack = stack,
                    repo = table.getString("repo") ?: "",
                    url = table.getString("url") ?: "",
                ),
            )
        }
        return projects.sortedWith(compareBy({ it.position }, { it.name }))
    }

    fun loadPosts(pattern: String, render: (String) -> String): List<Post> {
        val resolver = PathMatchingResourcePatternResolver(javaClass.classLoader)
        val resources = runCatching { resolver.getResources(pattern) }.getOrDefault(emptyArray())
        val posts = resources
            .filter { it.filename?.endsWith(".md") == true }
            .map { parsePost(it, render) }
        return posts.sortedByDescending { it.publishedOn }
    }

    fun loadPageMarkdown(resource: Resource): String? {
        if (!resource.exists()) return null
        return resource.inputStream.use { String(it.readAllBytes(), StandardCharsets.UTF_8) }
    }

    private fun parsePost(resource: Resource, render: (String) -> String): Post {
        val text = resource.inputStream.use { String(it.readAllBytes(), StandardCharsets.UTF_8) }
        val (fmText, body) = splitFrontmatter(text, resource.description)
        val meta = Toml.parse(fmText)
        require(!meta.hasErrors()) {
            "invalid frontmatter in ${resource.description}: " + meta.errors().joinToString { it.toString() }
        }
        val slug = meta.getString("slug")
            ?: (resource.filename?.removeSuffix(".md") ?: error("post resource has no filename"))
        listOf("title", "description", "published_on").forEach {
            require(meta.contains(it)) { "${resource.description}: missing frontmatter key $it" }
        }
        val tagsRaw = meta.get("tags")
        val tags: List<String> = when (tagsRaw) {
            is String -> tagsRaw.split(",").map { it.trim() }.filter { it.isNotEmpty() }
            else -> {
                val arr = meta.getArray("tags")
                if (arr == null) emptyList()
                else (0 until arr.size()).map { arr.getString(it) }
            }
        }
        val published = parseDate(meta.get("published_on"))
        return Post(
            slug = slug,
            title = meta.requireString("title"),
            description = meta.requireString("description"),
            publishedOn = published,
            tags = tags,
            bodyMarkdown = body,
            bodyHtml = render(body),
            draft = meta.getBoolean("draft") ?: false,
        )
    }

    private fun splitFrontmatter(text: String, label: String): Pair<String, String> {
        require(text.startsWith(FRONTMATTER_DELIM)) {
            "$label: missing TOML frontmatter (delimit with $FRONTMATTER_DELIM)"
        }
        val end = text.indexOf("\n$FRONTMATTER_DELIM", FRONTMATTER_DELIM.length)
        require(end != -1) { "$label: frontmatter opened with $FRONTMATTER_DELIM but never closed" }
        val fm = text.substring(FRONTMATTER_DELIM.length, end).trim()
        var rest = text.substring(end + ("\n$FRONTMATTER_DELIM").length)
        if (rest.startsWith("\n")) rest = rest.substring(1)
        return fm to rest
    }

    private fun parseDate(value: Any?): LocalDate = when (value) {
        is LocalDate -> value
        is java.time.LocalDateTime -> value.toLocalDate()
        is String -> LocalDate.parse(value)
        else -> error("unsupported published_on value: $value")
    }

    private fun TomlTable.requireString(key: String): String =
        getString(key) ?: error("missing required string key $key")
}
