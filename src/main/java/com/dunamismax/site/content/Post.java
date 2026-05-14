package com.dunamismax.site.content;

import java.time.LocalDate;
import java.util.List;
import java.util.regex.Pattern;

public record Post(
    String slug,
    String title,
    String description,
    LocalDate publishedOn,
    List<String> tags,
    String bodyMarkdown,
    String bodyHtml,
    boolean draft) {

  private static final Pattern WORD_SPLIT = Pattern.compile("\\W+");

  public Post {
    tags = List.copyOf(tags);
  }

  public int readingTimeMinutes() {
    long words = WORD_SPLIT.splitAsStream(bodyMarkdown)
        .filter(word -> !word.isBlank())
        .count();
    return Math.max(1, (int) ((words + 219) / 220));
  }

  public int getReadingTimeMinutes() {
    return readingTimeMinutes();
  }
}
