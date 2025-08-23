# HandyCan Setup Guide

This guide will help you get the HandyCan hardware store assistant app running locally and deploy it to Railway.

## Prerequisites

- Android Studio (latest version)
- Node.js 18+ and npm
- PostgreSQL (for local development)
- Railway CLI (for deployment)
- Groq API key (optional, for LLM functionality)

## Local Development Setup

### 1. Backend Services Setup

#### Core Service (Port 3002)
```bash
cd backend/core-service
npm install
cp .env.example .env
# Edit .env file with your PostgreSQL connection string
npm run migrate  # Creates tables and seeds data
npm run dev      # Start development server
```

#### API Gateway (Port 3001)
```bash
cd backend/api-gateway
npm install
cp .env.example .env
# Edit .env file with your Groq API key (optional)
npm run dev      # Start development server
```

### 2. Database Setup

#### Using PostgreSQL locally:
```bash
createdb handycan
# Update DATABASE_URL in backend/core-service/.env
# Example: postgresql://username:password@localhost:5432/handycan
```

#### Using Railway PostgreSQL (recommended):
1. Create Railway account at railway.app
2. Create new project
3. Add PostgreSQL service
4. Copy connection string to .env files

### 3. Android App Setup

#### Prerequisites:
- Install Android Studio
- Set up Android emulator or connect physical device
- Enable Developer Options and USB Debugging (for physical device)

#### Build and Run:
```bash
cd android-app
# Open project in Android Studio
# Sync project with Gradle files
# Run app on emulator/device
```

#### Network Configuration:
- The app is configured to connect to `http://10.0.2.2:3001` (emulator localhost)
- For physical device, update the base URL in `NetworkModule.kt` to your computer's IP address

## Railway Deployment

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### 2. Deploy Backend Services

#### Create Railway Project:
```bash
railway new handycan-backend
cd handycan-backend
```

#### Deploy PostgreSQL Database:
```bash
railway add postgresql
# Note the connection string from the Railway dashboard
```

#### Deploy Core Service:
```bash
cd backend/core-service
railway up
# Set environment variables in Railway dashboard
```

#### Deploy API Gateway:
```bash
cd backend/api-gateway  
railway up
# Set environment variables in Railway dashboard
```

### 3. Environment Variables

#### Core Service:
- `DATABASE_URL`: PostgreSQL connection string from Railway
- `NODE_ENV`: production
- `ALLOWED_ORIGINS`: API Gateway URL

#### API Gateway:
- `GROQ_API_KEY`: Your Groq API key (get from console.groq.com)
- `CORE_SERVICE_URL`: URL of deployed Core Service
- `NODE_ENV`: production

### 4. Update Android App Configuration

After deploying to Railway, update the base URL in the Android app:

```kotlin
// In android-app/app/src/main/java/com/handycan/di/NetworkModule.kt
.baseUrl("https://your-api-gateway-url.railway.app/api/")
```

## Testing the Setup

### 1. Backend Health Checks
```bash
curl http://localhost:3002/health  # Core Service
curl http://localhost:3001/health  # API Gateway
```

### 2. API Testing
```bash
# Test chat endpoint
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I need help installing a faucet"}'

# Test product search
curl -X POST http://localhost:3002/api/products/search \
  -H "Content-Type: application/json" \
  -d '{"query": "faucet", "category": "plumbing"}'
```

### 3. Android App Testing
1. Open app in Android Studio
2. Run on emulator or device
3. Test chat functionality
4. Verify network requests in logs

## Troubleshooting

### Common Issues:

#### Database Connection Issues:
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists and is accessible

#### Android Network Issues:
- Use `10.0.2.2` for emulator localhost
- Use actual IP address for physical device testing
- Check network security config for HTTP connections in development

#### Railway Deployment Issues:
- Verify environment variables are set correctly
- Check Railway logs for deployment errors
- Ensure services can communicate with each other

#### CORS Issues:
- Verify `ALLOWED_ORIGINS` includes frontend URLs
- Check CORS configuration in Express servers

## Development Workflow

### Making Backend Changes:
1. Make changes locally
2. Test with `npm run dev`
3. Deploy to Railway: `railway up`
4. Update environment variables if needed

### Making Android Changes:
1. Make changes in Android Studio
2. Test on emulator/device
3. Update API base URL for production testing
4. Build release APK when ready

## Production Considerations

### Security:
- Use HTTPS for all production APIs
- Set strong JWT secrets
- Enable proper CORS policies
- Use environment variables for all secrets

### Performance:
- Enable Redis caching for production
- Monitor API response times
- Implement rate limiting
- Add proper logging and monitoring

### Scalability:
- Consider horizontal scaling for high traffic
- Implement database connection pooling
- Add CDN for static assets
- Monitor resource usage on Railway

## Getting Help

- Check Railway logs: `railway logs`
- Android logcat: View in Android Studio
- Node.js debugging: Add console.log statements
- API testing: Use Postman or curl for endpoint testing

## Next Steps

Once everything is working:
1. Get Groq API key for LLM functionality
2. Customize the hardware knowledge base
3. Add real store inventory APIs
4. Implement user analytics
5. Build the admin panel (see external_admin_server.md)

The app is now ready for development and testing!