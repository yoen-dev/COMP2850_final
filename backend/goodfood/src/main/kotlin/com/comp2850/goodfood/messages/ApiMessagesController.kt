package com.comp2850.goodfood.messages

import com.comp2850.goodfood.notifications.NotificationPublisher
import com.comp2850.goodfood.user.Role
import com.comp2850.goodfood.user.User
import com.comp2850.goodfood.user.repository.UserStore
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/messages")
class ApiMessagesController(
    private val messageJpaRepository: MessageJpaRepository,
    private val userStore: UserStore,
    private val notificationPublisher: NotificationPublisher
) {

    @Transactional
    @GetMapping("/{clientId}")
    fun getConversation(
        authentication: Authentication,
        @PathVariable clientId: String
    ): List<ApiMessageResponse> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        val otherUser = userStore.findById(clientId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "target user not found")

        validateConversationAccess(currentUser, otherUser)

        val messages = messageJpaRepository.findConversation(currentUser.id, otherUser.id)

        messages
            .filter { it.receiverId == currentUser.id && it.isRead == 0 }
            .forEach { it.isRead = 1 }

        return messages.map { message ->
            ApiMessageResponse(
                id = message.id ?: 0L,
                senderId = message.senderId,
                receiverId = message.receiverId,
                text = message.text,
                isRead = message.isRead == 1,
                createdAt = message.createdAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            )
        }
    }

    @PostMapping
    fun sendMessage(
        authentication: Authentication,
        @Valid @RequestBody request: ApiMessageCreateRequest
    ): ResponseEntity<Map<String, Any?>> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        val receiver = userStore.findById(request.receiverId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "receiver not found")

        validateConversationAccess(currentUser, receiver)

        val cleanedText = request.text.trim()

        if (containsHtml(cleanedText)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "HTML tags are not allowed in messages")
        }

        val saved = messageJpaRepository.save(
            MessageEntity(
                senderId = currentUser.id,
                receiverId = receiver.id,
                text = cleanedText,
                isRead = 0
            )
        )

        // 发送实时通知
        notificationPublisher.publishMessage(
            userId = receiver.id,
            messageId = saved.id ?: 0L,
            senderId = currentUser.id,
            senderName = currentUser.name,
            messageText = cleanedText
        )

        return ResponseEntity.status(HttpStatus.CREATED).body(
            mapOf("id" to (saved.id ?: 0L))
        )
    }

    private fun validateConversationAccess(currentUser: User, otherUser: User) {
        when (currentUser.role) {
            Role.HEALTH_PROFESSIONAL -> {
                if (otherUser.role != Role.SUBSCRIBER || otherUser.proId != currentUser.id) {
                    throw ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "you can only access messages for your assigned clients"
                    )
                }
            }

            Role.SUBSCRIBER -> {
                if (currentUser.proId == null ||
                    otherUser.role != Role.HEALTH_PROFESSIONAL ||
                    otherUser.id != currentUser.proId
                ) {
                    throw ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "you can only access messages with your assigned professional"
                    )
                }
            }
        }
    }

    private fun containsHtml(text: String): Boolean {
        return Regex("<[^>]+>").containsMatchIn(text)
    }
}

data class ApiMessageCreateRequest(
    @field:NotNull(message = "receiverId is required")
    val receiverId: String,

    @field:NotBlank(message = "text cannot be blank")
    @field:Size(max = 500, message = "text must be at most 500 characters")
    val text: String
)

data class ApiMessageResponse(
    val id: Long,
    val senderId: String,
    val receiverId: String,
    val text: String,
    val isRead: Boolean,
    val createdAt: String
)