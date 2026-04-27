package com.comp2850.goodfood.diary

import com.comp2850.goodfood.nutrition.FoodNutritionStore
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate

@Service
class DiaryService(
    private val diaryRepository: DiaryStore,
    private val foodNutritionRepository: FoodNutritionStore
) {

    fun createDiary(request: CreateDiaryRequest, authentication: Authentication): DiarySaveResponse {
        val userEmail = authentication.name

        // Use provided nutrition values; fall back to nutrition DB if not supplied
        val nutrition = foodNutritionRepository.findByFoodName(request.foodName)
        val srv = request.servings!!
        val kcal    = request.kcal    ?: nutrition?.let { ((it.calories) * srv).toInt() }
        val protein = request.protein ?: nutrition?.let { (it.protein  * srv) }
        val sugar   = request.sugar   ?: nutrition?.let { (it.sugar    * srv) }
        val carbs   = request.carbs
        val fat     = request.fat

        val entry = DiaryEntry(
            id = 0L,
            userEmail = userEmail,
            foodName = request.foodName,
            quantity = request.quantity,
            servings = srv,
            mealType = request.mealType!!,
            diaryDate = request.diaryDate!!,
            kcal = kcal,
            protein = protein,
            carbs = carbs,
            fat = fat,
            sugar = sugar
        )

        val savedEntry = diaryRepository.save(entry)
        return buildDiarySaveResponse(savedEntry)
    }

    fun getMyDiaryEntries(authentication: Authentication, date: LocalDate?): List<DiaryEntry> {
        val userEmail = authentication.name

        val entries = if (date == null) {
            diaryRepository.findByUserEmail(userEmail)
        } else {
            diaryRepository.findByUserEmailAndDate(userEmail, date)
        }

        return entries.sortedWith(
            compareByDescending<DiaryEntry> { it.diaryDate }
                .thenBy { it.mealType.ordinal }
        )
    }

    fun deleteMyDiaryEntry(id: Long, authentication: Authentication) {
        val userEmail = authentication.name
        val entry = diaryRepository.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "diary entry not found")

        if (entry.userEmail != userEmail) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "you cannot delete this diary entry")
        }

        diaryRepository.delete(entry)
    }

    fun updateMyDiaryEntry(
        id: Long,
        request: UpdateDiaryRequest,
        authentication: Authentication
    ): DiarySaveResponse {
        val userEmail = authentication.name
        val existingEntry = diaryRepository.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "diary entry not found")

        if (existingEntry.userEmail != userEmail) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "you cannot update this diary entry")
        }

        val updatedEntry = existingEntry.copy(
            foodName = request.foodName,
            quantity = request.quantity,
            servings = request.servings!!,
            mealType = request.mealType!!,
            diaryDate = request.diaryDate!!
        )

        val savedEntry = diaryRepository.update(updatedEntry)
        return buildDiarySaveResponse(savedEntry)
    }

    private fun buildDiarySaveResponse(entry: DiaryEntry): DiarySaveResponse {
        val nutritionMatched = foodNutritionRepository.findByFoodName(entry.foodName) != null

        val message = if (nutritionMatched) {
            null
        } else {
            "Diary entry saved, but this food is not in the nutrition dataset yet. It may not appear fully in nutrition summary, feedback, or trends."
        }

        return DiarySaveResponse(
            entry = entry,
            nutritionMatched = nutritionMatched,
            message = message
        )
    }
}