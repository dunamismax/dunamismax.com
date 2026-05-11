package com.dunamismax.site.web

import com.dunamismax.site.config.SiteProperties
import com.dunamismax.site.content.PageMeta
import jakarta.servlet.RequestDispatcher
import jakarta.servlet.http.HttpServletRequest
import org.springframework.boot.webmvc.error.ErrorController
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.RequestMapping

@Controller
class SiteErrorController(
    private val site: SiteProperties,
    private val pageModel: PageModel,
) : ErrorController {

    @RequestMapping("/error")
    fun handle(request: HttpServletRequest, model: Model): String {
        val statusAttr = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE)
        val status = (statusAttr as? Int) ?: HttpStatus.INTERNAL_SERVER_ERROR.value()
        val isNotFound = status == HttpStatus.NOT_FOUND.value()
        pageModel.apply(
            model,
            PageMeta(
                path = "/404",
                title = if (isNotFound) "404 · dunamismax" else "Error · dunamismax",
                description = site.defaultDescription,
                section = "",
            ),
        )
        model.addAttribute("status", status)
        return "pages/error"
    }
}
