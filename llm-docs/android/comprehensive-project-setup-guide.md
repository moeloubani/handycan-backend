# HandyCan Android Project Setup - Comprehensive Guide

## Executive Summary

Based on extensive research of current Android development best practices and the HandyCan project requirements, this document provides a complete setup guide for creating a native Android application with Clean Architecture, MVVM pattern, Jetpack Compose UI, Hilt dependency injection, and TensorFlow Lite integration.

## Research Methodology

This guide is based on:
- Context7 MCP data from official Android Architecture Samples
- Jetpack Compose best practices from Google's compose-samples repository
- Hilt dependency injection patterns from Dagger documentation
- TensorFlow Lite Android integration guidelines
- Material Design 3 implementation standards

## Project Setup Requirements Analysis

### Core Architecture Components
- **UI Framework**: Jetpack Compose with Material Design 3
- **Architecture**: Clean Architecture + MVVM pattern
- **Dependency Injection**: Hilt (simplified Dagger setup)
- **Networking**: Retrofit + OkHttp for REST API communication
- **ML Integration**: TensorFlow Lite for future on-device LLM support
- **Build System**: Gradle with Kotlin DSL (recommended)

## 1. Android Studio Project Creation Steps

### Step 1: Create New Project
1. Open Android Studio
2. Select "Empty Activity" template
3. Configure project:
   - **Name**: HandyCan
   - **Package name**: `com.handycan.app`
   - **Language**: Kotlin
   - **Minimum SDK**: API 24 (Android 7.0) - Supports 87% of devices
   - **Build configuration language**: Kotlin DSL

### Step 2: Enable Jetpack Compose
During project creation, ensure "Use Jetpack Compose" is checked.

## 2. Build Configuration Files

### Project-level build.gradle.kts
```kotlin
plugins {
    id("com.android.application") version "8.2.0" apply false
    id("org.jetbrains.kotlin.android") version "1.9.10" apply false
    id("com.google.dagger.hilt.android") version "2.56.2" apply false
    id("kotlin-kapt") apply false
}
```

### Module-level build.gradle.kts (app/build.gradle.kts)
```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android")
    id("kotlin-kapt")
}

android {
    namespace = "com.handycan.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.handycan.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "dagger.hilt.android.testing.HiltTestRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        // TensorFlow Lite configuration
        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    // Prevent compression of TensorFlow Lite files
    aaptOptions {
        noCompress += "tflite"
    }
}

dependencies {
    // Jetpack Compose BOM - manages all Compose library versions
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    
    // Core Android libraries
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Jetpack Compose UI
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    
    // Navigation for Compose
    implementation("androidx.navigation:navigation-compose:2.7.5")
    
    // ViewModel and LiveData for Compose
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    
    // Hilt Dependency Injection
    implementation("com.google.dagger:hilt-android:2.56.2")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    kapt("com.google.dagger:hilt-compiler:2.56.2")
    
    // Networking - Retrofit & OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // TensorFlow Lite (for future on-device LLM)
    implementation("org.tensorflow:tensorflow-lite:2.14.0")
    implementation("org.tensorflow:tensorflow-lite-gpu:2.14.0")
    implementation("org.tensorflow:tensorflow-lite-support:0.4.4")
    
    // Image loading for Compose
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Testing dependencies
    testImplementation("junit:junit:4.13.2")
    testImplementation("com.google.dagger:hilt-android-testing:2.56.2")
    kaptTest("com.google.dagger:hilt-compiler:2.56.2")
    
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("com.google.dagger:hilt-android-testing:2.56.2")
    kaptAndroidTest("com.google.dagger:hilt-compiler:2.56.2")
    
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

kapt {
    correctErrorTypes = true
}
```

## 3. Android Manifest Configuration

### AndroidManifest.xml
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Network permissions for API calls -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".HandyCanApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.HandyCan"
        tools:targetApi="31">
        
        <activity
            android:name=".presentation.MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.HandyCan">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## 4. Clean Architecture Project Structure

### Recommended Directory Structure
```
app/src/main/java/com/handycan/app/
├── di/                          # Dependency injection modules
│   ├── DatabaseModule.kt
│   ├── NetworkModule.kt
│   └── RepositoryModule.kt
├── data/                        # Data layer
│   ├── local/                   # Local data sources
│   │   ├── database/
│   │   └── preferences/
│   ├── remote/                  # Remote data sources
│   │   ├── api/
│   │   ├── dto/                 # Data transfer objects
│   │   └── interceptors/
│   └── repository/              # Repository implementations
├── domain/                      # Domain layer
│   ├── model/                   # Domain models
│   ├── repository/              # Repository interfaces
│   └── usecase/                 # Business logic use cases
├── presentation/                # Presentation layer
│   ├── ui/
│   │   ├── chat/               # Chat screen components
│   │   ├── common/             # Reusable UI components
│   │   ├── navigation/         # Navigation setup
│   │   └── theme/              # Material Design 3 theme
│   └── MainActivity.kt
├── util/                        # Utility classes
└── HandyCanApplication.kt       # Application class
```

## 5. Initial Configuration Files

### Application Class (HandyCanApplication.kt)
```kotlin
package com.handycan.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class HandyCanApplication : Application()
```

### MainActivity.kt
```kotlin
package com.handycan.app.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.handycan.app.presentation.ui.navigation.HandyCanNavigation
import com.handycan.app.presentation.ui.theme.HandyCanTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HandyCanTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HandyCanNavigation()
                }
            }
        }
    }
}
```

### Network Module (di/NetworkModule.kt)
```kotlin
package com.handycan.app.di

import com.handycan.app.data.remote.api.HandyCanApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl("https://your-api-base-url.com/") // Replace with actual URL
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): HandyCanApiService {
        return retrofit.create(HandyCanApiService::class.java)
    }
}
```

### Material Design 3 Theme (presentation/ui/theme/Theme.kt)
```kotlin
package com.handycan.app.presentation.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40
)

@Composable
fun HandyCanTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

## 6. Clean Architecture Implementation

### Domain Layer Example

#### Domain Model (domain/model/ChatMessage.kt)
```kotlin
package com.handycan.app.domain.model

data class ChatMessage(
    val id: String,
    val content: String,
    val isFromUser: Boolean,
    val timestamp: Long,
    val type: MessageType = MessageType.TEXT
)

enum class MessageType {
    TEXT, IMAGE, PRODUCT_RECOMMENDATION
}
```

#### Repository Interface (domain/repository/ChatRepository.kt)
```kotlin
package com.handycan.app.domain.repository

import com.handycan.app.domain.model.ChatMessage
import kotlinx.coroutines.flow.Flow

interface ChatRepository {
    suspend fun sendMessage(message: String): Result<ChatMessage>
    fun getChatHistory(): Flow<List<ChatMessage>>
    suspend fun clearChatHistory()
}
```

#### Use Case (domain/usecase/SendMessageUseCase.kt)
```kotlin
package com.handycan.app.domain.usecase

import com.handycan.app.domain.model.ChatMessage
import com.handycan.app.domain.repository.ChatRepository
import javax.inject.Inject

class SendMessageUseCase @Inject constructor(
    private val chatRepository: ChatRepository
) {
    suspend operator fun invoke(message: String): Result<ChatMessage> {
        return chatRepository.sendMessage(message)
    }
}
```

### Data Layer Example

#### API Service (data/remote/api/HandyCanApiService.kt)
```kotlin
package com.handycan.app.data.remote.api

import com.handycan.app.data.remote.dto.ChatResponseDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface HandyCanApiService {
    @POST("chat")
    suspend fun sendChatMessage(@Body message: Map<String, String>): Response<ChatResponseDto>
}
```

### Presentation Layer Example

#### ViewModel (presentation/ui/chat/ChatViewModel.kt)
```kotlin
package com.handycan.app.presentation.ui.chat

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.handycan.app.domain.model.ChatMessage
import com.handycan.app.domain.usecase.SendMessageUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val sendMessageUseCase: SendMessageUseCase
) : ViewModel() {
    
    var chatState = mutableStateOf(ChatUiState())
        private set
    
    fun sendMessage(message: String) {
        viewModelScope.launch {
            chatState.value = chatState.value.copy(isLoading = true)
            
            sendMessageUseCase(message).fold(
                onSuccess = { response ->
                    chatState.value = chatState.value.copy(
                        messages = chatState.value.messages + response,
                        isLoading = false
                    )
                },
                onFailure = { error ->
                    chatState.value = chatState.value.copy(
                        error = error.message,
                        isLoading = false
                    )
                }
            )
        }
    }
}

data class ChatUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)
```

## 7. Version Compatibility and Considerations

### Minimum SDK Requirements
- **Recommended Minimum SDK**: API 24 (Android 7.0)
  - Covers 87% of active Android devices
  - Full Jetpack Compose support
  - TensorFlow Lite compatibility

### Material Design 3 Support
- Dynamic color theming available on Android 12+ (API 31+)
- Graceful fallback to static color schemes on older versions
- Full backward compatibility with Material Design 2 components

### TensorFlow Lite Considerations
- Supports ARMv7 and ARM64 architectures
- GPU acceleration available on compatible devices
- Model size optimization strategies available
- On-device inference suitable for privacy-focused applications

## 8. Testing Strategy

### Unit Testing Setup
```kotlin
// Example test for ChatViewModel
@HiltAndroidTest
class ChatViewModelTest {
    @get:Rule val hiltRule = HiltAndroidRule(this)
    
    @Test
    fun `sendMessage should update chat state correctly`() {
        // Test implementation
    }
}
```

### Integration Testing
- Use Hilt testing utilities for dependency injection
- Compose UI testing with semantics
- Network testing with MockWebServer

## 9. Performance Optimizations

### Build Optimizations
- ABI filtering to reduce APK size
- ProGuard/R8 configuration for release builds
- TensorFlow Lite model optimization

### Runtime Optimizations
- Lazy loading of TensorFlow Lite models
- Efficient Compose recomposition
- Background threading for network operations

## 10. Security Considerations

### Network Security
- HTTPS enforcement
- Certificate pinning for production
- Request/response encryption

### Data Protection
- No user authentication required (anonymous usage)
- Local data encryption for sensitive information
- Privacy-focused on-device ML processing

## Conclusion

This comprehensive setup guide provides a solid foundation for the HandyCan Android application, following current Android development best practices and architectural patterns. The configuration supports:

1. **Scalable Architecture**: Clean Architecture with MVVM ensures maintainable, testable code
2. **Modern UI**: Jetpack Compose with Material Design 3 provides contemporary user experience
3. **Efficient DI**: Hilt simplifies dependency management compared to manual Dagger setup
4. **Future-Ready**: TensorFlow Lite integration prepared for on-device LLM capabilities
5. **Performance**: Optimized build configuration and runtime considerations

The architecture is specifically tailored to support real-time chat functionality, API integration for hardware store data, and future expansion for on-device machine learning capabilities.

## References

- Android Architecture Samples: Official Google samples demonstrating best practices
- Jetpack Compose Documentation: Current UI toolkit patterns and Material Design 3
- Hilt Documentation: Simplified dependency injection setup and testing
- TensorFlow Lite Android Guide: Mobile ML integration and optimization strategies