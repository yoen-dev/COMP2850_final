package com.comp2850.goodfood.plans

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "client_plans")
class PlanEntity(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "pro_id", nullable = false)
    var proId: String = "",

    @Column(name = "client_id", nullable = false)
    var clientId: String = "",

    /** "meal" or "training" */
    @Column(name = "plan_type", nullable = false)
    var planType: String = "meal",

    /** JSON array of 7 strings, one per day MON-SUN */
    @Column(name = "days_json", nullable = false, length = 2000)
    var daysJson: String = "[\"\",\"\",\"\",\"\",\"\",\"\",\"\"]",

    /** Daily calorie target (only for meal plans) */
    @Column(name = "target_kcal")
    var targetKcal: Int? = null,

    /** Daily protein target in grams (only for meal plans) */
    @Column(name = "target_protein")
    var targetProtein: Int? = null,

    /** Daily carbs target percentage (only for meal plans) */
    @Column(name = "target_carbs_pct")
    var targetCarbsPct: Int? = null,

    /** Daily fat target percentage (only for meal plans) */
    @Column(name = "target_fat_pct")
    var targetFatPct: Int? = null,

    /** Free-text notes from the professional */
    @Column(name = "notes", length = 1000)
    var notes: String? = null,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
