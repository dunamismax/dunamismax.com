package com.dunamismax.site.web

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
class TrailingSlashRedirectFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val path = request.requestURI
        if (path.length > 1 && path.endsWith("/")) {
            val trimmed = path.trimEnd('/').ifEmpty { "/" }
            val query = request.queryString
            val target = if (query.isNullOrEmpty()) trimmed else "$trimmed?$query"
            response.status = HttpServletResponse.SC_MOVED_PERMANENTLY
            response.setHeader("Location", target)
            response.setHeader("Cache-Control", "no-store")
            return
        }
        filterChain.doFilter(request, response)
    }
}
