package com.comp2850.goodfood.user.repository

import com.comp2850.goodfood.user.User
import org.springframework.stereotype.Repository

@Repository
class UserDatabaseRepository(
    private val userJpaRepository: UserJpaRepository
) : UserStore {

    override fun save(user: User): User {
        val saved = userJpaRepository.save(user.toEntity())
        return saved.toModel()
    }

    override fun findByEmail(email: String): User? {
        return userJpaRepository.findByEmailIgnoreCase(email)?.toModel()
    }

    override fun findById(id: String): User? {
        return userJpaRepository.findById(id).orElse(null)?.toModel()
    }

    override fun findAll(): List<User> {
        return userJpaRepository.findAll().map { it.toModel() }
    }

    private fun UserEntity.toModel(): User {
        return User(
            id = this.id,
            name = this.name,
            email = this.email,
            passwordHash = this.passwordHash,
            role = this.role,
            licence = this.licence,
            proId = this.proId,
            height = this.height,
            weight = this.weight,
            age = this.age,
            targetKcal = this.targetKcal,
            goal = this.goal
        )
    }

    private fun User.toEntity(): UserEntity {
        return UserEntity(
            id = this.id,
            name = this.name,
            email = this.email,
            passwordHash = this.passwordHash,
            role = this.role,
            licence = this.licence,
            proId = this.proId,
            height = this.height,
            weight = this.weight,
            age = this.age,
            targetKcal = this.targetKcal,
            goal = this.goal
        )
    }
}