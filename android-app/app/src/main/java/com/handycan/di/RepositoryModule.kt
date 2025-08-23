package com.handycan.di

import com.handycan.data.repository.ChatRepository
import com.handycan.domain.repository.ChatRepository as ChatRepositoryInterface
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    
    @Binds
    @Singleton
    abstract fun bindChatRepository(
        chatRepository: ChatRepository
    ): ChatRepositoryInterface
}