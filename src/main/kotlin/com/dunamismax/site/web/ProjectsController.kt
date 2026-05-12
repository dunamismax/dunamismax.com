package com.dunamismax.site.web

import com.dunamismax.site.content.ContentService
import com.dunamismax.site.content.PageMeta
import com.dunamismax.site.content.ProjectCategory
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class ProjectsController(
    private val content: ContentService,
    private val pageModel: PageModel,
) {
    @GetMapping("/projects")
    fun projects(model: Model): String {
        pageModel.apply(
            model,
            PageMeta(
                path = "/projects",
                title = "Projects · dunamismax",
                description =
                    "Selected work by Stephen Sawyer in Java, PostgreSQL, and self-hosted software.",
                section = "projects",
            ),
        )
        val grouped = content.projectsByCategory().filter { it.value.isNotEmpty() }
        model.addAttribute("groups", grouped.entries.toList())
        model.addAttribute("categories", ProjectCategory.entries)
        return "pages/projects"
    }
}
