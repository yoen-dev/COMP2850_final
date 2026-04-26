package com.comp2850.goodfood.notifications

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "notifications")
class NotificationEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "user_id", nullable = false)
    var userId: String = "",

    @Column(name = "notification_type", nullable = false)
    var type: String = "", // "plan_updated", "message_received", "user_unbound"

    @Column(name = "title", nullable = false)
    var title: String = "",

    @Column(name = "message", nullable = false, length = 500)
    var message: String = "",

    @Column(name = "related_id", nullable = true)
    var relatedId: String? = null, // planId, messageId, etc.

    @Column(name = "is_read", nullable = false)
    var isRead: Int = 0, // 0 = unread, 1 = read

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
