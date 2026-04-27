package com.comp2850.goodfood.notifications

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface NotificationJpaRepository : JpaRepository<NotificationEntity, Long> {
    fun findByUserId(userId: String): List<NotificationEntity>

    @Query("SELECT n FROM NotificationEntity n WHERE n.userId = ?1 AND n.isRead = 0 ORDER BY n.createdAt DESC")
    fun findUnreadByUserId(userId: String): List<NotificationEntity>

    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE n.userId = ?1 AND n.isRead = 0")
    fun countUnreadByUserId(userId: String): Int
}
