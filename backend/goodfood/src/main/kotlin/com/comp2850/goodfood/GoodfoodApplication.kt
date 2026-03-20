package com.comp2850.goodfood

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration
import org.springframework.boot.runApplication

@SpringBootApplication(
    exclude = [
        DataSourceAutoConfiguration::class,
        HibernateJpaAutoConfiguration::class
    ]
)
class GoodfoodApplication

fun main(args: Array<String>) {
    runApplication<GoodfoodApplication>(*args)
}