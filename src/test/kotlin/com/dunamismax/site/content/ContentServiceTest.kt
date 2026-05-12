package com.dunamismax.site.content

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ContentServiceTest {

    private val service = ContentService(MarkdownRenderer()).also { it.load() }

    @Test
    fun `projects load with at least one entry`() {
        assertThat(service.projects()).isNotEmpty
    }

    @Test
    fun `projects are sorted by category position then name`() {
        val byCategory = service.projectsByCategory()
        byCategory.values.forEach { group ->
            val sorted = group.sortedWith(compareBy({ it.position }, { it.name }))
            assertThat(group).containsExactlyElementsOf(sorted)
        }
    }

    @Test
    fun `featured projects are a subset of all projects`() {
        val all = service.projects().toSet()
        assertThat(all).containsAll(service.featuredProjects())
        assertThat(service.featuredProjects()).allMatch { it.featured }
    }

    @Test
    fun `about html is rendered from markdown`() {
        val html = service.aboutHtml()
        assertThat(html).contains("Java 25 LTS")
        assertThat(html).contains("PostgreSQL")
    }
}
