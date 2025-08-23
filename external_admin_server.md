# External Admin Server - Management Platform

## Overview
A comprehensive web-based administration platform for managing the Hardware Store Assistant app ecosystem. This separate system handles user management, analytics, store configuration, and content management across all connected stores.

## System Architecture

### Deployment Strategy
- **Separate Railway Project**: Independent from main app services
- **Custom Domain**: admin.hardwareassistant.com
- **SSL Certificate**: Automatic via Railway
- **Environment**: Production-only initially

### Technology Stack
- **Frontend**: React with TypeScript
- **Backend**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL (separate from app database)
- **Authentication**: Auth0 or Firebase Auth
- **UI Framework**: Tailwind CSS + Headless UI
- **Charts/Analytics**: Chart.js or Recharts

## Core Modules

### 1. User Management
- **Admin Users**: Store managers, corporate admins, support staff
- **Role-Based Access Control**:
  - Super Admin: Full system access
  - Store Manager: Single store management
  - Analyst: Read-only analytics
  - Support: User assistance tools

### 2. Store Management
- **Store Configuration**:
  - Store profile (name, location, contact)
  - Inventory API configuration
  - Store layout mapping
  - Operating hours and policies
- **Multi-Store Support**:
  - Corporate chains with multiple locations
  - Independent store management
  - Franchise model support

### 3. Analytics Dashboard
- **App Usage Metrics**:
  - Daily/monthly active users per store
  - Session duration and frequency
  - Most requested projects and products
  - Conversation completion rates
- **Business Intelligence**:
  - Product recommendation accuracy
  - Customer journey analysis
  - Peak usage times by store
  - Project completion success rates
- **Performance Monitoring**:
  - API response times
  - LLM query performance
  - Error rates and types
  - System health metrics

### 4. Content Management
- **Knowledge Base Management**:
  - Project guides creation and editing
  - Product compatibility rules
  - Installation step libraries
  - Troubleshooting content
- **Product Catalog Management**:
  - Category management
  - Product metadata enrichment
  - Image and document uploads
  - Bulk import/export tools

### 5. System Configuration
- **LLM Settings**:
  - Model selection (Groq vs on-device)
  - Response parameters tuning
  - Tool calling configuration
  - Conversation flow management
- **API Management**:
  - External API configurations
  - Rate limiting settings
  - Cache management
  - Integration monitoring

## Database Schema

### Admin Users
```sql
admin_users:
- id, email, name, role
- store_ids (array for multi-store access)
- created_at, last_login
- permissions (JSON)

stores:
- id, name, address, phone
- api_config (JSON)
- settings (JSON)
- created_at, updated_at

usage_analytics:
- id, store_id, date
- active_users, sessions
- queries, completions
- metrics (JSON)
```

### Audit Logging
```sql
audit_logs:
- id, admin_id, action
- entity_type, entity_id
- old_values, new_values (JSON)
- timestamp, ip_address
```

## User Interface Design

### Dashboard Layout
1. **Navigation Sidebar**:
   - Dashboard overview
   - Store management
   - Analytics
   - Content management
   - System settings
   - User management

2. **Main Content Area**:
   - Responsive grid layout
   - Interactive charts and graphs
   - Data tables with filtering
   - Modal dialogs for forms

### Key Pages

#### Dashboard Overview
- KPI cards (users, sessions, success rate)
- Usage trends chart
- Recent activity feed
- System status indicators

#### Store Management
- Store list with search/filter
- Individual store configuration
- Inventory API testing tools
- Store performance metrics

#### Analytics
- Interactive charts and filters
- Exportable reports
- Custom date ranges
- Drill-down capabilities

#### Content Management
- Rich text editor for guides
- Media upload interface
- Version control for content
- Preview and publishing tools

## Security Features

### Authentication & Authorization
- Multi-factor authentication required
- Session management with timeout
- Role-based route protection
- IP allowlisting for sensitive operations

### Data Protection
- Encrypted data at rest and in transit
- PII data handling compliance
- Audit trail for all changes
- Regular security scans

### API Security
- JWT token authentication
- Rate limiting per user/role
- Request validation and sanitization
- CORS configuration

## Integration Points

### Main App Services
- **Read-Only Access**: Analytics data from app database
- **Configuration Sync**: Store settings and content updates
- **Real-Time Updates**: WebSocket for live monitoring
- **API Coordination**: Manages external API configurations

### External Services
- **Analytics Providers**: Google Analytics, Mixpanel integration
- **Email Services**: Notification and alert systems
- **Monitoring Tools**: Uptime monitoring, error tracking
- **Backup Services**: Automated data backup and recovery

## Development Phases

### Phase 1: Core Admin (4-6 weeks)
1. **Authentication System** (1 week)
   - User login and role management
   - Basic security implementation

2. **Store Management** (2 weeks)
   - Store CRUD operations
   - Basic configuration interface

3. **Dashboard Overview** (1 week)
   - KPI displays
   - Basic analytics visualization

4. **Content Management MVP** (2 weeks)
   - Simple knowledge base editing
   - Product catalog management

### Phase 2: Advanced Analytics (3-4 weeks)
1. **Comprehensive Analytics** (2 weeks)
   - Advanced charting
   - Custom reporting
   - Data export functionality

2. **Performance Monitoring** (1 week)
   - System health dashboards
   - Alert configuration

3. **User Management** (1 week)
   - Advanced role management
   - Audit logging interface

### Phase 3: Advanced Features (4-6 weeks)
1. **Real-Time Monitoring** (2 weeks)
   - Live usage dashboards
   - WebSocket integration

2. **Advanced Content Tools** (2 weeks)
   - Rich content editor
   - Version control system
   - Content workflow management

3. **API Management** (2 weeks)
   - External API configuration
   - Integration testing tools
   - Performance optimization

## Deployment Configuration

### Railway Services
- **Admin Frontend**: Static site hosting (~$5/month)
- **Admin Backend API**: Express/FastAPI service (~$15/month)
- **Admin Database**: PostgreSQL instance (~$8/month)
- **Redis Cache**: Session and data caching (~$5/month)

**Total Estimated Cost**: ~$33/month

### Monitoring & Alerts
- **Uptime Monitoring**: Railway health checks
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: New Relic or similar
- **Log Aggregation**: Railway logs + external service

## Success Metrics

### Administrative Efficiency
- Time to configure new stores
- Content update frequency
- User onboarding time
- Issue resolution speed

### System Performance
- Dashboard load times
- Data synchronization speed
- API response times
- System availability (99.9% target)

### User Adoption
- Admin user engagement
- Feature utilization rates
- Support ticket reduction
- Store manager satisfaction

## Future Enhancements

### Advanced Analytics
- Machine learning insights
- Predictive analytics
- Customer behavior modeling
- Automated reporting

### Automation Features
- Auto-scaling configuration
- Intelligent alerting
- Content auto-generation
- Performance optimization suggestions

### Integration Expansions
- CRM system integration
- POS system connections
- Supply chain management
- Marketing automation tools

### Mobile Admin App
- Native mobile app for store managers
- Offline capability
- Push notifications
- Quick configuration changes