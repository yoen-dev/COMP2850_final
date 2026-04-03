package com.comp2850.goodfood.diary

import jakarta.validation.constraints.NotBlank

data class CreateDiaryRequest(
    @field:NotBlank(message = "foodName cannot be blank")
    val foodName: String,

    @field:NotBlank(message = "quantity cannot be blank")
    val quantity: String,

    @field:NotBlank(message = "mealType cannot be blank")
    val mealType: String,

    @field:NotBlank(message = "diaryDate cannot be blank")
    val diaryDate: String
)