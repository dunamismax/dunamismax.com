class FeedsController < ApplicationController
  def index
    @posts = Post.published.recent.limit(20)
    respond_to do |format|
      format.rss { render layout: false, content_type: "application/rss+xml" }
    end
  end

  def robots
    render plain: <<~ROBOTS, content_type: "text/plain"
      User-agent: *
      Allow: /

      Sitemap: https://dunamismax.com/feed.xml
    ROBOTS
  end
end
