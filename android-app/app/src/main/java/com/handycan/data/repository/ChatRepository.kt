package com.handycan.data.repository

import com.handycan.data.api.ApiService
import com.handycan.data.model.ChatRequest
import com.handycan.data.model.ChatResponse
import com.handycan.domain.model.ChatMessage
import com.handycan.domain.repository.ChatRepository as ChatRepositoryInterface
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatRepository @Inject constructor(
    private val apiService: ApiService
) : ChatRepositoryInterface {
    
    private var conversationId: String? = null
    
    override suspend fun sendMessage(message: String, storeId: String?): Flow<Result<ChatMessage>> = flow {
        try {
            val request = ChatRequest(
                message = message,
                conversationId = conversationId,
                storeId = storeId
            )
            
            val response = apiService.sendChatMessage(request)
            
            if (response.isSuccessful) {
                val chatResponse = response.body()
                if (chatResponse != null) {
                    // Update conversation ID for future messages
                    conversationId = chatResponse.conversationId
                    
                    // Convert to domain model
                    val chatMessage = ChatMessage(
                        content = chatResponse.response,
                        isFromUser = false,
                        timestamp = System.currentTimeMillis(),
                        metadata = mapOf(
                            "conversationId" to chatResponse.conversationId,
                            "serverTimestamp" to chatResponse.timestamp,
                            "toolsUsed" to (chatResponse.metadata?.toolsUsed ?: false),
                            "processingTime" to (chatResponse.metadata?.processingTime ?: 0)
                        )
                    )
                    
                    emit(Result.success(chatMessage))
                } else {
                    emit(Result.failure(Exception("Empty response from server")))
                }
            } else {
                val error = "Server error: ${response.code()} ${response.message()}"
                emit(Result.failure(Exception(error)))
            }
            
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }
    
    override fun getConversationId(): String? = conversationId
    
    override fun clearConversation() {
        conversationId = null
    }
}