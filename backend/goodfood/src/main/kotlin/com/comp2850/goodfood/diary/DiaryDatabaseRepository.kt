package com.comp2850.goodfood.diary

import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
class DiaryDatabaseRepository(
    private val diaryJpaRepository: DiaryJpaRepository
) : DiaryStore {

    override fun save(entry: DiaryEntry): DiaryEntry {
        val saved = diaryJpaRepository.save(entry.toEntity())
        return saved.toModel()
    }

    override fun update(entry: DiaryEntry): DiaryEntry {
        val saved = diaryJpaRepository.save(entry.toEntity())
        return saved.toModel()
    }

    override fun findByUserEmail(userEmail: String): List<DiaryEntry> {
        return diaryJpaRepository.findAllByUserEmail(userEmail).map { it.toModel() }
    }

    override fun findByUserEmailAndDate(userEmail: String, diaryDate: LocalDate): List<DiaryEntry> {
        return diaryJpaRepository.findAllByUserEmailAndDiaryDate(userEmail, diaryDate)
            .map { it.toModel() }
    }

    override fun findById(id: Long): DiaryEntry? {
        return diaryJpaRepository.findById(id).orElse(null)?.toModel()
    }

    override fun delete(entry: DiaryEntry) {
        val entity = diaryJpaRepository.findById(entry.id).orElse(null) ?: return
        diaryJpaRepository.delete(entity)
    }

    private fun DiaryEntryEntity.toModel(): DiaryEntry {
        return DiaryEntry(
            id = this.id ?: 0L,
            userEmail = this.userEmail,
            foodName = this.foodName,
            quantity = this.quantity,
            servings = this.servings,
            mealType = this.mealType,
            diaryDate = this.diaryDate,
            kcal = this.kcal,
            protein = this.protein,
            carbs = this.carbs,
            fat = this.fat,
            sugar = this.sugar
        )
    }

    private fun DiaryEntry.toEntity(): DiaryEntryEntity {
        return DiaryEntryEntity(
            id = this.id.takeIf { it != 0L },
            userEmail = this.userEmail,
            foodName = this.foodName,
            quantity = this.quantity,
            servings = this.servings,
            mealType = this.mealType,
            diaryDate = this.diaryDate,
            kcal = this.kcal,
            protein = this.protein,
            carbs = this.carbs,
            fat = this.fat,
            sugar = this.sugar
        )
    }
}