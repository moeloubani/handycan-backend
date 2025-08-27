# HandyCan Backend Deployment Crash Investigation Report

**Date:** 2025-08-27  
**Investigator:** Railway Platform Debug Specialist  
**Project:** handycan-backend (ID: e416fa58-72e1-41bf-8f56-f4cdfd5979e5)  

## Issue Summary

The HandyCan backend deployment experienced critical failures with both the PostgreSQL database service and Core Service failing to deploy properly. The API Gateway was the only service running successfully. The root causes were:
1. Incorrect Docker image tag for PostgreSQL/pgvector deployment
2. Missing PGDATA environment variable configuration 
3. Database connection issues preventing Core Service startup
4. Nixpacks build system overriding custom start commands

## Investigation Steps

### 1. Initial Service Status Check
- **API Gateway**: SUCCESS ✅ (deployment ID: af1354c7-ddf4-43bc-84c6-bc3ba180ae90)
- **Core Service**: CRASHED ❌ (deployment ID: 98e41e86-dc09-4bb9-b845-2c3aa691c677)
- **PostgreSQL/pgvector**: FAILED ❌ (deployment ID: 0e6143c5-df62-401a-8941-fd6960284abc)

### 2. PostgreSQL Service Diagnosis
**Problem:** The pgvector service failed with error: "This image does not have a 'latest' tag"
**Root Cause:** The service was created with "pgvector/pgvector:latest" but this tag doesn't exist
**Solution:** 
- Deleted the failed service
- Deployed new pgvector service using Railway's official template (ID: c561e80b-d62d-4ea6-84ad-7961cdf353cb)

### 3. PGDATA Environment Variable Issue
**Problem:** New pgvector deployment crashed with "mkdir: cannot create directory '': No such file or directory"
**Root Cause:** Empty PGDATA environment variable
**Solution:** Set PGDATA to `/var/lib/postgresql/data/pgdata`
**Result:** pgvector service started successfully (deployment ID: cc64643b-a12c-42cf-9c18-d06620872140)

### 4. Core Service Database Connection Issues
**Problem:** Core Service repeatedly crashed with "Error: Connection terminated unexpectedly" and "ECONNRESET"
**Root Causes:**
1. Database connection timeout too short (2 seconds)
2. Incorrect DATABASE_URL pointing to old proxy
3. Migration script running before database was ready

**Solutions Applied:**
1. Increased connection timeout from 2s to 10s in `connection.js`
2. Updated DATABASE_URL to new proxy: `postgres://postgres:RjT6.VJKRTGHJmQX1M-hIl6RWR_xuP3s@nozomi.proxy.rlwy.net:29845/railway`
3. Created TCP proxy for database access (port 29845)
4. Created resilient startup script (`start-with-retry.js`) with retry logic
5. Attempted to bypass migrations with nixpacks.toml configuration

### 5. Nixpacks Build System Override Issues
**Problem:** Nixpacks continued to run `npm run migrate && npm start` despite configuration attempts
**Attempted Solutions:**
1. Service configuration start command override
2. Created nixpacks.toml with custom start command
3. Modified package.json scripts

**Status:** Core Service deployment still failing due to migration script running before database connection is established

## Findings

### Critical Issues Resolved
1. ✅ PostgreSQL/pgvector service now running successfully
2. ✅ Database properly configured with correct PGDATA path
3. ✅ TCP proxy established for external database access
4. ✅ Connection timeout increased for better reliability
5. ✅ API Gateway remains stable and operational

### Remaining Issues
1. ❌ Core Service still crashes during startup due to migration script
2. ❌ Nixpacks build system not respecting custom start command overrides
3. ❌ Database migrations need to be run separately or made more resilient

## Root Cause Analysis

The deployment failure cascade was initiated by:
1. **Improper PostgreSQL Template Selection**: The initial pgvector service was created with an invalid Docker image tag
2. **Missing Environment Configuration**: The PGDATA variable wasn't set during template deployment
3. **Tight Coupling of Migrations**: The Core Service requires successful database migration before starting, creating a hard dependency
4. **Build System Limitations**: Nixpacks automatically detects and enforces migration patterns that may not be appropriate for all deployment scenarios

## Resolution Steps Taken

1. **Replaced PostgreSQL Service**
   - Deleted failed pgvector service (ID: 71c6e1bd-0abc-405e-bf59-a7139c00bd0c)
   - Deployed new pgvector from Railway template
   - Fixed PGDATA environment variable

2. **Updated Database Configuration**
   - Created TCP proxy on port 29845
   - Updated DATABASE_URL in Core Service
   - Added DATABASE_URL_INTERNAL for better performance

3. **Code Modifications**
   - Increased database connection timeout to 10 seconds
   - Created resilient startup script with retry logic
   - Added nixpacks.toml configuration file

4. **Committed Changes**
   - Commit f520bfa: "Fix database connection timeout and add resilient startup script"
   - Commit 68467b2: "Add nixpacks.toml to bypass migration on startup"

## Prevention Recommendations

### Immediate Actions
1. **Decouple Migrations from Startup**
   - Run migrations as a separate deployment step or job
   - Use health checks to verify database availability before migrations
   - Implement migration rollback capabilities

2. **Improve Database Connection Resilience**
   - Implement exponential backoff for connection retries
   - Add connection pooling with automatic reconnection
   - Use environment-specific connection strings

3. **Build Configuration**
   - Consider using a Dockerfile instead of Nixpacks for more control
   - Implement proper health check endpoints
   - Use Railway's deployment hooks for pre/post deployment tasks

### Long-term Improvements
1. **Service Orchestration**
   - Implement proper service dependencies in Railway
   - Use init containers or sidecar patterns for migrations
   - Consider using a migration service separate from the application

2. **Monitoring and Alerting**
   - Set up health check endpoints for all services
   - Implement logging aggregation
   - Add deployment failure notifications

3. **Infrastructure as Code**
   - Document all environment variables required
   - Create deployment scripts for reproducible deployments
   - Maintain separate configurations for development/staging/production

## Current Service Status

| Service | Status | Deployment ID | Issues |
|---------|--------|--------------|--------|
| API Gateway | ✅ Running | af1354c7-ddf4-43bc-84c6-bc3ba180ae90 | None |
| PostgreSQL/pgvector | ✅ Running | cc64643b-a12c-42cf-9c18-d06620872140 | None |
| Core Service | ❌ Crashed | 52d7cca4-ea8e-4cc1-8582-ada8cb1a193b | Migration failures |

## Next Steps

1. **Option A: Separate Migration Execution**
   - Create a one-time job to run migrations
   - Update Core Service to skip migrations on startup
   - Deploy Core Service without migration dependency

2. **Option B: Use Dockerfile**
   - Create custom Dockerfile with proper startup sequence
   - Override Nixpacks completely
   - Implement health checks and readiness probes

3. **Option C: Railway Jobs**
   - Use Railway's job functionality for migrations
   - Ensure database is ready before job execution
   - Deploy Core Service after successful migration job

## Conclusion

The HandyCan backend deployment issues stemmed from a combination of incorrect initial configuration (pgvector image tag), missing environment variables (PGDATA), and tight coupling between the application startup and database migrations. While the database service has been successfully restored, the Core Service requires additional work to properly handle the startup sequence and database initialization.

The recommended approach is to decouple database migrations from the application startup process, either through separate deployment jobs or by implementing a more robust initialization sequence that can handle database unavailability gracefully.