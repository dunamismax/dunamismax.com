package com.dunamismax.site.web;

import com.dunamismax.site.config.SiteProperties;
import com.dunamismax.site.content.PageMeta;
import java.time.Year;
import org.springframework.stereotype.Component;
import org.springframework.ui.Model;

@Component
public class PageModel {

  private final SiteProperties site;

  public PageModel(SiteProperties site) {
    this.site = site;
  }

  public Model apply(Model model, PageMeta page) {
    String canonical = "https://" + site.host() + page.path();
    String ogDescription = page.description().equals(site.defaultDescription())
        ? site.ogDescription()
        : page.description();
    model.addAttribute("page", page);
    model.addAttribute("site", site);
    model.addAttribute("canonical", canonical);
    model.addAttribute("ogDescription", ogDescription);
    model.addAttribute("currentYear", Year.now().getValue());
    return model;
  }
}
