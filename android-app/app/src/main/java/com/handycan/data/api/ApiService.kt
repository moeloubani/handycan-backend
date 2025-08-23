package com.handycan.data.api

import com.handycan.data.model.ChatRequest
import com.handycan.data.model.ChatResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    
    @POST("chat/message")
    suspend fun sendChatMessage(@Body request: ChatRequest): Response<ChatResponse>
    
    @GET("chat/conversation/{conversationId}")
    suspend fun getConversationHistory(@Path("conversationId") conversationId: String): Response<List<ChatResponse>>
}