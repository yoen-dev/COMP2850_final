package com.comp2850.goodfood.notifications

import com.comp2850.goodfood.user.repository.UserStore
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/notifications")
class ApiNotificationsController(
    private val notificationJpaRepository: NotificationJpaRepository,
    private val userStore: UserStore
) {

    /**
     * GET /api/notifications — 获取当前用户的所有通知
     */
    @GetMapping
    fun getNotifications(
        authentication: Authentication,
        @RequestParam(defaultValue = "false") unreadOnly: Boolean
    ): List<ApiNotificationResponse> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        val notifications = if (unreadOnly) {
            notificationJpaRepository.findUnreadByUserId(currentUser.id)
        } else {
            notificationJpaRepository.findByUserId(currentUser.id)
                .sortedByDescending { it.createdAt }
        }

        return notifications.map { it.toResponse() }
    }

    /**
     * GET /api/notifications/unread-count — 获取未读通知数
     */
    @GetMapping("/unread-count")
    fun getUnreadCount(authentication: Authentication): Map<String, Int> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        val count = notificationJpaRepository.countUnreadByUserId(currentUser.id)
        return mapOf("unreadCount" to count)
    }

    /**
     * PUT /api/notifications/{notificationId}/read — 标记通知为已读
     */
    @PutMapping("/{notificationId}/read")
    fun markAsRead(
        authentication: Authentication,
        @PathVariable notificationId: Long
    ): ApiNotificationResponse {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        val notification = notificationJpaRepository.findById(notificationId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "notification not found") }

        if (notification.userId != currentUser.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "this notification is not yours")
        }

        notification.isRead = 1
        val saved = notificationJpaRepository.save(notification)
        return saved.toResponse()
    }

    /**
     * PUT /api/notifications/read-all — 标记所有通知为已读
     */
    @PutMapping("/read-all")
    fun markAllAsRead(authentication: Authentication): Map<String, String> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        val unreadNotifications = notificationJpaRepository.findUnreadByUserId(currentUser.id)
        unreadNotifications.forEach { it.isRead = 1 }
        notificationJpaRepository.saveAll(unreadNotifications)

        return mapOf("message" to "all notifications marked as read")
    }

    /**
     * DELETE /api/notifications/{notificationId} — 删除通知
     */
    @DeleteMapping("/{notificationId}")
    fun deleteNotification(
        authentication: Authentication,
        @PathVariable notificationId: Long
    ): Map<String, String> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        val notification = notificationJpaRepository.findById(notificationId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "notification not found") }

        if (notification.userId != currentUser.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "this notification is not yours")
        }

        notificationJpaRepository.deleteById(notificationId)
        return mapOf("message" to "notification deleted")
    }

    private fun NotificationEntity.toResponse(): ApiNotificationResponse {
        return ApiNotificationResponse(
            id = this.id ?: 0L,
            type = this.type,
            title = this.title,
            message = this.message,
            relatedId = this.relatedId,
            isRead = this.isRead == 1,
            createdAt = this.createdAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        )
    }
}

data class ApiNotificationResponse(
    val id: Long,
    val type: String,
    val title: String,
    val message: String,
    val relatedId: String?,
    val isRead: Boolean,
    val createdAt: String
)
