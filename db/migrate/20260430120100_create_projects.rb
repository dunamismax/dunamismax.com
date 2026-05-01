class CreateProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.string  :slug,       null: false
      t.string  :name,       null: false
      t.string  :tagline,    null: false
      t.string  :category,   null: false
      t.string  :status,     null: false
      t.string  :visibility, null: false, default: "public"
      t.string  :repo
      t.string  :url
      t.string  :stack,      default: ""
      t.integer :position,   null: false, default: 100
      t.boolean :featured,   null: false, default: false

      t.timestamps
    end

    add_index :projects, :slug, unique: true
    add_index :projects, :category
    add_index :projects, :featured
  end
end
