package com.dunamismax.site.web;

import com.dunamismax.site.config.SiteProperties;
import com.dunamismax.site.content.ContentService;
import com.dunamismax.site.content.PageMeta;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

  private final ContentService content;
  private final SiteProperties site;
  private final PageModel pageModel;

  public HomeController(ContentService content, SiteProperties site, PageModel pageModel) {
    this.content = content;
    this.site = site;
    this.pageModel = pageModel;
  }

  @GetMapping("/")
  public String home(Model model) {
    pageModel.apply(model, new PageMeta("/", site.title(), site.defaultDescription(), "home"));
    model.addAttribute("featured", content.featuredProjects());
    model.addAttribute("latest", content.latestPost());
    return "pages/home";
  }
}
