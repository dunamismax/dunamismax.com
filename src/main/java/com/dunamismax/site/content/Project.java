package com.dunamismax.site.content;

import java.util.List;

public record Project(
    String slug,
    String name,
    ProjectCategory category,
    ProjectStatus status,
    int position,
    boolean featured,
    String visibility,
    String tagline,
    List<String> stack,
    String repo,
    String url) {

  public Project {
    stack = List.copyOf(stack);
  }

  public boolean publicRepo() {
    return "public".equals(visibility) && repo != null && !repo.isBlank();
  }

  public boolean isPublicRepo() {
    return publicRepo();
  }
}
