package com.dunamismax.site.content;

import java.util.Arrays;

public enum ProjectStatus {
  ACTIVE("active", "Active"),
  SHIPPED("shipped", "Shipped"),
  PHASE_0("phase-0", "Phase 0"),
  LEGACY("legacy", "Legacy");

  private final String slug;
  private final String label;

  ProjectStatus(String slug, String label) {
    this.slug = slug;
    this.label = label;
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

  public static ProjectStatus fromSlug(String slug) {
    return Arrays.stream(values())
        .filter(status -> status.slug.equals(slug))
        .findFirst()
        .orElseThrow(() -> new IllegalArgumentException("unknown project status: " + slug));
  }
}
