package com.comp2850.goodfood.auth.controller

import com.comp2850.goodfood.auth.dto.LoginRequest
import com.comp2850.goodfood.auth.dto.RegisterRequest
import com.comp2850.goodfood.auth.service.AuthService
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping
class AuthController(
    private val authService: AuthService
) {

    // =========================
    // Existing backend endpoints
    // =========================

    @PostMapping("/auth/register")
    fun register(@Valid @RequestBody request: RegisterRequest): Map<String, Any?> {
        return authService.register(request)
    }

    @PostMapping("/auth/login")
    fun login(@Valid @RequestBody request: LoginRequest): Map<String, Any?> {
        return authService.login(request)
    }

    @GetMapping("/auth/users")
    fun getAllUsers(): List<Map<String, Any?>> {
        return authService.getAllUsers()
    }

    @GetMapping("/auth/me")
    fun getCurrentUser(authentication: Authentication): Map<String, Any?> {
        return authService.getCurrentUser(authentication.name)
    }

    // =========================
    // Frontend-compatible /api endpoints
    // =========================

    @PostMapping("/api/auth/register")
    fun apiRegister(@Valid @RequestBody request: ApiRegisterRequest): Map<String, Any?> {
        val backendRequest = RegisterRequest(
            name = buildFullName(request.firstName, request.lastName),
            email = request.email,
            password = request.password,
            role = toBackendRole(request.role),
            licence = request.licenceNo
        )

        authService.register(backendRequest)

        val loginResult = authService.login(
            LoginRequest(
                email = request.email,
                password = request.password
            )
        )

        val token = loginResult["token"]?.toString()
            ?: throw IllegalStateException("token missing after register")

        val userMap = loginResult["user"] as? Map<*, *>
            ?: throw IllegalStateException("user payload missing after register")

        return mapOf(
            "userId" to userMap["id"]?.toString(),
            "token" to token
        )
    }

    @PostMapping("/api/auth/login")
    fun apiLogin(@Valid @RequestBody request: ApiLoginRequest): Map<String, Any?> {
        val loginResult = authService.login(
            LoginRequest(
                email = request.email,
                password = request.password
            )
        )

        val token = loginResult["token"]?.toString()
            ?: throw IllegalStateException("token missing in login response")

        val userMap = loginResult["user"] as? Map<*, *>
            ?: throw IllegalStateException("user payload missing in login response")

        return mapOf(
            "userId" to userMap["id"]?.toString(),
            "token" to token,
            "role" to toApiRole(userMap["role"]?.toString())
        )
    }

    @GetMapping("/api/auth/me")
    fun apiMe(authentication: Authentication): Map<String, Any?> {
        val currentUser = authService.getCurrentUser(authentication.name)

        val fullName = currentUser["name"]?.toString().orEmpty()
        val (firstName, lastName) = splitName(fullName)

        return mapOf(
            "userId" to currentUser["id"]?.toString(),
            "email" to currentUser["email"]?.toString(),
            "role" to toApiRole(currentUser["role"]?.toString()),
            "firstName" to firstName,
            "lastName" to lastName,
            "licenceNo" to currentUser["licence"]?.toString(),
            "name" to fullName,
            "proId" to currentUser["proId"]?.toString(),
            "height" to currentUser["height"],
            "weight" to currentUser["weight"],
            "age" to currentUser["age"],
            "targetKcal" to currentUser["targetKcal"],
            "goal" to currentUser["goal"]?.toString()
        )
    }

    @PutMapping("/api/auth/profile")
    fun updateProfile(
        authentication: Authentication,
        @RequestBody body: Map<String, Any?>
    ): Map<String, Any?> {
        val user = authService.getUserByEmail(authentication.name)
            ?: return mapOf("error" to "user not found")

        val updated = user.copy(
            height = (body["height"] as? Number)?.toDouble() ?: user.height,
            weight = (body["weight"] as? Number)?.toDouble() ?: user.weight,
            age = (body["age"] as? Number)?.toInt() ?: user.age,
            targetKcal = (body["targetKcal"] as? Number)?.toInt() ?: user.targetKcal,
            goal = body["goal"]?.toString()?.takeIf { it.isNotBlank() } ?: user.goal
        )
        authService.saveUser(updated)
        return mapOf("message" to "profile updated")
    }

    private fun buildFullName(firstName: String, lastName: String): String {
        return listOf(firstName.trim(), lastName.trim())
            .filter { it.isNotBlank() }
            .joinToString(" ")
    }

    private fun splitName(fullName: String): Pair<String, String> {
        val parts = fullName.trim().split("\\s+".toRegex(), limit = 2)
        return when {
            parts.isEmpty() -> "" to ""
            parts.size == 1 -> parts[0] to ""
            else -> parts[0] to parts[1]
        }
    }

    private fun toBackendRole(role: String): String {
        return when (role.trim().lowercase()) {
            "subscriber" -> "subscriber"
            "professional" -> "health_professional"
            "health_professional" -> "health_professional"
            "health professional" -> "health_professional"
            else -> role
        }
    }

    private fun toApiRole(role: String?): String {
        return when (role?.trim()?.uppercase()) {
            "SUBSCRIBER" -> "subscriber"
            "HEALTH_PROFESSIONAL" -> "professional"
            else -> role?.lowercase() ?: "subscriber"
        }
    }
}

data class ApiRegisterRequest(
    @field:NotBlank(message = "firstName cannot be blank")
    val firstName: String,

    @field:NotBlank(message = "lastName cannot be blank")
    val lastName: String,

    @field:NotBlank(message = "email cannot be blank")
    @field:Email(message = "email format is invalid")
    val email: String,

    @field:NotBlank(message = "password cannot be blank")
    val password: String,

    @field:NotBlank(message = "role cannot be blank")
    val role: String,

    val licenceNo: String? = null
)

data class ApiLoginRequest(
    @field:NotBlank(message = "email cannot be blank")
    @field:Email(message = "email format is invalid")
    val email: String,

    @field:NotBlank(message = "password cannot be blank")
    val password: String
)