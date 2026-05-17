use std::{env, net::SocketAddr};

const DEFAULT_ADDR: &str = "127.0.0.1:3000";
const DEFAULT_LOG: &str = "dunamismax_site=info,tower_http=info";

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Config {
    pub addr: SocketAddr,
    pub log_filter: String,
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

        Ok(Self {
            addr: addr.parse().map_err(|source| ConfigError::InvalidAddress {
                value: addr,
                source,
            })?,
            log_filter,
        })
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("invalid DUNAMISMAX_SITE_ADDR `{value}`: {source}")]
    InvalidAddress {
        value: String,
        source: std::net::AddrParseError,
    },
}

#[cfg(test)]
mod tests {
    use super::Config;

    #[test]
    fn defaults_to_localhost_port_3000() {
        let config = Config::from_env_reader(|_| None).expect("default config should parse");

        assert_eq!(config.addr.to_string(), "127.0.0.1:3000");
        assert_eq!(config.log_filter, "dunamismax_site=info,tower_http=info");
    }

    #[test]
    fn reads_address_and_log_filter_from_environment() {
        let config = Config::from_env_reader(|key| match key {
            "DUNAMISMAX_SITE_ADDR" => Some("127.0.0.1:3100".to_owned()),
            "DUNAMISMAX_SITE_LOG" => Some("debug".to_owned()),
            _ => None,
        })
        .expect("environment config should parse");

        assert_eq!(config.addr.to_string(), "127.0.0.1:3100");
        assert_eq!(config.log_filter, "debug");
    }
}
