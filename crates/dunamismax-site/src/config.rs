use std::{env, net::SocketAddr, time::Duration};

const DEFAULT_ADDR: &str = "127.0.0.1:3000";
const DEFAULT_DATABASE_URL: &str = "postgres://dunamismax:dunamismax@localhost:5432/dunamismax";
const DEFAULT_DATABASE_MAX_CONNECTIONS: u32 = 10;
const DEFAULT_DATABASE_ACQUIRE_TIMEOUT_SECS: u64 = 5;
const DEFAULT_LOG: &str = "dunamismax_site=info,tower_http=info";

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Config {
    pub addr: SocketAddr,
    pub database: DatabaseConfig,
    pub log_filter: String,
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
    pub acquire_timeout: Duration,
    pub migrate_on_startup: bool,
}

impl Config {
    pub fn from_env() -> Result<Self, ConfigError> {
        Self::from_env_reader(|key| env::var(key).ok())
    }

    fn from_env_reader(
        mut read: impl FnMut(&'static str) -> Option<String>,
    ) -> Result<Self, ConfigError> {
        let addr = read("DUNAMISMAX_SITE_ADDR").unwrap_or_else(|| DEFAULT_ADDR.to_owned());
        let log_filter = read("DUNAMISMAX_SITE_LOG").unwrap_or_else(|| DEFAULT_LOG.to_owned());
        let database_url = read("DUNAMISMAX_DATABASE_URL")
            .or_else(|| read("DATABASE_URL").and_then(normalize_database_url))
            .unwrap_or_else(|| DEFAULT_DATABASE_URL.to_owned());
        let max_connections = read("DUNAMISMAX_DATABASE_MAX_CONNECTIONS")
            .map(|value| parse_u32("DUNAMISMAX_DATABASE_MAX_CONNECTIONS", value))
            .transpose()?
            .unwrap_or(DEFAULT_DATABASE_MAX_CONNECTIONS);
        let acquire_timeout_secs = read("DUNAMISMAX_DATABASE_ACQUIRE_TIMEOUT_SECS")
            .map(|value| parse_u64("DUNAMISMAX_DATABASE_ACQUIRE_TIMEOUT_SECS", value))
            .transpose()?
            .unwrap_or(DEFAULT_DATABASE_ACQUIRE_TIMEOUT_SECS);
        let migrate_on_startup = read("DUNAMISMAX_DATABASE_MIGRATE")
            .map(|value| parse_bool("DUNAMISMAX_DATABASE_MIGRATE", &value))
            .transpose()?
            .unwrap_or(true);

        Ok(Self {
            addr: addr.parse().map_err(|source| ConfigError::InvalidAddress {
                value: addr,
                source,
            })?,
            database: DatabaseConfig {
                url: database_url,
                max_connections,
                acquire_timeout: Duration::from_secs(acquire_timeout_secs),
                migrate_on_startup,
            },
            log_filter,
        })
    }
}

fn normalize_database_url(value: String) -> Option<String> {
    if value.starts_with("postgres://") || value.starts_with("postgresql://") {
        Some(value)
    } else {
        None
    }
}

fn parse_u32(name: &'static str, value: String) -> Result<u32, ConfigError> {
    value
        .parse()
        .map_err(|source| ConfigError::InvalidUnsignedInteger {
            name,
            value,
            source,
        })
}

fn parse_u64(name: &'static str, value: String) -> Result<u64, ConfigError> {
    value
        .parse()
        .map_err(|source| ConfigError::InvalidUnsignedInteger {
            name,
            value,
            source,
        })
}

fn parse_bool(name: &'static str, value: &str) -> Result<bool, ConfigError> {
    match value {
        "1" | "true" | "TRUE" | "yes" | "YES" | "on" | "ON" => Ok(true),
        "0" | "false" | "FALSE" | "no" | "NO" | "off" | "OFF" => Ok(false),
        _ => Err(ConfigError::InvalidBoolean {
            name,
            value: value.to_owned(),
        }),
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("invalid DUNAMISMAX_SITE_ADDR `{value}`: {source}")]
    InvalidAddress {
        value: String,
        source: std::net::AddrParseError,
    },
    #[error("invalid {name} `{value}`: {source}")]
    InvalidUnsignedInteger {
        name: &'static str,
        value: String,
        source: std::num::ParseIntError,
    },
    #[error("invalid {name} `{value}`: expected true or false")]
    InvalidBoolean { name: &'static str, value: String },
}

#[cfg(test)]
mod tests {
    use super::Config;

    #[test]
    fn defaults_to_localhost_port_3000() {
        let config = Config::from_env_reader(|_| None).expect("default config should parse");

        assert_eq!(config.addr.to_string(), "127.0.0.1:3000");
        assert_eq!(config.log_filter, "dunamismax_site=info,tower_http=info");
        assert_eq!(
            config.database.url,
            "postgres://dunamismax:dunamismax@localhost:5432/dunamismax"
        );
        assert_eq!(config.database.max_connections, 10);
        assert_eq!(config.database.acquire_timeout.as_secs(), 5);
        assert!(config.database.migrate_on_startup);
    }

    #[test]
    fn reads_config_from_environment() {
        let config = Config::from_env_reader(|key| match key {
            "DUNAMISMAX_SITE_ADDR" => Some("127.0.0.1:3100".to_owned()),
            "DUNAMISMAX_SITE_LOG" => Some("debug".to_owned()),
            "DUNAMISMAX_DATABASE_URL" => {
                Some("postgres://site:secret@db.internal:5432/site".to_owned())
            }
            "DUNAMISMAX_DATABASE_MAX_CONNECTIONS" => Some("4".to_owned()),
            "DUNAMISMAX_DATABASE_ACQUIRE_TIMEOUT_SECS" => Some("2".to_owned()),
            "DUNAMISMAX_DATABASE_MIGRATE" => Some("false".to_owned()),
            _ => None,
        })
        .expect("environment config should parse");

        assert_eq!(config.addr.to_string(), "127.0.0.1:3100");
        assert_eq!(config.log_filter, "debug");
        assert_eq!(
            config.database.url,
            "postgres://site:secret@db.internal:5432/site"
        );
        assert_eq!(config.database.max_connections, 4);
        assert_eq!(config.database.acquire_timeout.as_secs(), 2);
        assert!(!config.database.migrate_on_startup);
    }

    #[test]
    fn ignores_jdbc_database_url_fallback() {
        let config = Config::from_env_reader(|key| match key {
            "DATABASE_URL" => Some("jdbc:postgresql://127.0.0.1:5432/dunamismax".to_owned()),
            _ => None,
        })
        .expect("config should fall back to the Rust database URL");

        assert_eq!(
            config.database.url,
            "postgres://dunamismax:dunamismax@localhost:5432/dunamismax"
        );
    }
}
