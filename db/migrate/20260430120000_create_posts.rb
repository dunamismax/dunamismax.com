class CreatePosts < ActiveRecord::Migration[8.1]
  def change
    create_table :posts do |t|
      t.string  :slug,         null: false
      t.string  :title,        null: false
      t.string  :description,  null: false
      t.text    :body_html,    null: false
      t.string  :tags,         default: ""
      t.date    :published_on
      t.boolean :published,    null: false, default: false

      t.timestamps
    end

    add_index :posts, :slug, unique: true
    add_index :posts, :published
    add_index :posts, :published_on
  end
end
