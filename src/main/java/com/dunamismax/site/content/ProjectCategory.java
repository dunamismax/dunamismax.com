package com.dunamismax.site.content;

import java.util.Arrays;

public enum ProjectCategory {
  APPS("apps", "Applications", "Products and services with clear data models and owned infrastructure."),
  INFRASTRUCTURE("infrastructure", "Infrastructure", "Self-hosted services, networking, and operations work."),
  DEVELOPER_TOOLS("developer-tools", "Developer tools", "Tooling, automation, and operator-facing utilities."),
  REFERENCE("reference", "Reference", "Profile, site, and source repos that explain the stack and operating surface.");

  private final String slug;
  private final String label;
  private final String description;

  ProjectCategory(String slug, String label, String description) {
    this.slug = slug;
    this.label = label;
    this.description = description;
  }

  public String slug() {
    return slug;
  }

  public String getSlug() {
    return slug;
  }

  public String label() {
    return label;
  }

  public String getLabel() {
    return label;
  }

  public String description() {
    return description;
  }

  public String getDescription() {
    return description;
  }

  public static ProjectCategory fromSlug(String slug) {
    return Arrays.stream(values())
        .filter(category -> category.slug.equals(slug))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("unknown project category: " + slug));
  }
}
