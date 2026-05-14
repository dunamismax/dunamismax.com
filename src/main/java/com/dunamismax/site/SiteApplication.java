package com.dunamismax.site;

import com.dunamismax.site.config.SiteProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(SiteProperties.class)
public class SiteApplication {

  public static void main(String[] args) {
    SpringApplication.run(SiteApplication.class, args);
  }
}
