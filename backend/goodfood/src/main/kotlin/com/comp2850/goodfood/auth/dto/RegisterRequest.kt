package com.comp2850.goodfood.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank(message = "name cannot be blank")
    val name: String,

    @field:NotBlank(message = "email cannot be blank")
    @field:Email(message = "email format is invalid")
    val email: String,

    @field:NotBlank(message = "password cannot be blank")
    @field:Size(min = 6, message = "password must be at least 6 characters")
    val password: String,

    @field:NotBlank(message = "role cannot be blank")
    val role: String
)