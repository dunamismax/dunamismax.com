require "test_helper"

class FeedsControllerTest < ActionDispatch::IntegrationTest
  test "rss feed renders" do
    get rss_feed_path
    assert_response :success
    assert_equal "application/rss+xml", response.media_type
  end

  test "robots.txt renders" do
    get robots_path
    assert_response :success
    assert_match(/User-agent: \*/, response.body)
  end
end
