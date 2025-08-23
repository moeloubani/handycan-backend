# HandyCan - Hardware Store Assistant App

## Project Overview
A comprehensive hardware store assistant application built with native Android (Kotlin) that helps customers find products, get project guidance, and receive expert hardware advice through LLM integration.

## Core Components
1. **Native Android App** (Kotlin + Jetpack Compose)
2. **Backend Services** (Multiple microservices on Railway)
3. **LLM Integration** (Groq API → future on-device Qwen models)
4. **Product Database** (Large inventory and knowledge base)
5. **Admin Panel** (Store management interface)

## Current Status
- Android development approach finalized (Native Kotlin)
- Product data scraping infrastructure in place
- Ready for backend architecture design and Railway deployment

## Key Requirements
- Fast API responses for real-time chat
- Scalable microservices architecture
- Cost-effective Railway deployment
- Support for large product/knowledge databases
- Anonymous user support (no authentication required)
- Future on-device ML model integration

## Data Assets
- Comprehensive hardware product data (JSON format)
- Drilling/project guidance data with RAG chunks
- Product analysis and categorization
- Store inventory simulation data

## Technology Stack
- **Frontend**: Native Android (Kotlin + Jetpack Compose)
- **Backend**: Railway-hosted microservices
- **Database**: PostgreSQL (Railway)
- **LLM**: Groq API (remote) → Qwen (on-device future)
- **Communication**: REST APIs with potential WebSocket for real-time features