package com.comp2850.goodfood.notifications

/**
 * 事件对象 - 用于通过事件总线传播实时通知
 */
sealed class NotificationEvent {
    abstract val userId: String
    abstract val type: String
    abstract val message: String
}

// Plan 更新事件
data class PlanUpdatedEvent(
    override val userId: String,
    val planId: Long,
    val planType: String, // "meal" or "training"
    val proName: String
) : NotificationEvent() {
    override val type: String = "plan_updated"
    override val message: String = "$proName updated your ${if (planType == "meal") "meal" else "training"} plan"
}

// 消息事件
data class MessageReceivedEvent(
    override val userId: String,
    val messageId: Long,
    val senderId: String,
    val senderName: String,
    override val message: String
) : NotificationEvent() {
    override val type: String = "message_received"
}

// 用户解绑事件
data class UserUnboundEvent(
    override val userId: String,
    val clientId: String,
    val clientName: String
) : NotificationEvent() {
    override val type: String = "user_unbound"
    override val message: String = "Client $clientName has disconnected"
}

// 计划删除事件
data class PlanDeletedEvent(
    override val userId: String,
    val planId: Long,
    val planType: String,
    val proName: String
) : NotificationEvent() {
    override val type: String = "plan_deleted"
    override val message: String = "$proName deleted your ${if (planType == "meal") "meal" else "training"} plan"
}
