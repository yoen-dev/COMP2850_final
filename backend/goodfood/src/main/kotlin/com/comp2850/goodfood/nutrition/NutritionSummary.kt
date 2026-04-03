package com.comp2850.goodfood.nutrition

data class NutritionSummary(
    val totalCalories: Int,
    val totalProtein: Double,
    val totalSugar: Double,
    val matchedEntries: Int,
    val unmatchedFoods: List<String>
)