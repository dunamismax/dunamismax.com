package com.dunamismax.site.web

import com.dunamismax.site.content.PageMeta
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping

data class ContactCard(
    val title: String,
    val value: String,
    val href: String,
    val external: Boolean,
    val detail: String,
)

@Controller
class ContactController(private val pageModel: PageModel) {
    private val contacts: List<ContactCard> = listOf(
        ContactCard(
            "Email", "dunamismax@tutamail.com", "mailto:dunamismax@tutamail.com", false,
            "Best first stop. Project questions, work, or anything that does not need to be public.",
        ),
        ContactCard(
            "Signal", "Signal",
            "https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph",
            true,
            "For direct, end-to-end-encrypted outreach when email is not the right shape.",
        ),
        ContactCard(
            "GitHub", "github.com/dunamismax", "https://github.com/dunamismax", true,
            "Public discussion around code, issues, and pull requests across the projects on this site.",
        ),
        ContactCard(
            "Codeberg", "codeberg.org/dunamismax", "https://codeberg.org/dunamismax", true,
            "Mirrored public source and a better home for open, inspectable code.",
        ),
        ContactCard(
            "Reddit", "u/DunamisMax", "https://www.reddit.com/user/DunamisMax/", true,
            "Where I talk about MTG and self-hosting more than anything else.",
        ),
        ContactCard(
            "Site source", "github.com/dunamismax/dunamismax.com",
            "https://github.com/dunamismax/dunamismax.com", true,
            "Source for this site is open. Issues and PRs welcome.",
        ),
    )

    @GetMapping("/contact")
    fun contact(model: Model): String {
        pageModel.apply(
            model,
            PageMeta(
                path = "/contact",
                title = "Contact · dunamismax",
                description =
                    "How to reach Stephen Sawyer by email, Signal, GitHub, Codeberg, or public source.",
                section = "contact",
            ),
        )
        model.addAttribute("contacts", contacts)
        return "pages/contact"
    }
}
