require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "home renders" do
    get root_path
    assert_response :success
    assert_select "h1", text: /Rails software that stays yours/
  end

  test "about renders" do
    get about_path
    assert_response :success
    assert_select "h1", text: /Ruby on Rails is the default/
  end

  test "contact renders" do
    get contact_path
    assert_response :success
  end
end
