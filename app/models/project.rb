class Project < ApplicationRecord
  CATEGORIES = %w[apps infrastructure developer-tools reference].freeze
  STATUSES   = %w[active shipped phase-0 legacy].freeze

  validates :slug, :name, :tagline, :category, :status, presence: true
  validates :slug, uniqueness: true

  scope :ordered,  -> { order(:position, :name) }
  scope :featured, -> { where(featured: true) }

  def stack_list
    stack.to_s.split(",").map(&:strip).reject(&:empty?)
  end

  def public_repo?
    visibility.to_s == "public" && repo.present?
  end
end
