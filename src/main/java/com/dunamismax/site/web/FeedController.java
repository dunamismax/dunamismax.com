package com.dunamismax.site.web;

import com.dunamismax.site.config.SiteProperties;
import com.dunamismax.site.content.ContentService;
import com.dunamismax.site.content.Post;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class FeedController {

  private final ContentService content;
  private final SiteProperties site;
  private final DateTimeFormatter rfc1123 = DateTimeFormatter.RFC_1123_DATE_TIME.withLocale(Locale.ENGLISH);

  public FeedController(ContentService content, SiteProperties site) {
    this.content = content;
    this.site = site;
  }

  @GetMapping(value = "/feed.xml", produces = MediaType.APPLICATION_XML_VALUE)
  @ResponseBody
  public String feed() {
    var posts = content.publishedPosts();
    String base = "https://" + site.host();
    String updated = posts.isEmpty() ? nowRfc1123() : datetime(posts.getFirst());
    StringBuilder xml = new StringBuilder();
    xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.append("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:content=\"http://purl.org/rss/1.0/modules/content/\">\n");
    xml.append("  <channel>\n");
    xml.append("    <title>").append(escape("dunamismax · Blog")).append("</title>\n");
    xml.append("    <link>").append(escape(base)).append("/</link>\n");
    xml.append("    <description>").append(escape(site.defaultDescription())).append("</description>\n");
    xml.append("    <atom:link href=\"").append(escape(base + "/feed.xml")).append("\" rel=\"self\" type=\"application/rss+xml\"/>\n");
    xml.append("    <language>en</language>\n");
    xml.append("    <lastBuildDate>").append(updated).append("</lastBuildDate>\n");
    posts.forEach(post -> xml.append(itemXml(post, base)).append('\n'));
    xml.append("  </channel>\n</rss>\n");
    return xml.toString();
  }

  private String itemXml(Post post, String base) {
    String url = base + "/blog/" + post.slug();
    return """
        <item>
          <title>%s</title>
          <link>%s</link>
          <guid isPermaLink="true">%s</guid>
          <pubDate>%s</pubDate>
          <description>%s</description>
          <content:encoded><![CDATA[%s]]></content:encoded>
        </item>"""
        .formatted(
            escape(post.title()),
            escape(url),
            escape(url),
            datetime(post),
            escape(post.description()),
            post.bodyHtml())
        .indent(4)
        .stripTrailing();
  }

  private String datetime(Post post) {
    return post.publishedOn().atStartOfDay().atOffset(ZoneOffset.UTC).format(rfc1123);
  }

  private String nowRfc1123() {
    return OffsetDateTime.now(ZoneOffset.UTC).format(rfc1123);
  }

  private static String escape(String text) {
    return text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&apos;");
  }
}
