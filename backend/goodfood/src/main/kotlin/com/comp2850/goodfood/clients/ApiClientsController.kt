package com.comp2850.goodfood.clients

import com.comp2850.goodfood.diary.DiaryStore
import com.comp2850.goodfood.notifications.NotificationPublisher
import com.comp2850.goodfood.user.Role
import com.comp2850.goodfood.user.repository.UserStore
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/clients")
class ApiClientsController(
    private val userStore: UserStore,
    private val diaryStore: DiaryStore,
    private val notificationPublisher: NotificationPublisher
) {

    @GetMapping
    fun getClients(authentication: Authentication): List<ApiClientResponse> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (currentUser.role != Role.HEALTH_PROFESSIONAL) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "only professionals can access clients")
        }

        return userStore.findAll()
            .filter { it.role == Role.SUBSCRIBER && it.proId == currentUser.id }
            .sortedBy { it.name.lowercase() }
            .map { client ->
                val diaries = diaryStore.findByUserEmail(client.email)
                val lastDiaryDate = diaries.maxByOrNull { it.diaryDate }?.diaryDate?.toString()
                val diaryCount = diaries.size

                ApiClientResponse(
                    userId = client.id,
                    name = client.name,
                    email = client.email,
                    stats = ApiClientStats(
                        lastDiaryDate = lastDiaryDate,
                        diaryCount = diaryCount,
                        status = toStatus(lastDiaryDate, diaryCount)
                    ),
                    height = client.height,
                    weight = client.weight,
                    age = client.age,
                    targetKcal = client.targetKcal,
                    goal = client.goal
                )
            }
    }

    /**
     * Bind a subscriber to the currently logged-in professional.
     * Called by the pro dashboard when the professional accepts a bind request from a subscriber.
     */
    @PostMapping("/bind")
    fun bindClient(
        authentication: Authentication,
        @RequestBody request: BindClientRequest
    ): ApiClientResponse {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (currentUser.role != Role.HEALTH_PROFESSIONAL) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "only professionals can bind clients")
        }

        val target = userStore.findById(request.userId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (target.role != Role.SUBSCRIBER) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "target user is not a subscriber")
        }

        // Already bound to another pro? Only allow if same pro or no pro set
        if (target.proId != null && target.proId != currentUser.id) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "user is already bound to another professional")
        }

        val updated = target.copy(proId = currentUser.id)
        userStore.save(updated)

        val diaries = diaryStore.findByUserEmail(updated.email)
        val lastDiaryDate = diaries.maxByOrNull { it.diaryDate }?.diaryDate?.toString()
        val diaryCount = diaries.size

        return ApiClientResponse(
            userId = updated.id,
            name = updated.name,
            email = updated.email,
            stats = ApiClientStats(
                lastDiaryDate = lastDiaryDate,
                diaryCount = diaryCount,
                status = toStatus(lastDiaryDate, diaryCount)
            ),
            height = updated.height,
            weight = updated.weight,
            age = updated.age,
            targetKcal = updated.targetKcal,
            goal = updated.goal
        )
    }

    /**
     * Unbind a subscriber from the currently logged-in professional.
     * Called when the professional declines or removes a client.
     */
    @DeleteMapping("/{id}/bind")
    fun unbindClient(
        authentication: Authentication,
        @PathVariable id: String
    ) {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (currentUser.role != Role.HEALTH_PROFESSIONAL) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "only professionals can unbind clients")
        }

        val target = userStore.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (target.proId != currentUser.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "this user is not your client")
        }

        // 通知客户：专家已将其从客户列表移除
        notificationPublisher.publishUserUnbound(
            userId = target.id,
            clientId = target.id,
            clientName = target.name
        )

        userStore.save(target.copy(proId = null))
    }

    /**
     * DELETE /api/clients/self-unbind — subscriber initiates unbind from their pro.
     * Clears the subscriber's proId and notifies the professional.
     */
    @DeleteMapping("/self-unbind")
    fun selfUnbind(authentication: Authentication) {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (currentUser.role != Role.SUBSCRIBER) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "only subscribers can self-unbind")
        }

        val proId = currentUser.proId
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "not bound to any professional")

        // 通知专家：客户已主动解绑
        notificationPublisher.publishUserUnbound(
            userId = proId,
            clientId = currentUser.id,
            clientName = currentUser.name
        )

        userStore.save(currentUser.copy(proId = null))
    }

    private fun toStatus(lastDiaryDate: String?, diaryCount: Int): String {
        return when {
            diaryCount == 0 -> "inactive"
            lastDiaryDate == null -> "inactive"
            else -> "active"
        }
    }
}

data class ApiClientResponse(
    val userId: String,
    val name: String,
    val email: String,
    val stats: ApiClientStats,
    val height: Double? = null,
    val weight: Double? = null,
    val age: Int? = null,
    val targetKcal: Int? = null,
    val goal: String? = null
)

data class ApiClientStats(
    val lastDiaryDate: String?,
    val diaryCount: Int,
    val status: String
)

data class BindClientRequest(
    val userId: String
)
