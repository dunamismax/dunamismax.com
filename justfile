# dunamismax.com -- developer entrypoints.
#
# Standardized on `just` so every project in the workspace has the same shape.
# Run `just` to list everything.

set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

# ---- local dev ----

# Install Node deps for Tailwind.
install:
    npm ci

# Start PostgreSQL 18 in the background.
db-up:
    docker compose up -d postgres

# Stop PostgreSQL.
db-down:
    docker compose down

# Tail the database logs.
db-logs:
    docker compose logs -f postgres

# Open psql against the local database.
psql:
    docker compose exec postgres psql -U dunamismax -d dunamismax

# Build the Tailwind stylesheet once.
css:
    npm run build:css

# Watch and rebuild the Tailwind stylesheet.
css-watch:
    npm run watch:css

# Run the Rust site scaffold.
site-dev:
    cargo run -p dunamismax-site

# Run the app with the dev profile.
java-dev: db-up
    SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run

# Run the app with the dev profile.
dev: java-dev

# ---- build, test, ship ----

# Check Rust formatting.
rust-fmt:
    cargo fmt --all --check

# Run Rust clippy with warnings denied.
rust-clippy:
    cargo clippy --workspace --all-targets --all-features -- -D warnings

# Run Rust tests.
rust-test:
    cargo test --workspace --all-features

# Build Rust crates.
rust-build:
    cargo build --workspace

# Validate the Rust content loader against the repository content tree.
content-validate:
    cargo test -p dunamismax-site content::tests::loads_repository_content_tree --all-features

# Run the normal Rust scaffold verification gate.
rust-check: rust-fmt rust-clippy rust-test rust-build

java-build:
    ./mvnw clean verify

build: java-build

java-test:
    ./mvnw test

test: java-test

java-fmt:
    ./mvnw compile test-compile

fmt: java-fmt

java-jar:
    ./mvnw package

jar: java-jar

# Run the built fat jar against a local Postgres on 5432.
run-jar:
    java -jar target/dunamismax-site-0.1.0.jar

java-clean:
    ./mvnw clean
    rm -rf src/main/resources/static/css/site.css node_modules

clean: java-clean
