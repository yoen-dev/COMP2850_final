package com.comp2850.goodfood.user.repository

import com.comp2850.goodfood.user.Role
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
class UserEntity(

    @Id
    @Column(nullable = false, unique = true)
    var id: String = "",

    @Column(nullable = false)
    var name: String = "",

    @Column(nullable = false, unique = true)
    var email: String = "",

    @Column(nullable = false)
    var passwordHash: String = "",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: Role = Role.SUBSCRIBER,

    @Column(nullable = true)
    var licence: String? = null,

    @Column(nullable = true)
    var proId: String? = null,

    @Column(nullable = true)
    var height: Double? = null,

    @Column(nullable = true)
    var weight: Double? = null,

    @Column(nullable = true)
    var age: Int? = null,

    @Column(nullable = true)
    var targetKcal: Int? = null,

    @Column(nullable = true)
    var goal: String? = null
)