package com.handycan.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.handycan.domain.model.ChatMessage
import com.handycan.domain.usecase.SendMessageUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val sendMessageUseCase: SendMessageUseCase
) : ViewModel() {
    
    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    // For demo purposes, using a default store ID
    private val currentStoreId = "1"
    
    fun sendMessage(content: String) {
        // Add user message immediately
        val userMessage = ChatMessage(
            content = content,
            isFromUser = true
        )
        _messages.value = _messages.value + userMessage
        
        // Send message to backend
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            sendMessageUseCase(content, currentStoreId)
                .catch { exception ->
                    _isLoading.value = false
                    _error.value = exception.message ?: "An error occurred"
                    
                    // Add fallback message
                    val errorMessage = ChatMessage(
                        content = "I'm sorry, I'm having trouble connecting to the server right now. Please check your internet connection and try again.",
                        isFromUser = false,
                        timestamp = System.currentTimeMillis(),
                        metadata = mapOf("error" to true)
                    )
                    _messages.value = _messages.value + errorMessage
                }
                .collect { result ->
                    _isLoading.value = false
                    
                    result.fold(
                        onSuccess = { aiMessage ->
                            _messages.value = _messages.value + aiMessage
                        },
                        onFailure = { exception ->
                            _error.value = exception.message ?: "An error occurred"
                            
                            // Add fallback message
                            val errorMessage = ChatMessage(
                                content = "I encountered an error while processing your request. Please try again or rephrase your question.",
                                isFromUser = false,
                                timestamp = System.currentTimeMillis(),
                                metadata = mapOf("error" to true)
                            )
                            _messages.value = _messages.value + errorMessage
                        }
                    )
                }
        }
    }
    
    fun clearError() {
        _error.value = null
    }
    
    fun clearMessages() {
        _messages.value = emptyList()
        _error.value = null
    }
}