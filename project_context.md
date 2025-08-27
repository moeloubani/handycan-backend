# HandyCan Project Context & Deployment Architecture

## Project Overview
HandyCan is a hardware store assistant mobile app that provides AI-powered guidance for DIY projects, product recommendations, and installation instructions. The system uses a microservices architecture with an Android frontend and Railway-hosted backend.

## Deployed Architecture on Railway

### Service Configuration
- **Railway Project**: handycan-backend
- **Deployment Date**: January 2025
- **Architecture Pattern**: Microservices with API Gateway

### Active Services

#### 1. PostgreSQL Database
- **Service Type**: Railway PostgreSQL addon
- **Status**: ✅ Fully operational
- **Features**: 
  - pgvector extension enabled for semantic search
  - TCP proxy for external connections
- **External Access**: shinkansen.proxy.rlwy.net:14513
- **Internal Connection**: Automatic DATABASE_URL environment variable

#### 2. API Gateway Service
- **URL**: https://handycan-api-gateway-production.up.railway.app
- **Status**: ✅ Fully operational
- **Port**: 3001 (internal), 443 (external HTTPS)
- **Role**: 
  - Routes mobile app requests
  - Handles Groq LLM API integration
  - Processes chat conversations
  - Converts user queries to tool calls
- **Health Check**: `/health` endpoint available
- **Key Endpoints**:
  - `POST /api/chat/message` - Main chat interface
  - `GET /api/chat/conversation/{id}` - Conversation history

#### 3. Core Business Service
- **URL**: https://handycan-core-service-production.up.railway.app
- **Status**: ⚠️ Deployed but needs database migration fix
- **Port**: 3002 (internal), 443 (external HTTPS)
- **Role**:
  - Product catalog and inventory management
  - Project guides and installation instructions
  - Store configuration and analytics
  - Compatibility checking
- **Key Endpoints**:
  - `POST /api/products/search` - Product search
  - `GET /api/guides/{projectType}` - Project guides
  - `POST /api/compatibility/check` - Compatibility verification

### Service Communication Flow
```
Android App → API Gateway → Core Service → PostgreSQL
     ↓              ↓            ↓           ↑
   HTTPS        Tool Calls   Database     Data
  Requests      Execution    Queries    Storage
```

### Environment Variables Configuration

#### API Gateway Service
- `GROQ_API_KEY`: ⚠️ **NEEDS UPDATE** - Currently placeholder
- `CORE_SERVICE_URL`: https://handycan-core-service-production.up.railway.app
- `ALLOWED_ORIGINS`: Configured for mobile app access
- `NODE_ENV`: production
- `PORT`: 3001

#### Core Service
- `DATABASE_URL`: Automatically provided by Railway PostgreSQL
- `ALLOWED_ORIGINS`: API Gateway URL + mobile app origins
- `NODE_ENV`: production
- `PORT`: 3002

### Security Configuration
- **CORS**: Properly configured for cross-origin requests
- **HTTPS**: Automatic SSL/TLS via Railway
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers enabled
- **Proxy Trust**: Configured for Railway's reverse proxy

## Mobile App Architecture

### Android Application
- **Framework**: Native Android with Kotlin
- **UI**: Jetpack Compose with Material Design 3
- **Architecture**: Clean Architecture + MVVM
- **Dependency Injection**: Hilt
- **Networking**: Retrofit + OkHttp
- **Target API**: API 24+ (Android 7.0+)

### Key Components
- **ChatScreen**: Main conversational interface
- **ChatViewModel**: Handles UI state and API communication
- **SendMessageUseCase**: Business logic for message processing
- **ChatRepository**: Data layer for API calls
- **NetworkModule**: Retrofit configuration and HTTP client setup

## Data Models & API Integration

### Core Data Models
```kotlin
// Domain Models
ChatMessage(id, content, isFromUser, timestamp, metadata)
Product(sku, name, description, category, price, availability)
ProjectGuide(id, title, steps, difficulty, tools, materials)

// API Models
ChatRequest(message, conversationId, storeId)
ChatResponse(response, conversationId, timestamp, metadata)
```

### API Communication
- **Base URL**: Configured for Railway API Gateway
- **Authentication**: Currently anonymous (store-based identification)
- **Error Handling**: Comprehensive with fallback messages
- **Offline Support**: Basic error states implemented

## Database Schema

### Tables
- `products`: Hardware inventory with compatibility arrays
- `project_guides`: Step-by-step installation guides (JSONB steps)
- `stores`: Store configurations and API settings
- `compatibility_rules`: Product compatibility matrix
- `usage_analytics`: User interaction tracking

### Sample Data
- 10 hardware products (faucets, tools, supplies)
- Complete faucet installation guide with 8 detailed steps
- 2 sample stores with API configurations
- 5 compatibility rules for common product combinations

## LLM Integration

### Current Setup
- **Provider**: Groq API (llama3-70b-8192 model)
- **Features**: Tool calling, conversation context, structured responses
- **Tools Available**:
  - `search_products`: Find products in inventory
  - `get_project_guide`: Retrieve installation guides
  - `check_compatibility`: Verify product compatibility

### Tool Call Flow
```
User Message → LLM Processing → Tool Calls → Data Retrieval → Final Response
```

## Deployment Status & Next Steps

### ✅ Completed
- Railway project setup and service deployment
- PostgreSQL database with pgvector extension
- API Gateway fully operational
- Environment variables configured
- Security and CORS properly set up

### ⚠️ In Progress
- Core Service database migration (needs debugging)
- Complete end-to-end API testing

### 📋 Remaining Tasks
1. **Fix Core Service**: Debug database migration issues
2. **Add Groq API Key**: Replace placeholder with actual key
3. **Mobile App Configuration**: Update base URL for Railway
4. **Testing**: End-to-end functionality verification

## Cost Structure & Resource Usage

Railway uses usage-based pricing with the following components:
- **Database**: PostgreSQL addon (~$5-10/month base + usage)
- **API Gateway**: Compute time + bandwidth
- **Core Service**: Compute time + bandwidth
- **Total Estimated**: $15-25/month actual usage (much lower than initial $38 estimate)

Usage is based on:
- CPU time (per second)
- Memory usage
- Network bandwidth
- Database storage and queries

## Development Workflow

### Local Development
1. Run services locally (ports 3001, 3002)
2. Use local PostgreSQL or Railway database
3. Android app connects to localhost (10.0.2.2 for emulator)

### Production Testing
1. Update Android app base URL to Railway API Gateway
2. Build and test on device/emulator
3. Monitor Railway logs for debugging

## Monitoring & Maintenance

### Health Checks
- API Gateway: `/health` endpoint
- Core Service: `/health` endpoint (once operational)
- Database: Railway dashboard monitoring

### Logging
- Railway provides centralized logging
- Node.js console.log statements captured
- Error tracking and performance monitoring available

## Future Enhancements
- Admin panel deployment (separate Railway project)
- On-device LLM integration (Android TensorFlow Lite)
- Real store inventory API integration
- Enhanced analytics and user tracking
- iOS app development (React Native or native)