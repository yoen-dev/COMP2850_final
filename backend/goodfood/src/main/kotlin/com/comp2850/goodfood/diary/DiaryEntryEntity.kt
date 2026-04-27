package com.comp2850.goodfood.diary

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "diary_entries")
class DiaryEntryEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false)
    var userEmail: String = "",

    @Column(nullable = false)
    var foodName: String = "",

    @Column(nullable = false)
    var quantity: String = "",

    @Column(nullable = false)
    var servings: Double = 1.0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var mealType: MealType = MealType.BREAKFAST,

    @Column(nullable = false)
    var diaryDate: LocalDate = LocalDate.now(),

    @Column(nullable = true)
    var kcal: Int? = null,

    @Column(nullable = true)
    var protein: Double? = null,

    @Column(nullable = true)
    var carbs: Double? = null,

    @Column(nullable = true)
    var fat: Double? = null,

    @Column(nullable = true)
    var sugar: Double? = null
)