package com.comp2850.goodfood.diary

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDate

data class CreateDiaryRequest(
    @field:NotBlank(message = "foodName cannot be blank")
    val foodName: String,

    @field:NotBlank(message = "quantity cannot be blank")
    val quantity: String,

    @field:NotNull(message = "servings is required")
    @field:DecimalMin(value = "0.1", message = "servings must be at least 0.1")
    val servings: Double?,

    @field:NotNull(message = "mealType is required")
    val mealType: MealType?,

    @field:NotNull(message = "diaryDate is required")
    @field:JsonFormat(pattern = "yyyy-MM-dd")
    val diaryDate: LocalDate?,

    val kcal: Int? = null,
    val protein: Double? = null,
    val carbs: Double? = null,
    val fat: Double? = null,
    val sugar: Double? = null
)