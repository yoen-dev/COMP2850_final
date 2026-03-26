package com.comp2850.goodfood.auth.service

import com.comp2850.goodfood.auth.dto.LoginRequest
import com.comp2850.goodfood.auth.dto.RegisterRequest
import com.comp2850.goodfood.user.Role
import com.comp2850.goodfood.user.User
import com.comp2850.goodfood.user.repository.InMemoryUserRepository
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.UUID
import com.comp2850.goodfood.auth.jwt.JwtService

@Service
class AuthService(
    private val userRepository: InMemoryUserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
){

    fun register(request: RegisterRequest): Map<String, Any> {
        val role = parseRole(request.role)

        val existingUser = userRepository.findByEmail(request.email)
        if (existingUser != null) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "email already exists")
        }

        val encodedPassword = passwordEncoder.encode(request.password)
            ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "password encoding failed")

        val user = User(
            id = UUID.randomUUID().toString(),
            name = request.name,
            email = request.email,
            password = encodedPassword,
            role = role
        )

        userRepository.save(user)

        return mapOf(
            "message" to "register success",
            "user" to mapOf(
                "id" to user.id,
                "name" to user.name,
                "email" to user.email,
                "role" to user.role.name
            )
        )
    }

    fun login(request: LoginRequest): Map<String, Any> {
        val user = userRepository.findByEmail(request.email)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid email or password")

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid email or password")
        }

        val token = jwtService.generateToken(user.email, user.role.name)

        return mapOf(
            "message" to "login success",
            "token" to token,
            "user" to mapOf(
                "id" to user.id,
                "name" to user.name,
                "email" to user.email,
                "role" to user.role.name
            )
        )
    }

    fun getAllUsers(): List<Map<String, Any>> {
        return userRepository.findAll().map { user ->
            mapOf(
                "id" to user.id,
                "name" to user.name,
                "email" to user.email,
                "role" to user.role.name
            )
        }
    }

    private fun parseRole(role: String): Role {
        return when (role.trim().uppercase()) {
            "SUBSCRIBER" -> Role.SUBSCRIBER
            "HEALTH_PROFESSIONAL" -> Role.HEALTH_PROFESSIONAL
            else -> throw ResponseStatusException(HttpStatus.BAD_REQUEST, "invalid role")
        }
    }

    fun getCurrentUser(email: String): Map<String, Any> {
        val user = userRepository.findByEmail(email)
        ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "user not found")

        return mapOf(
        "id" to user.id,
        "name" to user.name,
        "email" to user.email,
        "role" to user.role.name
        )
    }   
}