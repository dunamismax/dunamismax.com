class Post < ApplicationRecord
  validates :slug, :title, :description, :body_html, presence: true
  validates :slug, uniqueness: true

  scope :published, -> { where(published: true) }
  scope :recent,    -> { order(published_on: :desc, id: :desc) }

  def to_param
    slug
  end

  def tag_list
    tags.to_s.split(",").map(&:strip).reject(&:empty?)
  end
end
