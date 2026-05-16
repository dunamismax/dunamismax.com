package com.dunamismax.site;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
@ActiveProfiles("test")
class SiteApplicationTests {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void contextLoads() {
  }

  @Test
  void homePageRendersWithHeroCopy() throws Exception {
    mockMvc.perform(get("/"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith("text/html"))
        .andExpect(content().string(containsString("Fast systems you can inspect and own")));
  }

  @Test
  void projectsPageListsKnownProject() throws Exception {
    mockMvc.perform(get("/projects"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("FileFerry")));
  }

  @Test
  void aboutPageRendersProseBody() throws Exception {
    mockMvc.perform(get("/about"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("Rust first. PostgreSQL underneath. Python everywhere useful.")));
  }

  @Test
  void contactPageListsEmailCard() throws Exception {
    mockMvc.perform(get("/contact"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("dunamismax@tutamail.com")));
  }

  @Test
  void blogIndexRenders() throws Exception {
    mockMvc.perform(get("/blog")).andExpect(status().isOk());
  }

  @Test
  void feedServesRssXml() throws Exception {
    mockMvc.perform(get("/feed.xml"))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith("application/xml"));
  }

  @Test
  void robotsTxtServed() throws Exception {
    mockMvc.perform(get("/robots.txt"))
        .andExpect(status().isOk())
        .andExpect(content().string("User-agent: *\nAllow: /\n"));
  }

  @Test
  void manifestServed() throws Exception {
    mockMvc.perform(get("/manifest.webmanifest"))
        .andExpect(status().isOk());
  }

  @Test
  void unknownPathReturns404Page() throws Exception {
    mockMvc.perform(get("/no-such-path-exists"))
        .andExpect(status().isNotFound());
  }

  @Test
  void trailingSlashRedirectsToCanonicalPath() throws Exception {
    mockMvc.perform(get("/projects/"))
        .andExpect(status().isMovedPermanently())
        .andExpect(header().string("Location", "/projects"));
  }

  @Test
  void trailingSlashPreservesQueryString() throws Exception {
    mockMvc.perform(get("/blog/?tag=java"))
        .andExpect(status().isMovedPermanently())
        .andExpect(header().string("Location", "/blog?tag=java"));
  }

  @Test
  void healthEndpointReportsUp() throws Exception {
    var result = mockMvc.perform(get("/actuator/health")).andReturn();
    assertThat(result.getResponse().getStatus()).isEqualTo(200);
    assertThat(result.getResponse().getContentAsString()).contains("\"status\":\"UP\"");
  }
}
