package com.dunamismax.site.web

import com.dunamismax.site.config.SiteProperties
import com.dunamismax.site.content.PageMeta
import org.springframework.stereotype.Component
import org.springframework.ui.Model

/**
 * Populates every page model with `page`, `site`, and computed OG / canonical
 * fields so the shared Thymeleaf layout has everything it needs.
 */
@Component
class PageModel(private val site: SiteProperties) {

    fun apply(model: Model, page: PageMeta): Model {
        val canonical = "https://${site.host}${page.path}"
        val ogDescription =
            if (page.description == site.defaultDescription) site.ogDescription else page.description
        model.addAttribute("page", page)
        model.addAttribute("site", site)
        model.addAttribute("canonical", canonical)
        model.addAttribute("ogDescription", ogDescription)
        model.addAttribute("currentYear", java.time.Year.now().value)
        return model
    }
}
