class PagesController < ApplicationController
  def home
    @latest_post = Post.published.recent.first
    @featured_projects = Project.featured.ordered.limit(4)
  end

  def about
  end

  def contact
  end
end
