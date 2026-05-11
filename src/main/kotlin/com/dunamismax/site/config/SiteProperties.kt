package com.dunamismax.site.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "site")
data class SiteProperties(
    val host: String = "dunamismax.com",
    val title: String = "Stephen Sawyer · dunamismax",
    val defaultDescription: String =
        "Stephen Sawyer is an engineer working in Kotlin on the JVM and " +
            "PostgreSQL — open source advocate and privacy/security-minded " +
            "builder with 15 years in IT.",
    val ogDescription: String =
        "One language, one database, one VM. Kotlin on the JVM, PostgreSQL, " +
            "server-rendered HTML. Open source, self-hosting, privacy, and security.",
)
