class ProjectsController < ApplicationController
  def index
    @projects_by_category = Project.ordered.group_by(&:category)
  end
end
