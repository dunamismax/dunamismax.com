package com.dunamismax.site.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TrailingSlashRedirectFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String path = request.getRequestURI();
    if (path.length() > 1 && path.endsWith("/")) {
      String trimmed = path.replaceFirst("/+$", "");
      String query = request.getQueryString();
      String target = query == null || query.isEmpty() ? trimmed : trimmed + "?" + query;
      response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
      response.setHeader("Location", target);
      response.setHeader("Cache-Control", "no-store");
      return;
    }
    filterChain.doFilter(request, response);
  }
}
