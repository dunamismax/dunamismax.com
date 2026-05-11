package com.dunamismax.site

import com.dunamismax.site.config.SiteProperties
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties(SiteProperties::class)
class SiteApplication

fun main(args: Array<String>) {
    runApplication<SiteApplication>(*args)
}
