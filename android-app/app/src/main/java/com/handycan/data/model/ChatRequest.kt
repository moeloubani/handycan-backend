package com.handycan.data.model

data class ChatRequest(
    val message: String,
    val conversationId: String? = null,
    val storeId: String? = null
)