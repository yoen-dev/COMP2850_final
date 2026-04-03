package com.comp2850.goodfood.diary

import org.springframework.stereotype.Repository
import java.util.concurrent.atomic.AtomicLong

@Repository
class InMemoryDiaryRepository {

    private val entries = mutableListOf<DiaryEntry>()
    private val idGenerator = AtomicLong(1)

    fun save(entry: DiaryEntry): DiaryEntry {
        entries.add(entry)
        return entry
    }

    fun update(updatedEntry: DiaryEntry): DiaryEntry {
        val index = entries.indexOfFirst { it.id == updatedEntry.id }
        if (index != -1) {
            entries[index] = updatedEntry
        }
        return updatedEntry
    }

    fun nextId(): Long {
        return idGenerator.getAndIncrement()
    }

    fun findByUserEmail(userEmail: String): List<DiaryEntry> {
        return entries.filter { it.userEmail == userEmail }
    }

    fun findByUserEmailAndDate(userEmail: String, diaryDate: String): List<DiaryEntry> {
        return entries.filter {
            it.userEmail == userEmail && it.diaryDate == diaryDate
        }
    }

    fun findById(id: Long): DiaryEntry? {
        return entries.find { it.id == id }
    }

    fun delete(entry: DiaryEntry) {
        entries.remove(entry)
    }
}