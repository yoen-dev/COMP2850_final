package com.comp2850.goodfood.diary

import java.time.LocalDate

data class DiaryEntry(
    val id: Long,
    val userEmail: String,
    val foodName: String,
    val quantity: String,
    val servings: Double,
    val mealType: MealType,
    val diaryDate: LocalDate,
    val kcal: Int? = null,
    val protein: Double? = null,
    val carbs: Double? = null,
    val fat: Double? = null,
    val sugar: Double? = null
)