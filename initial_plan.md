# Hardware Store Assistant App - Technical Plan

## Project Overview
A mobile application that assists customers in hardware stores by providing expert guidance on projects (like faucet installation), inventory information, and tool recommendations through an AI-powered conversational interface.

## System Architecture

### Mobile Application (Android)
- **Framework**: Native Android with Kotlin
- **UI**: Jetpack Compose with Material Design 3
- **Architecture**: Clean Architecture + MVVM pattern
- **Key Libraries**:
  - Retrofit + OkHttp for API communication
  - Hilt for dependency injection
  - TensorFlow Lite (for future on-device models)
  - Jetpack Compose for chat interface

### Backend Services (Railway)

#### 1. API Gateway + LLM Service
- **Purpose**: Request routing, authentication, Groq API integration
- **Responsibilities**:
  - Route mobile app requests
  - Handle Groq API calls and responses
  - Convert user queries into structured tool calls
  - Manage conversation context
- **Tech Stack**: Node.js/Express or Python/FastAPI

#### 2. Core Business Service
- **Purpose**: Inventory, knowledge base, and admin functions
- **Responsibilities**:
  - Product catalog and inventory management
  - Hardware project knowledge base
  - Installation guides and compatibility rules
  - Admin panel API endpoints
  - Mock store inventory API
- **Tech Stack**: Python/FastAPI or Node.js/Express

#### 3. Database Layer
- **Primary**: PostgreSQL with pgvector extension
- **Purpose**: 
  - Product catalog and inventory data
  - Hardware knowledge base with vector embeddings
  - Store configurations and user analytics
  - Semantic search capabilities
- **Caching**: Redis for frequently accessed data

## Data Architecture

### Product Data Structure
```
Products:
- SKU, name, description, category
- Compatibility information
- Installation requirements
- Store availability and location

Knowledge Base:
- Project guides (faucet installation, etc.)
- Tool requirements and alternatives
- Common problem solutions
- Vector embeddings for semantic search
```

### Store Integration
- Manual store selection in admin panel
- Store-specific inventory and layouts
- Mock API initially, real store APIs later

## LLM Integration Strategy

### Phase 1: Remote LLM (Groq)
- API calls through Gateway service
- Tool calling for inventory and knowledge lookup
- Conversation context management

### Phase 2: On-Device LLM (Qwen)
- Local model integration with TensorFlow Lite
- Reduced API calls and improved privacy
- Fallback to remote for complex queries

## Development Phases

### Phase 1: MVP (8-10 weeks)
1. **Mobile App Foundation** (3 weeks)
   - Basic chat interface
   - API integration layer
   - Clean architecture setup

2. **Backend Services** (3 weeks)
   - API Gateway with Groq integration
   - Core Business Service with mock data
   - PostgreSQL setup with basic schemas

3. **Basic Functionality** (2 weeks)
   - Simple project guidance (faucet example)
   - Mock inventory lookup
   - Basic admin panel

4. **Integration & Testing** (2 weeks)
   - End-to-end testing
   - Performance optimization
   - Deployment to Railway

### Phase 2: Enhanced Features (6-8 weeks)
- Advanced project guidance
- Real inventory integration
- Vector search implementation
- Enhanced admin panel
- Performance optimization

### Phase 3: Production Ready (4-6 weeks)
- On-device LLM integration
- Advanced analytics
- Multi-store support
- iOS development start

## Technology Stack Summary

### Mobile (Android)
- **Language**: Kotlin
- **Framework**: Native Android
- **UI**: Jetpack Compose
- **Architecture**: Clean Architecture + MVVM
- **DI**: Hilt
- **Networking**: Retrofit + OkHttp
- **ML**: TensorFlow Lite

### Backend (Railway)
- **API Gateway**: Node.js/Express or Python/FastAPI
- **Core Service**: Python/FastAPI or Node.js/Express
- **Database**: PostgreSQL + pgvector
- **Caching**: Redis
- **Vector Search**: pgvector extension

### External APIs
- **LLM**: Groq API (Phase 1) → On-device Qwen (Phase 2)
- **Store Inventory**: Mock API → Real store APIs

## Deployment Strategy

### Railway Services
1. **API Gateway Service** (~$15/month)
2. **Core Business Service** (~$15/month)
3. **PostgreSQL Database** (~$8/month)
4. **Redis Cache** (if needed, ~$5/month)

**Total Estimated Cost**: ~$38-43/month

### Environments
- **Development**: Single Railway project with all services
- **Production**: Separate Railway project with monitoring

## Key Features

### Conversational Interface
- Natural language project guidance
- Context-aware suggestions
- Product recommendations
- Installation step-by-step guides

### Inventory Integration
- Real-time product availability
- Store layout navigation
- Alternative product suggestions
- Tool and material lists

### Knowledge Base
- Project-specific guidance
- Compatibility rules
- Common problem solutions
- Tool requirements

### Admin Features
- Store configuration
- Inventory management
- User analytics
- Content management

## Success Metrics
- User completion rate for guided projects
- Time spent in store
- Customer satisfaction scores
- Product recommendation accuracy
- App response time and reliability

## Future Enhancements
- iOS support
- Multiple store chains
- Advanced AR features
- Offline capability
- Voice interface
- Integration with store loyalty programs