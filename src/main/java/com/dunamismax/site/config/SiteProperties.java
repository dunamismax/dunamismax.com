package com.dunamismax.site.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "site")
public record SiteProperties(
    String host,
    String title,
    String defaultDescription,
    String ogDescription) {

  public SiteProperties {
    if (host == null || host.isBlank()) {
      host = "dunamismax.com";
    }
    if (title == null || title.isBlank()) {
      title = "Stephen Sawyer · dunamismax";
    }
    if (defaultDescription == null || defaultDescription.isBlank()) {
      defaultDescription = "Stephen Sawyer is an engineer working in Go, PostgreSQL, and "
          + "server-rendered web apps - open source advocate and privacy/security-minded "
          + "builder with 15 years in IT.";
    }
    if (ogDescription == null || ogDescription.isBlank()) {
      ogDescription = "One language, one database, one VM. Go, PostgreSQL, "
          + "server-rendered HTML. Open source, self-hosting, privacy, and security.";
    }
  }
}
