package com.comp2850.goodfood.user.repository

import com.comp2850.goodfood.user.User
import org.springframework.stereotype.Repository

@Repository
class InMemoryUserRepository {

    private val users = mutableListOf<User>()

    fun save(user: User): User {
        users.add(user)
        return user
    }

    fun findByEmail(email: String): User? {
        return users.find { it.email.equals(email, ignoreCase = true) }
    }

    fun findAll(): List<User> {
        return users
    }
}