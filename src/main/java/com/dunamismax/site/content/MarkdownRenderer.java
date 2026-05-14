package com.dunamismax.site.content;

import java.util.List;
import org.commonmark.Extension;
import org.commonmark.ext.autolink.AutolinkExtension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.stereotype.Component;

@Component
public class MarkdownRenderer {

  private final Parser parser;
  private final HtmlRenderer renderer;

  public MarkdownRenderer() {
    List<Extension> extensions = List.of(TablesExtension.create(), AutolinkExtension.create());
    parser = Parser.builder().extensions(extensions).build();
    renderer = HtmlRenderer.builder()
        .extensions(extensions)
        .softbreak("\n")
        .build();
  }

  public String render(String markdown) {
    return renderer.render(parser.parse(markdown));
  }
}
