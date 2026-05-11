package com.dunamismax.site.util

import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Component("dates")
class DateFormatting {
    private val short = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH)
    private val long = DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH)

    fun short(date: LocalDate): String = date.format(short)
    fun long(date: LocalDate): String = date.format(long)
}
