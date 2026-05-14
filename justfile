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

# Run the app with the dev profile.
dev: db-up
    SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run

# ---- build, test, ship ----

build:
    ./mvnw clean verify

test:
    ./mvnw test

fmt:
    ./mvnw compile test-compile

jar:
    ./mvnw package

# Run the built fat jar against a local Postgres on 5432.
run-jar:
    java -jar target/dunamismax-site-0.1.0.jar

clean:
    ./mvnw clean
    rm -rf src/main/resources/static/css/site.css node_modules
