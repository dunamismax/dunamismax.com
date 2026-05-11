package com.dunamismax.site.content

import jakarta.annotation.PostConstruct
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Service

@Service
class ContentService(
    private val markdown: MarkdownRenderer,
) {
    private lateinit var projectsCache: List<Project>
    private lateinit var postsCache: List<Post>
    private var aboutHtmlCache: String? = null

    @PostConstruct
    fun load() {
        projectsCache = ContentLoader.loadProjects(ClassPathResource("content/projects.toml"))
        postsCache = ContentLoader.loadPosts("classpath*:content/posts/*.md", markdown::render)
        aboutHtmlCache = ContentLoader.loadPageMarkdown(ClassPathResource("content/pages/about.md"))
            ?.let(markdown::render)
    }

    fun projects(): List<Project> = projectsCache

    fun projectsByCategory(): Map<ProjectCategory, List<Project>> =
        ProjectCategory.entries.associateWith { cat -> projectsCache.filter { it.category == cat } }

    fun featuredProjects(): List<Project> = projectsCache.filter { it.featured }

    fun publishedPosts(): List<Post> = postsCache.filter { !it.draft }

    fun postBySlug(slug: String): Post? = postsCache.firstOrNull { it.slug == slug && !it.draft }

    fun latestPost(): Post? = publishedPosts().firstOrNull()

    fun aboutHtml(): String = aboutHtmlCache ?: error("missing content/pages/about.md")
}
