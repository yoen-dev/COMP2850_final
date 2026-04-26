package com.comp2850.goodfood.websocket

import com.comp2850.goodfood.notifications.*
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler

/**
 * WebSocket处理器 - 管理客户端连接并推送实时通知
 */
@Component
class NotificationWebSocketHandler : TextWebSocketHandler() {

    private val sessions: MutableMap<String, WebSocketSession> = mutableMapOf()
    private val objectMapper = ObjectMapper()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        // 客户端连接时，从路径参数获取userId
        // 格式: /ws/notifications?userId=xxx
        val query = session.uri?.query
        val userId = parseUserId(query)

        if (userId != null) {
            sessions[userId] = session
            println("WebSocket客户端连接: userId=$userId")
        }
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        sessions.entries.find { it.value == session }?.let {
            sessions.remove(it.key)
            println("WebSocket客户端断开: userId=${it.key}")
        }
    }

    /**
     * 处理Plan更新事件
     */
    @EventListener
    fun handlePlanUpdate(event: PlanUpdatedEvent) {
        sendNotificationToUser(
            event.userId,
            mapOf(
                "type" to "plan_updated",
                "planType" to event.planType,
                "planId" to event.planId,
                "message" to event.message,
                "title" to "计划已更新"
            )
        )
    }

    /**
     * 处理消息事件
     */
    @EventListener
    fun handleMessageReceived(event: MessageReceivedEvent) {
        sendNotificationToUser(
            event.userId,
            mapOf(
                "type" to "message_received",
                "messageId" to event.messageId,
                "senderId" to event.senderId,
                "senderName" to event.senderName,
                "message" to event.message,
                "title" to "新消息"
            )
        )
    }

    /**
     * 处理用户解绑事件
     */
    @EventListener
    fun handleUserUnbound(event: UserUnboundEvent) {
        sendNotificationToUser(
            event.userId,
            mapOf(
                "type" to "user_unbound",
                "clientId" to event.clientId,
                "clientName" to event.clientName,
                "message" to event.message,
                "title" to "客户已解绑"
            )
        )
    }

    /**
     * 处理计划删除事件
     */
    @EventListener
    fun handlePlanDeleted(event: PlanDeletedEvent) {
        sendNotificationToUser(
            event.userId,
            mapOf(
                "type" to "plan_deleted",
                "planType" to event.planType,
                "planId" to event.planId,
                "message" to event.message,
                "title" to "计划已删除"
            )
        )
    }

    private fun sendNotificationToUser(userId: String, data: Map<String, Any>) {
        val session = sessions[userId]
        if (session != null && session.isOpen) {
            try {
                val jsonMessage = objectMapper.writeValueAsString(data)
                session.sendMessage(TextMessage(jsonMessage))
                println("推送通知给 $userId: ${data["message"]}")
            } catch (e: Exception) {
                println("推送消息失败: ${e.message}")
            }
        }
    }

    private fun parseUserId(query: String?): String? {
        if (query == null) return null
        val params = query.split("&")
        for (param in params) {
            if (param.startsWith("userId=")) {
                return param.substringAfter("=")
            }
        }
        return null
    }
}
