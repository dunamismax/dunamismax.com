package com.dunamismax.site.web

import com.dunamismax.site.config.SiteProperties
import com.dunamismax.site.content.ContentService
import com.dunamismax.site.content.PageMeta
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class AboutController(
    private val content: ContentService,
    private val site: SiteProperties,
    private val pageModel: PageModel,
) {
    @GetMapping("/about")
    fun about(model: Model): String {
        pageModel.apply(
            model,
            PageMeta(
                path = "/about",
                title = "About · dunamismax",
                description = site.defaultDescription,
                section = "about",
            ),
        )
        model.addAttribute("aboutHtml", content.aboutHtml())
        return "pages/about"
    }
}
