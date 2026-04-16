package com.comp2850.goodfood.nutrition

import com.comp2850.goodfood.diary.InMemoryDiaryRepository
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class NutritionService(
    private val diaryRepository: InMemoryDiaryRepository,
    private val foodNutritionRepository: InMemoryFoodNutritionRepository
) {

    fun getMyNutritionSummary(authentication: Authentication, date: LocalDate?): NutritionSummary {
        val userEmail = authentication.name

        val entries = if (date == null) {
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

    fun getMyNutritionFeedback(authentication: Authentication, date: LocalDate?): NutritionFeedback {
        val summary = getMyNutritionSummary(authentication, date)
        val messages = mutableListOf<String>()

        if (summary.matchedEntries == 0 && summary.unmatchedFoods.isEmpty()) {
            messages.add("Record at least one meal to receive nutrition feedback.")
            return NutritionFeedback(messages)
        }

        if (summary.totalSugar > 25) {
            messages.add("Your sugar intake looks high. Try lower-sugar options such as milk, eggs, or plain foods instead of sweet snacks or drinks.")
        }

        if (summary.totalProtein < 10) {
            messages.add("Your protein intake may be too low. Try adding foods like eggs, milk, or other protein-rich foods.")
        }

        if (summary.totalCalories > 600) {
            messages.add("Your calorie intake is quite high for the selected records. Check portion size and try to balance high-calorie foods with lighter options.")
        }

        if (summary.totalCalories < 150 && summary.matchedEntries > 0) {
            messages.add("Your total calorie intake looks quite low for the selected records. Make sure you are eating enough balanced meals.")
        }

        if (summary.unmatchedFoods.isNotEmpty()) {
            messages.add("Some foods could not be analysed: ${summary.unmatchedFoods.joinToString(", ")}. Try using simpler or more standard food names.")
        }

        if (messages.isEmpty()) {
            messages.add("Your nutrition summary looks balanced based on the foods we could analyse. Keep maintaining this pattern.")
        }

        return NutritionFeedback(messages)
    }
}