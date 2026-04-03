package com.comp2850.goodfood.diary

import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/diary")
class DiaryController(
    private val diaryService: DiaryService
) {

    @PostMapping
    fun createDiary(
        @Valid @RequestBody request: CreateDiaryRequest,
        authentication: Authentication
    ): DiaryEntry {
        return diaryService.createDiary(request, authentication)
    }

    @GetMapping
    fun getMyDiaryEntries(
        authentication: Authentication,
        @RequestParam(required = false) date: String?
    ): List<DiaryEntry> {
        return diaryService.getMyDiaryEntries(authentication, date)
    }

    @PutMapping("/{id}")
    fun updateMyDiaryEntry(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateDiaryRequest,
        authentication: Authentication
    ): DiaryEntry {
        return diaryService.updateMyDiaryEntry(id, request, authentication)
    }

    @DeleteMapping("/{id}")
    fun deleteMyDiaryEntry(
        @PathVariable id: Long,
        authentication: Authentication
    ): Map<String, String> {
        diaryService.deleteMyDiaryEntry(id, authentication)
        return mapOf("message" to "diary entry deleted successfully")
    }
}