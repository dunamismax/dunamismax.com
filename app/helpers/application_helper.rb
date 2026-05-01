module ApplicationHelper
  def page_title(text = nil)
    parts = [ "dunamismax" ]
    parts.unshift(text) if text.present?
    parts.join(" · ")
  end

  def reading_time(text)
    words = text.to_s.scan(/\w+/).length
    minutes = [ (words / 220.0).ceil, 1 ].max
    "#{minutes} min read"
  end

  def project_status_label(status)
    {
      "active"   => "Active",
      "shipped"  => "Shipped",
      "phase-0"  => "Phase 0",
      "legacy"   => "Legacy"
    }[status] || status.to_s.titleize
  end

  def project_category_label(category)
    {
      "apps"            => "Applications",
      "infrastructure"  => "Infrastructure",
      "developer-tools" => "Developer tools",
      "reference"       => "Reference"
    }[category] || category.to_s.titleize
  end

  def project_category_description(category)
    {
      "apps"            => "Products and services that solve a real problem end to end.",
      "infrastructure"  => "Self-hosted services, networking, and operations work.",
      "developer-tools" => "Tooling, automation, and operator-facing utilities.",
      "reference"       => "Workbooks, profiles, and reference repos that exist to be read."
    }[category]
  end
end
