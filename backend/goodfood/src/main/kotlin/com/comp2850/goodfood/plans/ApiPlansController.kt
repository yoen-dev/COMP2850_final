package com.comp2850.goodfood.plans

import com.comp2850.goodfood.notifications.NotificationPublisher
import com.comp2850.goodfood.user.Role
import com.comp2850.goodfood.user.repository.UserStore
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/plans")
class ApiPlansController(
    private val planJpaRepository: PlanJpaRepository,
    private val userStore: UserStore,
    private val notificationPublisher: NotificationPublisher
) {

    /**
     * GET /api/plans/{clientId} — get all plans for a client.
     * Accessible by the assigned professional OR the client themselves.
     */
    @GetMapping("/{clientId}")
    fun getPlans(
        authentication: Authentication,
        @PathVariable clientId: String
    ): List<ApiPlanResponse> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        val client = userStore.findById(clientId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "client not found")

        // Access control: pro can see their client's plans, subscriber can see their own
        when (currentUser.role) {
            Role.HEALTH_PROFESSIONAL -> {
                if (client.proId != currentUser.id) {
                    throw ResponseStatusException(HttpStatus.FORBIDDEN, "not your client")
                }
            }
            Role.SUBSCRIBER -> {
                if (currentUser.id != clientId) {
                    throw ResponseStatusException(HttpStatus.FORBIDDEN, "can only view your own plans")
                }
            }
        }

        return planJpaRepository.findAllByClientId(clientId).map { it.toResponse() }
    }

    /**
     * PUT /api/plans/{clientId} — create or update a plan for a client.
     * Only accessible by the assigned professional.
     */
    @PutMapping("/{clientId}")
    fun savePlan(
        authentication: Authentication,
        @PathVariable clientId: String,
        @Valid @RequestBody request: ApiPlanSaveRequest
    ): ResponseEntity<ApiPlanResponse> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (currentUser.role != Role.HEALTH_PROFESSIONAL) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "only professionals can save plans")
        }

        val client = userStore.findById(clientId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "client not found")

        if (client.proId != currentUser.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "not your client")
        }

        val planType = request.planType.trim().lowercase()
        if (planType != "meal" && planType != "training") {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "planType must be 'meal' or 'training'")
        }

        // Upsert: find existing or create new
        val existing = planJpaRepository.findByProIdAndClientIdAndPlanType(
            currentUser.id, clientId, planType
        )

        val entity = existing ?: PlanEntity(
            proId = currentUser.id,
            clientId = clientId,
            planType = planType
        )

        entity.daysJson = request.daysJson
        entity.targetKcal = request.targetKcal
        entity.targetProtein = request.targetProtein
        entity.targetCarbsPct = request.targetCarbsPct
        entity.targetFatPct = request.targetFatPct
        entity.notes = request.notes?.trim()
        entity.updatedAt = LocalDateTime.now()

        val saved = planJpaRepository.save(entity)

        // 发送实时通知
        notificationPublisher.publishPlanUpdate(
            userId = client.id,
            planId = saved.id ?: 0L,
            planType = planType,
            proName = currentUser.name
        )

        return ResponseEntity.status(if (existing != null) HttpStatus.OK else HttpStatus.CREATED)
            .body(saved.toResponse())
    }

    /**
     * DELETE /api/plans/{planId} — delete a plan
     * Only accessible by the assigned professional.
     */
    @DeleteMapping("/{planId}")
    fun deletePlan(
        authentication: Authentication,
        @PathVariable planId: Long
    ): ResponseEntity<Void> {
        val currentUser = userStore.findByEmail(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        if (currentUser.role != Role.HEALTH_PROFESSIONAL) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "only professionals can delete plans")
        }

        val plan = planJpaRepository.findById(planId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "plan not found") }

        if (plan.proId != currentUser.id) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "not your plan")
        }

        val client = userStore.findById(plan.clientId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "client not found")

        // 发送删除通知
        notificationPublisher.publishPlanDeleted(
            userId = plan.clientId,
            planId = planId,
            planType = plan.planType,
            proName = currentUser.name
        )

        planJpaRepository.deleteById(planId)
        return ResponseEntity.noContent().build()
    }

    private fun PlanEntity.toResponse(): ApiPlanResponse {
        return ApiPlanResponse(
            id = this.id ?: 0L,
            proId = this.proId,
            clientId = this.clientId,
            planType = this.planType,
            daysJson = this.daysJson,
            targetKcal = this.targetKcal,
            targetProtein = this.targetProtein,
            targetCarbsPct = this.targetCarbsPct,
            targetFatPct = this.targetFatPct,
            notes = this.notes,
            updatedAt = this.updatedAt.toString()
        )
    }
}

data class ApiPlanSaveRequest(
    @field:NotBlank(message = "planType is required")
    val planType: String,

    @field:NotBlank(message = "daysJson is required")
    val daysJson: String,

    val targetKcal: Int? = null,
    val targetProtein: Int? = null,
    val targetCarbsPct: Int? = null,
    val targetFatPct: Int? = null,
    val notes: String? = null
)

data class ApiPlanResponse(
    val id: Long,
    val proId: String,
    val clientId: String,
    val planType: String,
    val daysJson: String,
    val targetKcal: Int?,
    val targetProtein: Int?,
    val targetCarbsPct: Int?,
    val targetFatPct: Int?,
    val notes: String?,
    val updatedAt: String
)
