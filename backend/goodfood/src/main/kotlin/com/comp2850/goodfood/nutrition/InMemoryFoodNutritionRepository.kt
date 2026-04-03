package com.comp2850.goodfood.nutrition

import org.springframework.stereotype.Repository

@Repository
class InMemoryFoodNutritionRepository {

    private val foods = listOf(
        FoodNutrition("Apple", 95, 0.5, 19.0),
        FoodNutrition("Banana", 105, 1.3, 14.0),
        FoodNutrition("Rice", 206, 4.3, 0.1),
        FoodNutrition("Milk", 122, 8.0, 12.0),
        FoodNutrition("Egg", 78, 6.0, 0.6),
        FoodNutrition("Bread", 79, 3.0, 1.4)
    )

    fun findByFoodName(foodName: String): FoodNutrition? {
        return foods.find { it.foodName.equals(foodName, ignoreCase = true) }
    }
}