package com.comp2850.goodfood.diary

data class DiaryEntry(
    val id: Long,
    val userEmail: String,
    val foodName: String,
    val quantity: String,
    val mealType: String,
    val diaryDate: String
)