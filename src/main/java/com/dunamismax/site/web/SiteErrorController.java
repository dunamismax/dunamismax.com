package com.dunamismax.site.web;

import com.dunamismax.site.config.SiteProperties;
import com.dunamismax.site.content.PageMeta;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SiteErrorController implements ErrorController {

  private final SiteProperties site;
  private final PageModel pageModel;

  public SiteErrorController(SiteProperties site, PageModel pageModel) {
    this.site = site;
    this.pageModel = pageModel;
  }

  @RequestMapping("/error")
  public String handle(HttpServletRequest request, Model model) {
    Object statusAttr = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
    int status = statusAttr instanceof Integer value ? value : HttpStatus.INTERNAL_SERVER_ERROR.value();
    boolean notFound = status == HttpStatus.NOT_FOUND.value();
    pageModel.apply(model, new PageMeta(
        "/404",
        notFound ? "404 · dunamismax" : "Error · dunamismax",
        site.defaultDescription(),
        ""));
    model.addAttribute("status", status);
    return "pages/error";
  }
}
