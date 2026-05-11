package com.dunamismax.site.web

import com.dunamismax.site.config.SiteProperties
import com.dunamismax.site.content.ContentService
import com.dunamismax.site.content.PageMeta
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

@Controller
class HomeController(
    private val content: ContentService,
    private val site: SiteProperties,
    private val pageModel: PageModel,
) {
    @GetMapping("/")
    fun home(model: Model): String {
        pageModel.apply(
            model,
            PageMeta(
                path = "/",
                title = site.title,
                description = site.defaultDescription,
                section = "home",
            ),
        )
        model.addAttribute("featured", content.featuredProjects())
        model.addAttribute("latest", content.latestPost())
        return "pages/home"
    }
}
