package com.dunamismax.site.web;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class PublicResourcesController {

  @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
  @ResponseBody
  public String robots() {
    return "User-agent: *\nAllow: /\n";
  }

  @GetMapping(value = "/manifest.webmanifest", produces = "application/manifest+json")
  @ResponseBody
  public String manifest() {
    return """
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
          "description": "Engineering work by Stephen Sawyer in Rust, PostgreSQL, Python automation, and self-hosted software.",
          "theme_color": "#0a0a0b",
          "background_color": "#0a0a0b"
        }
        """;
  }
}
