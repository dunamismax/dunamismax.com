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
      defaultDescription = "Stephen Sawyer is a Rust-first engineer and IT operator "
          + "focused on high-performance systems, crypto infrastructure, cryptography, "
          + "PostgreSQL, Python automation, privacy, and security.";
    }
    if (ogDescription == null || ogDescription.isBlank()) {
      ogDescription = "Rust-first systems, PostgreSQL-backed data, Python automation, "
          + "cryptography, encryption, self-hosting, privacy, and security.";
    }
  }
}
