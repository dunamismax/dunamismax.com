package com.dunamismax.site.content

import org.commonmark.ext.autolink.AutolinkExtension
import org.commonmark.ext.gfm.tables.TablesExtension
import org.commonmark.parser.Parser
import org.commonmark.renderer.html.HtmlRenderer
import org.springframework.stereotype.Component

@Component
class MarkdownRenderer {
    private val extensions = listOf(TablesExtension.create(), AutolinkExtension.create())
    private val parser: Parser = Parser.builder().extensions(extensions).build()
    private val renderer: HtmlRenderer = HtmlRenderer.builder()
        .extensions(extensions)
        .softbreak("\n")
        .build()

    fun render(markdown: String): String = renderer.render(parser.parse(markdown))
}
