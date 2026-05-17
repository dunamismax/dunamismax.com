use chrono::{DateTime, Utc};
use sqlx::{PgPool, postgres::PgPoolOptions};
use uuid::Uuid;

use crate::config::DatabaseConfig;

#[derive(Debug, Clone)]
pub struct Database {
    pool: PgPool,
}

impl Database {
    pub async fn connect(config: &DatabaseConfig) -> Result<Self, DatabaseError> {
        let pool = PgPoolOptions::new()
            .max_connections(config.max_connections)
            .acquire_timeout(config.acquire_timeout)
            .connect(&config.url)
            .await?;

        if config.migrate_on_startup {
            run_migrations(&pool).await?;
        }

        Ok(Self { pool })
    }

    pub fn page_views(&self) -> PageViewRepository {
        PageViewRepository::new(self.pool.clone())
    }

    pub fn pool(&self) -> &PgPool {
        &self.pool
    }
}

pub async fn run_migrations(pool: &PgPool) -> Result<(), DatabaseError> {
    sqlx::migrate!("./migrations").run(pool).await?;
    Ok(())
}

#[derive(Debug, Clone)]
pub struct PageViewRepository {
    pool: PgPool,
}

impl PageViewRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn record_page_view(
        &self,
        input: NewPageView<'_>,
    ) -> Result<PageView, DatabaseError> {
        let page_view = sqlx::query_as::<_, PageView>(
            r#"
            INSERT INTO page_view (path, referrer, user_agent)
            VALUES ($1, $2, $3)
            RETURNING id, path, referrer, user_agent, viewed_at
            "#,
        )
        .bind(input.path)
        .bind(input.referrer)
        .bind(input.user_agent)
        .fetch_one(&self.pool)
        .await?;

        Ok(page_view)
    }

    pub async fn count_by_path(&self, path: &str) -> Result<i64, DatabaseError> {
        let count = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::bigint
            FROM page_view
            WHERE path = $1
            "#,
        )
        .bind(path)
        .fetch_one(&self.pool)
        .await?;

        Ok(count)
    }

    pub async fn recent(&self, limit: i64) -> Result<Vec<PageView>, DatabaseError> {
        let page_views = sqlx::query_as::<_, PageView>(
            r#"
            SELECT id, path, referrer, user_agent, viewed_at
            FROM page_view
            ORDER BY viewed_at DESC, id DESC
            LIMIT $1
            "#,
        )
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        Ok(page_views)
    }
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct NewPageView<'a> {
    pub path: &'a str,
    pub referrer: Option<&'a str>,
    pub user_agent: Option<&'a str>,
}

#[derive(Debug, Clone, Eq, PartialEq, sqlx::FromRow)]
pub struct PageView {
    pub id: Uuid,
    pub path: String,
    pub referrer: Option<String>,
    pub user_agent: Option<String>,
    pub viewed_at: DateTime<Utc>,
}

#[derive(Debug, thiserror::Error)]
pub enum DatabaseError {
    #[error("database connection failed: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("database migration failed: {0}")]
    Migration(#[from] sqlx::migrate::MigrateError),
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    use sqlx::{
        ConnectOptions, Connection, Executor,
        postgres::{PgConnectOptions, PgConnection},
    };

    #[tokio::test]
    #[ignore = "run with `just db-test` against a real PostgreSQL container"]
    async fn migrates_empty_database_and_records_page_views() {
        let admin_url = std::env::var("DUNAMISMAX_DATABASE_ADMIN_URL").unwrap_or_else(|_| {
            "postgres://dunamismax:dunamismax@localhost:5432/postgres".to_owned()
        });
        let test_db = format!("dunamismax_test_{}", Uuid::new_v4().simple());
        let test_url = database_url_for_database(&admin_url, &test_db);

        create_database(&admin_url, &test_db)
            .await
            .expect("test database should be created");

        let result = exercise_page_view_repository(&test_url).await;

        drop_database(&admin_url, &test_db)
            .await
            .expect("test database should be dropped");

        result.expect("migrations and repository should work against empty database");
    }

    async fn exercise_page_view_repository(database_url: &str) -> Result<(), DatabaseError> {
        let database = Database::connect(&DatabaseConfig {
            url: database_url.to_owned(),
            max_connections: 2,
            acquire_timeout: Duration::from_secs(5),
            migrate_on_startup: true,
        })
        .await?;
        let repo = database.page_views();

        let home = repo
            .record_page_view(NewPageView {
                path: "/",
                referrer: Some("https://example.com/"),
                user_agent: Some("integration-test"),
            })
            .await?;
        let about = repo
            .record_page_view(NewPageView {
                path: "/about",
                referrer: None,
                user_agent: Some("integration-test"),
            })
            .await?;

        assert_eq!(home.path, "/");
        assert_eq!(home.referrer.as_deref(), Some("https://example.com/"));
        assert_eq!(about.path, "/about");
        assert_eq!(repo.count_by_path("/").await?, 1);

        let recent = repo.recent(10).await?;
        assert_eq!(recent.len(), 2);
        assert!(recent.iter().any(|view| view.path == "/"));
        assert!(recent.iter().any(|view| view.path == "/about"));

        database.pool().close().await;
        Ok(())
    }

    async fn create_database(admin_url: &str, database_name: &str) -> Result<(), sqlx::Error> {
        let mut connection = PgConnection::connect(admin_url).await?;
        connection
            .execute(format!(r#"CREATE DATABASE "{database_name}""#).as_str())
            .await?;
        Ok(())
    }

    async fn drop_database(admin_url: &str, database_name: &str) -> Result<(), sqlx::Error> {
        let mut connection = PgConnection::connect(admin_url).await?;
        connection
            .execute(
                format!(
                    r#"
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = '{database_name}'
                    "#
                )
                .as_str(),
            )
            .await?;
        connection
            .execute(format!(r#"DROP DATABASE IF EXISTS "{database_name}""#).as_str())
            .await?;
        Ok(())
    }

    fn database_url_for_database(admin_url: &str, database_name: &str) -> String {
        let mut options: PgConnectOptions = admin_url.parse().expect("admin URL should parse");
        options = options.database(database_name);
        options.to_url_lossy().to_string()
    }
}
