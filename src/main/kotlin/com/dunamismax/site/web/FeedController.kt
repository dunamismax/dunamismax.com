package com.dunamismax.site.web

import com.dunamismax.site.config.SiteProperties
import com.dunamismax.site.content.ContentService
import com.dunamismax.site.content.Post
import org.springframework.http.MediaType
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ResponseBody
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.Locale

@Controller
class FeedController(
    private val content: ContentService,
    private val site: SiteProperties,
) {
    private val rfc1123 = DateTimeFormatter.RFC_1123_DATE_TIME.withLocale(Locale.ENGLISH)

    @GetMapping("/feed.xml", produces = [MediaType.APPLICATION_XML_VALUE])
    @ResponseBody
    fun feed(): String {
        val posts = content.publishedPosts()
        val base = "https://${site.host}"
        val updated = posts.firstOrNull()?.let { datetime(it) } ?: nowRfc1123()
        val items = posts.joinToString("\n") { itemXml(it, base) }
        return buildString {
            append("""<?xml version="1.0" encoding="UTF-8"?>""")
            append('\n')
            append("""<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">""")
            append('\n')
            append("  <channel>\n")
            append("    <title>").append(escape("dunamismax · Blog")).append("</title>\n")
            append("    <link>").append(escape(base)).append("/</link>\n")
            append("    <description>")
                .append(escape(site.defaultDescription))
                .append("</description>\n")
            append("""    <atom:link href="""")
                .append(escape("$base/feed.xml"))
                .append("""" rel="self" type="application/rss+xml"/>""")
            append('\n')
            append("    <language>en</language>\n")
            append("    <lastBuildDate>").append(updated).append("</lastBuildDate>\n")
            append(items)
            append("\n  </channel>\n</rss>\n")
        }
    }

    private fun itemXml(post: Post, base: String): String {
        val url = "$base/blog/${post.slug}"
        return buildString {
            append("    <item>\n")
            append("      <title>").append(escape(post.title)).append("</title>\n")
            append("      <link>").append(escape(url)).append("</link>\n")
            append("      <guid isPermaLink=\"true\">").append(escape(url)).append("</guid>\n")
            append("      <pubDate>").append(datetime(post)).append("</pubDate>\n")
            append("      <description>")
                .append(escape(post.description))
                .append("</description>\n")
            append("      <content:encoded><![CDATA[")
                .append(post.bodyHtml)
                .append("]]></content:encoded>\n")
            append("    </item>")
        }
    }

    private fun datetime(post: Post): String =
        post.publishedOn.atStartOfDay().atOffset(ZoneOffset.UTC).format(rfc1123)

    private fun nowRfc1123(): String = OffsetDateTime.now(ZoneOffset.UTC).format(rfc1123)

    private fun escape(text: String): String = text
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&apos;")
}
