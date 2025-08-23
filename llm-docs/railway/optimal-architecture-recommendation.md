# Railway Architecture Recommendation for HandyCan Hardware Store Assistant

## Executive Summary

Based on your requirements for fast development, cost-effectiveness, and scalability, I recommend a **hybrid monolith-to-microservices approach** starting with 3 core services that can be split as needed. This balances Railway's pricing model with development speed while maintaining clear service boundaries.

## Recommended Service Architecture

### Option A: Optimized 3-Service Architecture (RECOMMENDED)

#### 1. **API Gateway + LLM Service** (`handycan-api-gateway`)
- **Purpose**: Request routing, authentication, and LLM processing
- **Technology**: Node.js/Express or Python FastAPI
- **Responsibilities**:
  - Route requests to appropriate services
  - Handle Groq API integration and streaming
  - Process user queries into tool calls
  - Rate limiting and basic auth if needed
- **Rationale**: Combines lightweight routing with LLM processing to minimize inter-service calls

#### 2. **Core Business Service** (`handycan-core`)
- **Purpose**: Inventory, knowledge base, and admin functionality
- **Technology**: Python FastAPI or Node.js
- **Responsibilities**:
  - Product search and inventory management
  - Hardware knowledge base and project guidance
  - Admin panel APIs
  - Mock store API simulation
- **Rationale**: Groups related business logic to reduce database connections and API complexity

#### 3. **Database Service** (`handycan-postgres`)
- **Purpose**: Centralized data storage
- **Technology**: PostgreSQL on Railway
- **Schema Design**:
  - Products and inventory tables
  - Knowledge base with vector embeddings (using pgvector)
  - User analytics and admin data
  - Mock store configurations

### Option B: Full Microservices (Higher Cost)

If budget allows and team size justifies complexity:

1. **API Gateway Service** - Routing and auth only
2. **LLM Service** - Groq integration and query processing
3. **Inventory Service** - Product data and search
4. **Knowledge Service** - Project guidance and compatibility
5. **Admin Service** - Store management and analytics
6. **Mock Store API** - Store system simulation

## Database Strategy

### Recommended: Shared PostgreSQL with Domain Separation

```sql
-- Schema structure
handycan_db/
├── inventory/          -- Products, categories, stock
├── knowledge/          -- Project guides, compatibility rules
├── admin/             -- Store config, analytics
├── llm_cache/         -- Query results caching
└── mock_stores/       -- Store API simulation data
```

**Benefits**:
- Single database connection reduces Railway costs
- ACID transactions across domains when needed
- Simplified backup and migration
- Better for smaller team management

**Vector Storage**:
- Use `pgvector` extension for product and knowledge embeddings
- Enable semantic search across your comprehensive hardware data
- Store RAG chunks with vector representations

## Service Communication

### Recommended: Direct HTTP with Caching

```javascript
// Example service communication pattern
const inventoryAPI = {
  searchProducts: async (query) => {
    // Cache-first approach
    const cached = await redis.get(`search:${query}`);
    if (cached) return JSON.parse(cached);
    
    const result = await fetch(`${CORE_SERVICE_URL}/api/inventory/search`, {
      method: 'POST',
      body: JSON.stringify({ query })
    });
    
    await redis.setex(`search:${query}`, 300, JSON.stringify(result));
    return result;
  }
};
```

**Why not message queues initially**:
- Added complexity for small team
- Railway charges per service
- HTTP is sufficient for your use cases
- Can migrate to Redis pub/sub later if needed

## Railway-Specific Optimizations

### 1. Resource Allocation
```yaml
# Railway service configuration
api-gateway:
  memory: 512MB    # Lightweight routing + LLM calls
  cpu: 0.5 vCPU
  
core-service:
  memory: 1GB      # Business logic + database queries
  cpu: 1 vCPU
  
postgres:
  memory: 1GB      # Large dataset storage
  storage: 5GB     # Your comprehensive hardware data
```

### 2. Environment Variable Strategy
```bash
# Shared variables across services
DATABASE_URL=postgresql://...
GROQ_API_KEY=your_key_here
REDIS_URL=redis://...

# Service-specific variables  
CORE_SERVICE_URL=https://handycan-core.railway.app
API_GATEWAY_URL=https://handycan-api-gateway.railway.app
```

### 3. Deployment Strategy
- **Start with staging environment using same architecture**
- **Use Railway's branch deployments for feature testing**
- **Implement blue-green deployment for zero downtime**

## Cost Analysis

### Option A (3 Services) - Estimated Monthly Cost
- API Gateway: ~$8/month (512MB, 0.5 vCPU)
- Core Service: ~$15/month (1GB, 1 vCPU)
- PostgreSQL: ~$15/month (1GB RAM, 5GB storage)
- **Total: ~$38/month**

### Option B (6 Services) - Estimated Monthly Cost  
- 5 Application Services: ~$60/month
- PostgreSQL: ~$15/month
- **Total: ~$75/month**

### Monolithic Alternative
- Single large service: ~$25/month (2GB, 1.5 vCPU)
- PostgreSQL: ~$15/month
- **Total: ~$40/month**

**Recommendation**: Start with Option A, provides good separation without excessive costs.

## Development Environment Strategy

### Local Development
```bash
# Docker Compose setup
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: handycan_dev
    volumes:
      - ./data:/var/lib/postgresql/data
      
  api-gateway:
    build: ./api-gateway
    ports: 
      - "3000:3000"
    depends_on: [postgres]
    
  core-service:
    build: ./core-service  
    ports:
      - "3001:3001"
    depends_on: [postgres]
```

### Railway Environments
1. **Development**: Feature branch deployments
2. **Staging**: Main branch deployment with production data subset
3. **Production**: Protected branch with manual deployment approval

## Large Knowledge Database Handling

### Strategy for Your Hardware Data

Based on your existing data assets, implement a hybrid approach:

#### 1. **Structured Product Data**
```sql
-- Products table with full-text search
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  description TEXT,
  category VARCHAR(100),
  specifications JSONB,
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || description)
  ) STORED
);

CREATE INDEX idx_products_search ON products USING GIN(search_vector);
```

#### 2. **Vector Embeddings for Semantic Search**
```sql
-- Install pgvector extension
CREATE EXTENSION vector;

-- Knowledge embeddings table
CREATE TABLE knowledge_embeddings (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536),  -- OpenAI embedding size
  metadata JSONB,
  chunk_index INTEGER
);

CREATE INDEX idx_knowledge_embeddings ON knowledge_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### 3. **Caching Strategy**
- **Redis for hot data**: Frequently searched products
- **Application-level caching**: Query results and computed recommendations
- **CDN for static assets**: Product images and documentation

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. Set up Railway project with 3 services
2. Deploy PostgreSQL with basic schema
3. Implement API Gateway with basic routing
4. Create Core Service with product search endpoint
5. Load your existing hardware data into PostgreSQL

### Phase 2: LLM Integration (Week 2-3)  
1. Integrate Groq API in Gateway service
2. Implement tool calling for inventory searches
3. Add conversation context management
4. Create streaming response endpoints

### Phase 3: Knowledge Base (Week 3-4)
1. Process your RAG chunks into vector embeddings
2. Implement semantic search with pgvector
3. Add project guidance and compatibility APIs
4. Create admin endpoints for content management

### Phase 4: Optimization (Week 4-5)
1. Add Redis caching layer
2. Implement monitoring and logging
3. Performance testing and optimization
4. Staging environment deployment

## Monitoring and Observability

### Railway Built-in Features
- **Metrics**: CPU, memory, and request monitoring
- **Logs**: Centralized logging across services
- **Deployments**: Track deployment history and rollbacks

### Additional Recommendations
```javascript
// Add structured logging
const logger = {
  info: (message, meta) => console.log(JSON.stringify({
    level: 'info',
    message,
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME,
    ...meta
  }))
};

// Add performance monitoring
const trackAPICall = async (endpoint, operation) => {
  const start = Date.now();
  try {
    const result = await operation();
    logger.info(`API call completed`, {
      endpoint,
      duration: Date.now() - start,
      status: 'success'
    });
    return result;
  } catch (error) {
    logger.info(`API call failed`, {
      endpoint, 
      duration: Date.now() - start,
      status: 'error',
      error: error.message
    });
    throw error;
  }
};
```

## Security Considerations

### API Security
- **Rate limiting** per IP address
- **Input validation** for all endpoints  
- **SQL injection** prevention with parameterized queries
- **CORS** configuration for Android app

### Data Security
- **Environment variables** for all secrets
- **Database connection** over SSL
- **API keys** rotated regularly
- **Audit logging** for admin actions

## Migration Path from Mock to Real Store APIs

### Current: Mock Store API
```javascript
// Mock implementation in core service
app.get('/api/stores/:storeId/inventory', (req, res) => {
  const mockData = generateMockInventory(req.params.storeId);
  res.json(mockData);
});
```

### Future: Real Store Integration
```javascript
// Adapter pattern for different store systems
class StoreAPIAdapter {
  constructor(storeType) {
    this.adapter = this.getAdapter(storeType);
  }
  
  getAdapter(type) {
    switch(type) {
      case 'rona': return new RonaAPIAdapter();
      case 'homedepot': return new HomeDepotAPIAdapter();
      case 'lowes': return new LowesAPIAdapter();
      default: return new MockAPIAdapter();
    }
  }
  
  async getInventory(storeId, productId) {
    return this.adapter.getInventory(storeId, productId);
  }
}
```

## Conclusion

The recommended 3-service architecture provides:

1. **Cost Effectiveness**: ~$38/month vs $75+ for full microservices
2. **Development Speed**: Clear service boundaries without excessive complexity
3. **Scalability**: Easy to split services as usage grows
4. **Railway Optimization**: Leverages Railway's strengths while minimizing costs
5. **Future Flexibility**: Can evolve to full microservices or consolidate further

**Next Steps**:
1. Create Railway project with recommended service structure
2. Set up PostgreSQL with your existing hardware data
3. Implement API Gateway with basic Groq integration
4. Build Core Service with product search capabilities
5. Deploy staging environment for testing

This architecture balances all your requirements while providing a clear path for growth and optimization as your application scales.