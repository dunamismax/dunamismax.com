# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_30_120100) do
  create_table "posts", force: :cascade do |t|
    t.text "body_html", null: false
    t.datetime "created_at", null: false
    t.string "description", null: false
    t.boolean "published", default: false, null: false
    t.date "published_on"
    t.string "slug", null: false
    t.string "tags", default: ""
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["published"], name: "index_posts_on_published"
    t.index ["published_on"], name: "index_posts_on_published_on"
    t.index ["slug"], name: "index_posts_on_slug", unique: true
  end

  create_table "projects", force: :cascade do |t|
    t.string "category", null: false
    t.datetime "created_at", null: false
    t.boolean "featured", default: false, null: false
    t.string "name", null: false
    t.integer "position", default: 100, null: false
    t.string "repo"
    t.string "slug", null: false
    t.string "stack", default: ""
    t.string "status", null: false
    t.string "tagline", null: false
    t.datetime "updated_at", null: false
    t.string "url"
    t.string "visibility", default: "public", null: false
    t.index ["category"], name: "index_projects_on_category"
    t.index ["featured"], name: "index_projects_on_featured"
    t.index ["slug"], name: "index_projects_on_slug", unique: true
  end
end
