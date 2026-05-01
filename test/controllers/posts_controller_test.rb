require "test_helper"

class PostsControllerTest < ActionDispatch::IntegrationTest
  test "blog index renders" do
    get posts_path
    assert_response :success
  end

  test "blog show renders for a published post" do
    get post_path(posts(:hello_rails))
    assert_response :success
    assert_select "h1", "Hello, Rails"
  end
end
