package com.dunamismax.site.content;

public record PageMeta(
    String path,
    String title,
    String description,
    String section,
    String ogType) {

  public PageMeta(String path, String title, String description, String section) {
    this(path, title, description, section, "website");
  }
}
