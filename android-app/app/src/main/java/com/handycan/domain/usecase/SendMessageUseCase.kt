package com.handycan.domain.usecase

import com.handycan.domain.model.ChatMessage
import com.handycan.domain.repository.ChatRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class SendMessageUseCase @Inject constructor(
    private val chatRepository: ChatRepository
) {
    suspend operator fun invoke(message: String, storeId: String? = null): Flow<Result<ChatMessage>> {
        return chatRepository.sendMessage(message, storeId)
    }
}