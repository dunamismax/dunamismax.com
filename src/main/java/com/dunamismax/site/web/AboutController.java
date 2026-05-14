package com.dunamismax.site.web;

import com.dunamismax.site.config.SiteProperties;
import com.dunamismax.site.content.ContentService;
import com.dunamismax.site.content.PageMeta;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AboutController {

  private final ContentService content;
  private final SiteProperties site;
  private final PageModel pageModel;

  public AboutController(ContentService content, SiteProperties site, PageModel pageModel) {
    this.content = content;
    this.site = site;
    this.pageModel = pageModel;
  }

  @GetMapping("/about")
  public String about(Model model) {
    pageModel.apply(model, new PageMeta("/about", "About · dunamismax", site.defaultDescription(), "about"));
    model.addAttribute("aboutHtml", content.aboutHtml());
    return "pages/about";
  }
}
