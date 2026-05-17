# dunamismax.com -- developer entrypoints.
#
# Standardized on `just` so every project in the workspace has the same shape.
# Run `just` to list everything.

set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

default:
    @just --list

# ---- local dev ----

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

# Run the Rust site.
site-dev:
    cargo run -p dunamismax-site

# Run the Rust site.
dev: site-dev

# ---- Rust build, test, ship ----

# Check Rust formatting.
fmt:
    cargo fmt --all --check

# Run Rust clippy with warnings denied.
check:
    cargo clippy --workspace --all-targets --all-features -- -D warnings

# Run Rust tests.
test:
    cargo test --workspace --all-features

# Build Rust crates in debug mode.
build:
    cargo build --workspace

# Build the Rust site release binary.
site-release:
    cargo build -p dunamismax-site --release

# Validate the Rust content loader against the repository content tree.
content-validate:
    cargo test -p dunamismax-site content::tests::loads_repository_content_tree --all-features

# Run the normal Rust verification gate.
rust-check: fmt check test content-validate build site-release

# Remove Rust build outputs.
clean:
    cargo clean

# ---- Java production baseline fallback ----

# Install Node deps for the Java/Tailwind baseline.
java-install:
    npm ci

# Build the Java-era Tailwind stylesheet once.
java-css:
    npm run build:css

# Watch and rebuild the Java-era Tailwind stylesheet.
java-css-watch:
    npm run watch:css

# Run the Java app with the dev profile.
java-dev: db-up
    SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run

# Run the Java Maven build and tests.
java-build:
    ./mvnw clean verify

# Run Java tests.
java-test:
    ./mvnw test

# Compile Java sources and tests.
java-fmt:
    ./mvnw compile test-compile

# Package the Java fat jar.
java-jar:
    ./mvnw package

# Run the built Java fat jar against a local Postgres on 5432.
java-run-jar:
    java -jar target/dunamismax-site-0.1.0.jar

# Remove Java and Tailwind build outputs.
java-clean:
    ./mvnw clean
    rm -rf src/main/resources/static/css/site.css node_modules
