package com.handycan.domain.repository

import com.handycan.domain.model.ChatMessage
import kotlinx.coroutines.flow.Flow

interface ChatRepository {
    suspend fun sendMessage(message: String, storeId: String? = null): Flow<Result<ChatMessage>>
    fun getConversationId(): String?
    fun clearConversation()
}