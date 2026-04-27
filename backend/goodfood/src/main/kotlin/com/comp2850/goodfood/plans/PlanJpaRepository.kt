package com.comp2850.goodfood.plans

import org.springframework.data.jpa.repository.JpaRepository

interface PlanJpaRepository : JpaRepository<PlanEntity, Long> {
    fun findByProIdAndClientIdAndPlanType(proId: String, clientId: String, planType: String): PlanEntity?
    fun findAllByClientId(clientId: String): List<PlanEntity>
    fun findAllByProIdAndClientId(proId: String, clientId: String): List<PlanEntity>
}
