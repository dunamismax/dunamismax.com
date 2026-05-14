package com.dunamismax.site.web;

import com.dunamismax.site.content.PageMeta;
import java.util.List;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ContactController {

  private final PageModel pageModel;
  private final List<ContactCard> contacts = List.of(
      new ContactCard(
          "Email", "dunamismax@tutamail.com", "mailto:dunamismax@tutamail.com", false,
          "Best first stop. Project questions, work, or anything that does not need to be public."),
      new ContactCard(
          "Signal", "Signal",
          "https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph",
          true,
          "For direct, end-to-end-encrypted outreach when email is not the right shape."),
      new ContactCard(
          "GitHub", "github.com/dunamismax", "https://github.com/dunamismax", true,
          "Public discussion around code, issues, and pull requests across the projects on this site."),
      new ContactCard(
          "Codeberg", "codeberg.org/dunamismax", "https://codeberg.org/dunamismax", true,
          "Mirrored public source and a better home for open, inspectable code."),
      new ContactCard(
          "Reddit", "u/DunamisMax", "https://www.reddit.com/user/DunamisMax/", true,
          "Where I talk about MTG and self-hosting more than anything else."),
      new ContactCard(
          "Site source", "github.com/dunamismax/dunamismax.com",
          "https://github.com/dunamismax/dunamismax.com", true,
          "Source for this site is open. Issues and PRs welcome."));

  public ContactController(PageModel pageModel) {
    this.pageModel = pageModel;
  }

  @GetMapping("/contact")
  public String contact(Model model) {
    pageModel.apply(model, new PageMeta(
        "/contact",
        "Contact · dunamismax",
        "How to reach Stephen Sawyer by email, Signal, GitHub, Codeberg, or public source.",
        "contact"));
    model.addAttribute("contacts", contacts);
    return "pages/contact";
  }
}
