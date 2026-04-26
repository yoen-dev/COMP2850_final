# 实时同步与通知系统 - 实现总结

## 项目现状
✅ **用户端UI** - 已成功实现
⚙️ **实时同步与通知** - 已完成实现（新增）
⚙️ **闭环逻辑** - 已完成实现（新增）

---

## 实现内容

### 1️⃣ 核心依赖添加
**文件**: [build.gradle.kts](../../build.gradle.kts)

添加了以下关键依赖：
- `spring-boot-starter-websocket` - WebSocket实时通信支持
- 修复了 `jackson-module-kotlin` 的正确导入路径

### 2️⃣ 通知系统数据库层

#### NotificationEntity.kt
- 表名: `notifications`
- 字段: `userId`, `type`, `title`, `message`, `relatedId`, `isRead`, `createdAt`
- 支持多种通知类型: `plan_updated`, `message_received`, `user_unbound`, `plan_deleted`

#### NotificationJpaRepository.kt
- `findByUserId()` - 获取用户所有通知
- `findUnreadByUserId()` - 获取未读通知
- `countUnreadByUserId()` - 统计未读数

### 3️⃣ 事件系统

#### NotificationEvent.kt (事件定义)
四种核心事件：

```
1. PlanUpdatedEvent
   - 用户: 专家修改了Plan时触发
   - 推送给: 客户端

2. MessageReceivedEvent
   - 用户: 新消息到达时触发
   - 推送给: 接收者

3. UserUnboundEvent
   - 用户: 客户解绑时触发
   - 推送给: 专家端

4. PlanDeletedEvent
   - 用户: 计划被删除时触发
   - 推送给: 客户端
```

#### NotificationPublisher.kt
中央发布者，负责：
- 保存通知到数据库
- 发布事件到ApplicationEventPublisher
- 触发WebSocket推送

### 4️⃣ WebSocket实时推送

#### WebSocketConfig.kt
- 注册WebSocket端点: `/ws/notifications`
- 允许跨域访问

#### NotificationWebSocketHandler.kt
- 管理客户端连接
- 监听四种通知事件
- 将事件转换为JSON消息推送给客户端
- **连接格式**: `ws://localhost:8080/ws/notifications?userId=xxx`

### 5️⃣ API接口层

#### ApiPlansController.kt (已修改)
- **PUT /api/plans/{clientId}** - 保存计划时触发 `PlanUpdatedEvent`
- **DELETE /api/plans/{planId}** - 删除计划 ✨ **新增**
  - 删除时触发 `PlanDeletedEvent`
  - 推送给客户端

#### ApiMessagesController.kt (已修改)
- **POST /api/messages** - 发送消息时触发 `MessageReceivedEvent`
- 推送给接收者

#### ApiClientsController.kt (已修改)
- **DELETE /api/clients/{id}/bind** - 解绑客户
  - 触发 `UserUnboundEvent`
  - 推送给专家端

#### ApiNotificationsController.kt ✨ **新增**
```
GET  /api/notifications              - 获取所有通知
GET  /api/notifications/unread-count - 获取未读数
PUT  /api/notifications/{id}/read    - 标记为已读
PUT  /api/notifications/read-all     - 标记全部为已读
DELETE /api/notifications/{id}       - 删除通知
```

---

## 工作流程示意

```
┌─────────────────────────────────────────────────────────────┐
│ 专家端操作 (保存Plan)                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ ApiPlansController.savePlan()    │
        └────────────────┬─────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────┐
        │ notificationPublisher            │
        │ .publishPlanUpdate()             │
        └────────┬──────────────┬──────────┘
                 │              │
        ┌────────▼──┐  ┌─────────▼────────────────┐
        │保存到DB   │  │发布PlanUpdatedEvent     │
        │(通知表)   │  │(Spring ApplicationEvent)│
        └───────────┘  └─────────┬────────────────┘
                                 │
                 ┌───────────────▼───────────────┐
                 │ NotificationWebSocketHandler  │
                 │ .handlePlanUpdate(event)      │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │找到对应客户端   │
                        │的WebSocket连接  │
                        └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │推送JSON消息到   │
                        │客户端(实时更新) │
                        └─────────────────┘
```

---

## 客户端集成指南

### WebSocket连接示例

```javascript
// 连接到WebSocket
const userId = "client_id_123";
const ws = new WebSocket(`ws://localhost:8080/ws/notifications?userId=${userId}`);

// 监听消息
ws.onmessage = function(event) {
    const notification = JSON.parse(event.data);
    
    switch(notification.type) {
        case 'plan_updated':
            console.log(`计划已更新: ${notification.planType}`);
            // 刷新计划模块
            refreshPlans();
            break;
            
        case 'message_received':
            console.log(`新消息: ${notification.senderName}`);
            // 显示消息提示
            showNewMessage(notification);
            break;
            
        case 'plan_deleted':
            console.log(`计划已删除: ${notification.planType}`);
            // 刷新计划列表
            refreshPlans();
            break;
    }
};

// 查询通知
async function getNotifications() {
    const response = await fetch('/api/notifications');
    const notifications = await response.json();
    return notifications;
}

// 查询未读数
async function getUnreadCount() {
    const response = await fetch('/api/notifications/unread-count');
    const data = await response.json();
    return data.unreadCount;
}
```

---

## 测试API端点

### 1. 获取通知
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications
```

### 2. 获取未读数
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/unread-count
```

### 3. 标记为已读
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/notifications/123/read
```

### 4. 删除计划 (触发通知)
```bash
curl -X DELETE \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/plans/456
```

---

## 数据库变化

### 新增表: `notifications`
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    notification_type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    related_id VARCHAR(255),
    is_read INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 代码文件清单

### 新增文件
- `notifications/NotificationEntity.kt`
- `notifications/NotificationJpaRepository.kt`
- `notifications/NotificationEvent.kt`
- `notifications/NotificationPublisher.kt`
- `notifications/ApiNotificationsController.kt`
- `websocket/WebSocketConfig.kt`
- `websocket/NotificationWebSocketHandler.kt`

### 修改文件
- `build.gradle.kts` - 添加WebSocket和Jackson依赖
- `plans/ApiPlansController.kt` - 添加删除功能和通知推送
- `messages/ApiMessagesController.kt` - 添加通知推送
- `clients/ApiClientsController.kt` - 添加解绑通知推送
- `src/main/resources/application.properties` - 修复H2方言配置

---

## 核心特性

✅ **双向实时性**
- 专家操作 → 用户端即时收到WebSocket消息
- 支持离线通知存储（数据库）

✅ **多维度同步**
- 消息模块：消息即时可见
- 健身计划模块：训练计划实时更新
- Plan模块：大计划实时更新

✅ **交互逻辑**
- 用户端显示红点提示
- 未读计数功能
- 通知管理（标记已读、删除）

✅ **闭环逻辑**
- 解绑提示：用户解绑时专家侧收到通知
- 计划删除：支持删除按钮，客户端收到删除通知

---

## 应用启动

```bash
cd backend/goodfood
./gradlew clean build
java -jar build/libs/goodfood-0.0.1-SNAPSHOT.jar
```

应用运行在 `http://localhost:8080`
WebSocket端点: `ws://localhost:8080/ws/notifications?userId=xxx`

