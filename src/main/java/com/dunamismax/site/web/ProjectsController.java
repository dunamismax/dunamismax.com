package com.dunamismax.site.web;

import com.dunamismax.site.content.ContentService;
import com.dunamismax.site.content.PageMeta;
import com.dunamismax.site.content.ProjectCategory;
import java.util.Arrays;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ProjectsController {

  private final ContentService content;
  private final PageModel pageModel;

  public ProjectsController(ContentService content, PageModel pageModel) {
    this.content = content;
    this.pageModel = pageModel;
  }

  @GetMapping("/projects")
  public String projects(Model model) {
    pageModel.apply(model, new PageMeta(
        "/projects",
        "Projects · dunamismax",
        "Selected work by Stephen Sawyer in Rust, PostgreSQL, Python automation, and self-hosted software.",
        "projects"));
    var grouped = content.projectsByCategory().entrySet().stream()
        .filter(entry -> !entry.getValue().isEmpty())
        .toList();
    model.addAttribute("groups", grouped);
    model.addAttribute("categories", Arrays.asList(ProjectCategory.values()));
    return "pages/projects";
  }
}
