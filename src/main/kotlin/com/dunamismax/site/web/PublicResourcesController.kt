package com.dunamismax.site.web

import org.springframework.http.MediaType
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ResponseBody

@Controller
class PublicResourcesController {

    @GetMapping("/robots.txt", produces = [MediaType.TEXT_PLAIN_VALUE])
    @ResponseBody
    fun robots(): String = "User-agent: *\nAllow: /\n"

    @GetMapping("/manifest.webmanifest", produces = ["application/manifest+json"])
    @ResponseBody
    fun manifest(): String = """
        {
          "name": "dunamismax",
          "short_name": "dunamismax",
          "icons": [
            { "src": "/icon.svg", "type": "image/svg+xml", "sizes": "512x512" },
            { "src": "/icon.svg", "type": "image/svg+xml", "sizes": "512x512", "purpose": "maskable" }
          ],
          "start_url": "/",
          "display": "standalone",
          "scope": "/",
          "description": "Engineering work by Stephen Sawyer in Java, PostgreSQL, and self-hosted software.",
          "theme_color": "#0a0a0b",
          "background_color": "#0a0a0b"
        }
    """.trimIndent() + "\n"
}
