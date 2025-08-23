package com.handycan.data.model

data class ChatResponse(
    val response: String,
    val conversationId: String,
    val timestamp: String,
    val metadata: ChatMetadata? = null
)

data class ChatMetadata(
    val toolsUsed: Boolean = false,
    val processingTime: Long = 0
)