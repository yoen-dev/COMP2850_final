package com.comp2850.goodfood.clients

import com.comp2850.goodfood.diary.DiaryEntry
import com.comp2850.goodfood.diary.DiaryStore
import com.comp2850.goodfood.exercise.ExerciseJpaRepository
import com.comp2850.goodfood.exercise.ExerciseEntity
import com.comp2850.goodfood.nutrition.FoodNutritionStore
import com.comp2850.goodfood.user.Role
import com.comp2850.goodfood.user.User
import com.comp2850.goodfood.user.repository.UserStore
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import kotlin.math.round
import kotlin.math.roundToInt

@RestController
@RequestMapping("/api/clients")
class ApiClientDiaryController(
    private val userStore: UserStore,
    private val diaryStore: DiaryStore,
    private val exerciseJpaRepository: ExerciseJpaRepository,
    private val foodNutritionStore: FoodNutritionStore
) {

    @GetMapping("/{id}/diary")
    fun getClientDiary(
        authentication: Authentication,
        @PathVariable id: String,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        from: LocalDate?,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        to: LocalDate?
    ): ApiClientDiaryResponse {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (currentUser.role != Role.HEALTH_PROFESSIONAL) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "only professionals can view client diaries")
        }

        val client = userStore.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "client not found")

        if (client.role != Role.SUBSCRIBER || client.proId != currentUser.id) {
            throw ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "you can only view diaries for your assigned clients"
            )
        }

        val actualTo = to ?: LocalDate.now()
        val actualFrom = from ?: actualTo.minusDays(29)

        if (actualFrom.isAfter(actualTo)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "from must not be after to")
        }

        val diaryEntries = diaryStore.findByUserEmail(client.email)
            .filter { !it.diaryDate.isBefore(actualFrom) && !it.diaryDate.isAfter(actualTo) }
            .sortedWith(compareByDescending<DiaryEntry> { it.diaryDate }.thenBy { it.mealType.ordinal })

        val exerciseEntries = exerciseJpaRepository
            .findAllByUserIdAndDateBetweenOrderByDateDescCreatedAtDesc(client.id, actualFrom, actualTo)

        val meals = diaryEntries.map { entry ->
            // Use stored nutrition values; fall back to nutrition DB for legacy entries
            val nutrition = if (entry.kcal == null) foodNutritionStore.findByFoodName(entry.foodName) else null
            val kcal    = entry.kcal    ?: ((nutrition?.calories ?: 0.0) * entry.servings).roundToInt()
            val protein = entry.protein ?: round2((nutrition?.protein ?: 0.0) * entry.servings)
            val carbs   = entry.carbs   ?: 0.0
            val fat     = entry.fat     ?: 0.0
            val sugar   = entry.sugar   ?: round2((nutrition?.sugar ?: 0.0) * entry.servings)

            ApiClientMealResponse(
                id = entry.id,
                date = entry.diaryDate.toString(),
                mealType = entry.mealType.name,
                foodName = entry.foodName,
                quantity = entry.quantity,
                servings = entry.servings,
                kcal = kcal,
                protein = protein,
                carbs = carbs,
                fat = fat,
                sugar = sugar
            )
        }

        val exercises = exerciseEntries.map { exercise ->
            ApiClientExerciseResponse(
                id = exercise.id ?: 0L,
                date = exercise.date.toString(),
                activity = exercise.activity,
                duration = exercise.duration,
                kcal = exercise.kcal
            )
        }

        val totalCalories = meals.sumOf { it.kcal }
        val totalProtein = round2(meals.sumOf { it.protein })
        val totalSugar = round2(meals.sumOf { it.sugar })
        val totalExerciseKcal = exercises.sumOf { it.kcal }
        val lastDiaryDate = diaryEntries.maxByOrNull { it.diaryDate }?.diaryDate?.toString()

        return ApiClientDiaryResponse(
            meals = meals,
            exercise = exercises,
            summary = ApiClientDiarySummary(
                totalEntries = meals.size,
                totalExerciseEntries = exercises.size,
                lastDiaryDate = lastDiaryDate,
                totalCalories = totalCalories,
                totalProtein = totalProtein,
                totalSugar = totalSugar,
                totalExerciseKcal = totalExerciseKcal,
                status = toStatus(lastDiaryDate, meals.size)
            ),
            profile = ApiClientProfile(
                height = client.height,
                weight = client.weight,
                age = client.age,
                targetKcal = client.targetKcal,
                goal = client.goal
            )
        )
    }

    private fun toStatus(lastDiaryDate: String?, diaryCount: Int): String {
        return when {
            diaryCount == 0 -> "inactive"
            lastDiaryDate == null -> "inactive"
            else -> "active"
        }
    }

    private fun round2(value: Double): Double {
        return round(value * 100) / 100
    }
}

data class ApiClientDiaryResponse(
    val meals: List<ApiClientMealResponse>,
    val exercise: List<ApiClientExerciseResponse>,
    val summary: ApiClientDiarySummary,
    val profile: ApiClientProfile? = null
)

data class ApiClientProfile(
    val height: Double?,
    val weight: Double?,
    val age: Int?,
    val targetKcal: Int?,
    val goal: String?
)

data class ApiClientMealResponse(
    val id: Long,
    val date: String,
    val mealType: String,
    val foodName: String,
    val quantity: String,
    val servings: Double,
    val kcal: Int,
    val protein: Double,
    val carbs: Double,
    val fat: Double,
    val sugar: Double
)

data class ApiClientExerciseResponse(
    val id: Long,
    val date: String,
    val activity: String,
    val duration: Int,
    val kcal: Int
)

data class ApiClientDiarySummary(
    val totalEntries: Int,
    val totalExerciseEntries: Int,
    val lastDiaryDate: String?,
    val totalCalories: Int,
    val totalProtein: Double,
    val totalSugar: Double,
    val totalExerciseKcal: Int,
    val status: String
)