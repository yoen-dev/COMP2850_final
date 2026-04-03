package com.comp2850.goodfood.nutrition

import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/nutrition")
class NutritionController(
    private val nutritionService: NutritionService
) {

    @GetMapping("/summary")
    fun getMyNutritionSummary(
        authentication: Authentication,
        @RequestParam(required = false) date: String?
    ): NutritionSummary {
        return nutritionService.getMyNutritionSummary(authentication, date)
    }
}