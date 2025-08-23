# HandyCan - Hardware Store Assistant

A mobile application that assists customers in hardware stores with project guidance and inventory information.

## Project Structure

```
handycan/
├── android-app/          # Native Android application (Kotlin + Jetpack Compose)
├── backend/
│   ├── api-gateway/      # API Gateway + LLM Service (Node.js/Express)
│   ├── core-service/     # Core Business Service (Node.js/Express)
│   └── database/         # Database scripts and migrations
├── docs/                 # Additional documentation
├── initial_plan.md       # Technical implementation plan
└── external_admin_server.md  # Admin panel specifications
```

## Development Setup

### Prerequisites
- Android Studio
- Node.js 18+
- PostgreSQL
- Railway CLI

### Getting Started
1. Set up Android development environment
2. Deploy backend services to Railway
3. Configure database with pgvector extension
4. Run Android app in emulator/device

## Architecture
- **Mobile**: Native Android with Kotlin/Jetpack Compose
- **Backend**: 3-service Railway deployment
- **Database**: PostgreSQL + pgvector
- **LLM**: Groq API → On-device Qwen transition

See `initial_plan.md` for detailed technical specifications.