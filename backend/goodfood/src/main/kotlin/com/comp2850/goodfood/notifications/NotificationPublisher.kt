package com.comp2850.goodfood.notifications

import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service

/**
 * 通知发布者 - 发布实时通知事件
 */
@Service
class NotificationPublisher(
    private val applicationEventPublisher: ApplicationEventPublisher,
    private val notificationJpaRepository: NotificationJpaRepository
) {

    fun publishPlanUpdate(
        userId: String,
        planId: Long,
        planType: String,
        proName: String
    ) {
        val event = PlanUpdatedEvent(
            userId = userId,
            planId = planId,
            planType = planType,
            proName = proName
        )

        // 保存到数据库
        val notification = NotificationEntity(
            userId = userId,
            type = event.type,
            title = "计划已更新",
            message = event.message,
            relatedId = planId.toString()
        )
        notificationJpaRepository.save(notification)

        // 发送事件
        applicationEventPublisher.publishEvent(event)
    }

    fun publishMessage(
        userId: String,
        messageId: Long,
        senderId: String,
        senderName: String,
        messageText: String
    ) {
        val event = MessageReceivedEvent(
            userId = userId,
            messageId = messageId,
            senderId = senderId,
            senderName = senderName,
            message = messageText
        )

        // 保存到数据库
        val notification = NotificationEntity(
            userId = userId,
            type = event.type,
            title = "新消息",
            message = "$senderName: $messageText",
            relatedId = messageId.toString()
        )
        notificationJpaRepository.save(notification)

        // 发送事件
        applicationEventPublisher.publishEvent(event)
    }

    fun publishUserUnbound(userId: String, clientId: String, clientName: String) {
        val event = UserUnboundEvent(
            userId = userId,
            clientId = clientId,
            clientName = clientName
        )

        // 保存到数据库
        val notification = NotificationEntity(
            userId = userId,
            type = event.type,
            title = "客户已解绑",
            message = event.message,
            relatedId = clientId
        )
        notificationJpaRepository.save(notification)

        // 发送事件
        applicationEventPublisher.publishEvent(event)
    }

    fun publishPlanDeleted(
        userId: String,
        planId: Long,
        planType: String,
        proName: String
    ) {
        val event = PlanDeletedEvent(
            userId = userId,
            planId = planId,
            planType = planType,
            proName = proName
        )

        // 保存到数据库
        val notification = NotificationEntity(
            userId = userId,
            type = event.type,
            title = "计划已删除",
            message = event.message,
            relatedId = planId.toString()
        )
        notificationJpaRepository.save(notification)

        // 发送事件
        applicationEventPublisher.publishEvent(event)
    }
}
