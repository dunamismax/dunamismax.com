package com.dunamismax.site.web;

import com.dunamismax.site.content.ContentService;
import com.dunamismax.site.content.PageMeta;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

@Controller
public class BlogController {

  private final ContentService content;
  private final PageModel pageModel;

  public BlogController(ContentService content, PageModel pageModel) {
    this.content = content;
    this.pageModel = pageModel;
  }

  @GetMapping("/blog")
  public String index(Model model) {
    pageModel.apply(model, new PageMeta(
        "/blog",
        "Blog · dunamismax",
        "Notes on Rust systems, PostgreSQL, Python automation, cryptography, and self-hosted operations.",
        "blog"));
    model.addAttribute("posts", content.publishedPosts());
    return "pages/blog/index";
  }

  @GetMapping("/blog/{slug}")
  public String post(@PathVariable String slug, Model model) {
    var post = content.postBySlug(slug);
    if (post == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    pageModel.apply(model, new PageMeta(
        "/blog/" + post.slug(),
        post.title() + " · dunamismax",
        post.description(),
        "blog",
        "article"));
    model.addAttribute("post", post);
    return "pages/blog/post";
  }
}
