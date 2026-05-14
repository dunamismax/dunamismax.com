package com.dunamismax.site.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component("dates")
public class DateFormatting {

  private final DateTimeFormatter shortFormat = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);
  private final DateTimeFormatter longFormat = DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH);

  public String shortDate(LocalDate date) {
    return date.format(shortFormat);
  }

  public String longDate(LocalDate date) {
    return date.format(longFormat);
  }
}
