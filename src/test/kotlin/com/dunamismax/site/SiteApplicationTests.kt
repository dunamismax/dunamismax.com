package com.dunamismax.site

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig::class)
@ActiveProfiles("test")
class SiteApplicationTests {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Test
    fun `context loads`() {
    }

    @Test
    fun `home page renders with hero copy`() {
        mockMvc.get("/").andExpect {
            status { isOk() }
            content { contentTypeCompatibleWith("text/html") }
            content { string(org.hamcrest.Matchers.containsString("Software you can read at 2 AM")) }
        }
    }

    @Test
    fun `projects page lists known project`() {
        mockMvc.get("/projects").andExpect {
            status { isOk() }
            content { string(org.hamcrest.Matchers.containsString("callrift")) }
        }
    }

    @Test
    fun `about page renders prose body`() {
        mockMvc.get("/about").andExpect {
            status { isOk() }
            content { string(org.hamcrest.Matchers.containsString("One language. One database. One VM.")) }
        }
    }

    @Test
    fun `contact page lists email card`() {
        mockMvc.get("/contact").andExpect {
            status { isOk() }
            content { string(org.hamcrest.Matchers.containsString("dunamismax@tutamail.com")) }
        }
    }

    @Test
    fun `blog index renders`() {
        mockMvc.get("/blog").andExpect { status { isOk() } }
    }

    @Test
    fun `feed serves rss xml`() {
        mockMvc.get("/feed.xml").andExpect {
            status { isOk() }
            content { contentTypeCompatibleWith("application/xml") }
        }
    }

    @Test
    fun `robots txt served`() {
        mockMvc.get("/robots.txt").andExpect {
            status { isOk() }
            content { string("User-agent: *\nAllow: /\n") }
        }
    }

    @Test
    fun `manifest served`() {
        mockMvc.get("/manifest.webmanifest").andExpect {
            status { isOk() }
        }
    }

    @Test
    fun `unknown path returns 404 page`() {
        mockMvc.get("/no-such-path-exists").andExpect {
            status { isNotFound() }
        }
    }

    @Test
    fun `trailing slash redirects to canonical path`() {
        mockMvc.get("/projects/").andExpect {
            status { isEqualTo(301) }
            header { string("Location", "/projects") }
        }
    }

    @Test
    fun `trailing slash preserves query string`() {
        mockMvc.get("/blog/?tag=java").andExpect {
            status { isEqualTo(301) }
            header { string("Location", "/blog?tag=java") }
        }
    }

    @Test
    fun `health endpoint reports UP`() {
        val result = mockMvc.get("/actuator/health").andReturn()
        assertThat(result.response.status).isEqualTo(200)
        assertThat(result.response.contentAsString).contains("\"status\":\"UP\"")
    }
}
