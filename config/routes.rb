Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  root "pages#home"

  get "about",   to: "pages#about",   as: :about
  get "contact", to: "pages#contact", as: :contact

  resources :projects, only: %i[index], path: "projects"
  resources :posts,    only: %i[index show], path: "blog", as: :posts

  get "feed.xml", to: "feeds#index", defaults: { format: :rss }, as: :rss_feed
  get "robots.txt", to: "feeds#robots", defaults: { format: :text }, as: :robots
end
