package com.dunamismax.site.web

import com.dunamismax.site.content.ContentService
import com.dunamismax.site.content.PageMeta
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.server.ResponseStatusException

@Controller
class BlogController(
    private val content: ContentService,
    private val pageModel: PageModel,
) {
    @GetMapping("/blog")
    fun index(model: Model): String {
        pageModel.apply(
            model,
            PageMeta(
                path = "/blog",
                title = "Blog · dunamismax",
                description =
                    "Notes on building, shipping, and self-hosting software in Kotlin " +
                        "on the JVM and PostgreSQL.",
                section = "blog",
            ),
        )
        model.addAttribute("posts", content.publishedPosts())
        return "pages/blog/index"
    }

    @GetMapping("/blog/{slug}")
    fun post(@PathVariable slug: String, model: Model): String {
        val post = content.postBySlug(slug)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        pageModel.apply(
            model,
            PageMeta(
                path = "/blog/${post.slug}",
                title = "${post.title} · dunamismax",
                description = post.description,
                section = "blog",
                ogType = "article",
            ),
        )
        model.addAttribute("post", post)
        return "pages/blog/post"
    }
}
