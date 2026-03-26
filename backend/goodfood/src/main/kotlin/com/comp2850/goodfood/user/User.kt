package com.comp2850.goodfood.user

data class User(
    val id: String,
    val name: String,
    val email: String,
    val password: String,
    val role: Role
)