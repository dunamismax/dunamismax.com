require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  test "projects index renders" do
    get projects_path
    assert_response :success
    assert_select "h1", text: /Selected public work/
  end
end
