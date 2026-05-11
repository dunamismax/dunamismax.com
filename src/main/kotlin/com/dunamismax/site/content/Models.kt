package com.dunamismax.site.content

import java.time.LocalDate

enum class ProjectCategory(val slug: String, val label: String, val description: String) {
    APPS("apps", "Applications", "Products and services with clear data models and owned infrastructure."),
    INFRASTRUCTURE("infrastructure", "Infrastructure", "Self-hosted services, networking, and operations work."),
    DEVELOPER_TOOLS("developer-tools", "Developer tools", "Tooling, automation, and operator-facing utilities."),
    REFERENCE("reference", "Reference", "Profile, site, and source repos that explain the stack and operating surface.");

    companion object {
        fun fromSlug(slug: String): ProjectCategory =
            entries.firstOrNull { it.slug == slug }
                ?: error("unknown project category: $slug")
    }
}

enum class ProjectStatus(val slug: String, val label: String) {
    ACTIVE("active", "Active"),
    SHIPPED("shipped", "Shipped"),
    PHASE_0("phase-0", "Phase 0"),
    LEGACY("legacy", "Legacy");

    companion object {
        fun fromSlug(slug: String): ProjectStatus =
            entries.firstOrNull { it.slug == slug }
                ?: error("unknown project status: $slug")
    }
}

data class Project(
    val slug: String,
    val name: String,
    val category: ProjectCategory,
    val status: ProjectStatus,
    val position: Int,
    val featured: Boolean,
    val visibility: String,
    val tagline: String,
    val stack: List<String>,
    val repo: String,
    val url: String,
) {
    val publicRepo: Boolean get() = visibility == "public" && repo.isNotBlank()
}

data class Post(
    val slug: String,
    val title: String,
    val description: String,
    val publishedOn: LocalDate,
    val tags: List<String>,
    val bodyMarkdown: String,
    val bodyHtml: String,
    val draft: Boolean,
) {
    val readingTimeMinutes: Int by lazy {
        val words = bodyMarkdown.split(Regex("\\W+")).count { it.isNotBlank() }
        maxOf(1, (words + 219) / 220)
    }
}

data class PageMeta(
    val path: String,
    val title: String,
    val description: String,
    val section: String = "",
    val ogType: String = "website",
)
