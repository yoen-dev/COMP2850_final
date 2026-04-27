package com.comp2850.goodfood.diary

import com.comp2850.goodfood.nutrition.FoodNutritionStore
import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.validation.Valid
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus
import java.time.LocalDate
import kotlin.math.roundToInt

@RestController
@RequestMapping("/api/diary")
class ApiDiaryController(
    private val diaryService: DiaryService,
    private val foodNutritionStore: FoodNutritionStore
) {

    @GetMapping
    fun getDiary(
        authentication: Authentication,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        date: LocalDate?
    ): ApiDiaryListResponse {
        val entries = diaryService.getMyDiaryEntries(authentication, date)

        val meals = entries.map { entry ->
            // Use stored nutrition values; fall back to nutrition DB for legacy entries
            val nutrition = if (entry.kcal == null) foodNutritionStore.findByFoodName(entry.foodName) else null
            val kcal    = entry.kcal    ?: ((nutrition?.calories ?: 0.0) * entry.servings).roundToInt()
            val protein = entry.protein ?: round2((nutrition?.protein ?: 0.0) * entry.servings)
            val carbs   = entry.carbs   ?: 0.0
            val fat     = entry.fat     ?: 0.0
            val sugar   = entry.sugar   ?: round2((nutrition?.sugar ?: 0.0) * entry.servings)

            ApiDiaryMealResponse(
                id = entry.id,
                date = entry.diaryDate,
                mealType = entry.mealType.name,
                time = null,
                foodName = entry.foodName,
                kcal = kcal,
                protein = protein,
                carbs = carbs,
                fat = fat,
                sugar = sugar,
                quantity = entry.quantity,
                servings = entry.servings
            )
        }

        return ApiDiaryListResponse(meals = meals)
    }

    @PostMapping
    fun createDiary(
        authentication: Authentication,
        @Valid @RequestBody request: ApiDiaryCreateRequest
    ): Map<String, Any?> {
        if (request.kcal != null && request.kcal <= 0.0) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "kcal must be greater than 0")
        }

        val servingsValue = request.servings ?: 1.0
        val quantityValue = request.quantity ?: if (servingsValue == 1.0) "1 serving" else "$servingsValue servings"

        val createRequest = CreateDiaryRequest(
            foodName = request.foodName,
            quantity = quantityValue,
            servings = servingsValue,
            mealType = parseMealType(request.mealType),
            diaryDate = request.date,
            kcal    = request.kcal?.toInt(),
            protein = request.protein,
            carbs   = request.carbs,
            fat     = request.fat,
            sugar   = request.sugar
        )

        val result = diaryService.createDiary(createRequest, authentication)

        return mapOf("id" to result.entry.id)
    }

    @DeleteMapping("/{id}")
    fun deleteDiary(
        @PathVariable id: Long,
        authentication: Authentication
    ): ResponseEntity<Void> {
        diaryService.deleteMyDiaryEntry(id, authentication)
        return ResponseEntity.noContent().build()
    }

    private fun parseMealType(value: String): MealType {
        return try {
            MealType.valueOf(value.trim().uppercase())
        } catch (e: IllegalArgumentException) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid mealType")
        }
    }

    private fun round2(value: Double): Double {
        return kotlin.math.round(value * 100) / 100
    }
}

data class ApiDiaryListResponse(
    val meals: List<ApiDiaryMealResponse>
)

data class ApiDiaryMealResponse(
    val id: Long,
    val date: LocalDate,
    val mealType: String,
    val time: String?,
    val foodName: String,
    val kcal: Int,
    val protein: Double,
    val carbs: Double,
    val fat: Double,
    val sugar: Double,
    val quantity: String,
    val servings: Double
)

data class ApiDiaryCreateRequest(
    @field:NotNull(message = "date is required")
    @field:JsonFormat(pattern = "yyyy-MM-dd")
    val date: LocalDate?,

    @field:NotBlank(message = "mealType cannot be blank")
    val mealType: String,

    val time: String? = null,

    @field:NotBlank(message = "foodName cannot be blank")
    val foodName: String,

    @field:DecimalMin(value = "0.1", message = "kcal must be greater than 0")
    val kcal: Double? = null,

    val protein: Double? = null,
    val carbs: Double? = null,
    val fat: Double? = null,
    val sugar: Double? = null,

    val quantity: String? = null,

    @field:DecimalMin(value = "0.1", message = "servings must be at least 0.1")
    val servings: Double? = null
)