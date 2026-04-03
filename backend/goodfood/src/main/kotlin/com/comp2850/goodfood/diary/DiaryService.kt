package com.comp2850.goodfood.diary

import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

@Service
class DiaryService(
    private val diaryRepository: InMemoryDiaryRepository
) {

    fun createDiary(request: CreateDiaryRequest, authentication: Authentication): DiaryEntry {
        val userEmail = authentication.name

        val entry = DiaryEntry(
            id = diaryRepository.nextId(),
            userEmail = userEmail,
            foodName = request.foodName,
            quantity = request.quantity,
            mealType = request.mealType,
            diaryDate = request.diaryDate
        )

        return diaryRepository.save(entry)
    }

    fun getMyDiaryEntries(authentication: Authentication, date: String?): List<DiaryEntry> {
        val userEmail = authentication.name

        return if (date.isNullOrBlank()) {
            diaryRepository.findByUserEmail(userEmail)
        } else {
            diaryRepository.findByUserEmailAndDate(userEmail, date)
        }
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
    ): DiaryEntry {
        val userEmail = authentication.name
        val existingEntry = diaryRepository.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "diary entry not found")

        if (existingEntry.userEmail != userEmail) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "you cannot update this diary entry")
        }

        val updatedEntry = existingEntry.copy(
            foodName = request.foodName,
            quantity = request.quantity,
            mealType = request.mealType,
            diaryDate = request.diaryDate
        )

        return diaryRepository.update(updatedEntry)
    }
}