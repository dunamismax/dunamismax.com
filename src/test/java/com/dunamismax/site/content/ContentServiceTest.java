package com.dunamismax.site.content;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Comparator;
import org.junit.jupiter.api.Test;

class ContentServiceTest {

  private final ContentService service = service();

  @Test
  void projectsLoadWithAtLeastOneEntry() {
    assertThat(service.projects()).isNotEmpty();
  }

  @Test
  void projectsAreSortedByCategoryPositionThenName() {
    service.projectsByCategory().values().forEach(group -> {
      var sorted = group.stream()
          .sorted(Comparator.comparingInt(Project::position).thenComparing(Project::name))
          .toList();
      assertThat(group).containsExactlyElementsOf(sorted);
    });
  }

  @Test
  void featuredProjectsAreASubsetOfAllProjects() {
    var all = service.projects();
    assertThat(all).containsAll(service.featuredProjects());
    assertThat(service.featuredProjects()).allMatch(Project::featured);
  }

  @Test
  void aboutHtmlIsRenderedFromMarkdown() {
    String html = service.aboutHtml();
    assertThat(html).contains("<strong>Go</strong>");
    assertThat(html).contains("<strong>C</strong>");
    assertThat(html).contains("PostgreSQL");
  }

  private static ContentService service() {
    var service = new ContentService(new MarkdownRenderer());
    service.load();
    return service;
  }
}
