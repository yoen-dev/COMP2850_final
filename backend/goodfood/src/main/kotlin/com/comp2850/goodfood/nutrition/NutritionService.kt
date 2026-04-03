package com.comp2850.goodfood.nutrition

import com.comp2850.goodfood.diary.InMemoryDiaryRepository
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service
class NutritionService(
    private val diaryRepository: InMemoryDiaryRepository,
    private val foodNutritionRepository: InMemoryFoodNutritionRepository
) {

    fun getMyNutritionSummary(authentication: Authentication, date: String?): NutritionSummary {
        val userEmail = authentication.name

        val entries = if (date.isNullOrBlank()) {
            diaryRepository.findByUserEmail(userEmail)
        } else {
            diaryRepository.findByUserEmailAndDate(userEmail, date)
        }

        var totalCalories = 0
        var totalProtein = 0.0
        var totalSugar = 0.0
        var matchedEntries = 0
        val unmatchedFoods = mutableListOf<String>()

        for (entry in entries) {
            val nutrition = foodNutritionRepository.findByFoodName(entry.foodName)

            if (nutrition != null) {
                totalCalories += nutrition.calories
                totalProtein += nutrition.protein
                totalSugar += nutrition.sugar
                matchedEntries++
            } else {
                unmatchedFoods.add(entry.foodName)
            }
        }

        return NutritionSummary(
            totalCalories = totalCalories,
            totalProtein = totalProtein,
            totalSugar = totalSugar,
            matchedEntries = matchedEntries,
            unmatchedFoods = unmatchedFoods.distinct()
        )
    }
}