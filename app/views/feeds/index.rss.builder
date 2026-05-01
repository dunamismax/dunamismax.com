xml.instruct! :xml, version: "1.0"
xml.rss version: "2.0", "xmlns:atom" => "http://www.w3.org/2005/Atom" do
  xml.channel do
    xml.title "dunamismax · Blog"
    xml.description "Notes on building, shipping, and self-hosting software. Mostly Ruby on Rails."
    xml.link request.base_url
    xml.language "en"
    xml.lastBuildDate(@posts.first&.published_on&.to_time&.rfc2822)
    xml.tag!("atom:link",
      href: request.original_url,
      rel: "self",
      type: "application/rss+xml")

    @posts.each do |post|
      xml.item do
        xml.title post.title
        xml.link "#{request.base_url}#{post_path(post)}"
        xml.guid "#{request.base_url}#{post_path(post)}", isPermaLink: "true"
        xml.pubDate post.published_on.to_time.rfc2822
        xml.description post.description
      end
    end
  end
end
