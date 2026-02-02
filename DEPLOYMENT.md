# FedEx Operations Proactivity Platform - Deployment Guide

## Environment Setup

### Development Environment

#### Prerequisites
- Node.js 14.0+ and npm 6.0+
- Git
- Code editor (VS Code recommended)

#### Installation Steps

```bash
# Clone the repository
git clone <repo-url>
cd fedex-ops-platform

# Backend setup
cd backend
npm install
cp .env.example .env
npm run dev

# In new terminal - Frontend setup
cd frontend
npm install
cp .env.example .env
npm start
```

#### Verify Installation
- Backend: http://localhost:5000/api/health (should return {"status":"UP"})
- Frontend: http://localhost:3000 (Dashboard loads)
- Test data: Search AWB "7488947329"

### Production Environment

#### Requirements
- Node.js 16+ (LTS)
- MongoDB 4.4+
- NGINX or HAProxy (reverse proxy)
- SSL certificate
- Docker (recommended)

#### Architecture
```
Client
  │ HTTPS
  ▼
Load Balancer (NGINX)
  │
  ├─ Node.js Instance 1 (Port 5001)
  ├─ Node.js Instance 2 (Port 5002)
  └─ Node.js Instance 3 (Port 5003)
  
  └─ MongoDB Replica Set
      ├─ Primary
      ├─ Secondary
      └─ Arbiter
```

#### Production Deployment Steps

##### 1. Database Setup
```bash
# MongoDB replica set (for HA)
mongod --replSet fedex-rs --dbpath /data/db --port 27017
```

##### 2. Backend Configuration
Create `backend/.env.production`:
```env
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb://mongo1:27017,mongo2:27017,mongo3:27017/fedex-ops?replicaSet=fedex-rs
JWT_SECRET=$(openssl rand -base64 32)
API_BASE_URL=https://api.fedex-ops.company.com
LOG_LEVEL=info
CACHE_TTL=300
RATE_LIMIT=1000
```

##### 3. NGINX Configuration
Create `/etc/nginx/sites-available/fedex-ops`:
```nginx
upstream fedex_backend {
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}

server {
    listen 443 ssl http2;
    server_name api.fedex-ops.company.com;

    ssl_certificate /etc/ssl/certs/fedex-ops.crt;
    ssl_certificate_key /etc/ssl/private/fedex-ops.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    gzip on;
    gzip_types application/json;

    location / {
        proxy_pass http://fedex_backend;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # API rate limiting zone
    limit_req_zone $binary_remote_addr zone=api:10m rate=1r/s;
}

# Frontend
server {
    listen 443 ssl;
    server_name ops.fedex-ops.company.com;

    ssl_certificate /etc/ssl/certs/fedex-ops.crt;
    ssl_certificate_key /etc/ssl/private/fedex-ops.key;

    root /var/www/fedex-ops-frontend/build;

    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass https://api.fedex-ops.company.com;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP redirect
server {
    listen 80;
    server_name *.fedex-ops.company.com;
    return 301 https://$server_name$request_uri;
}
```

##### 4. Process Management with PM2

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'fedex-ops-api',
      script: './server.js',
      instances: 3,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      max_memory_restart: '1G',
      error_file: '/var/log/fedex-ops/error.log',
      out_file: '/var/log/fedex-ops/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
```

```bash
pm2 install pm2-logrotate
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

##### 5. Frontend Build & Deployment
```bash
cd frontend
npm run build

# Copy to nginx
cp -r build/* /var/www/fedex-ops-frontend/

# Verify
curl https://ops.fedex-ops.company.com
```

### Docker Deployment

#### Dockerfile (Backend)
```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:16-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok'
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      MONGO_URI: mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/fedex-ops
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      mongodb:
        condition: service_healthy
    ports:
      - "5000:5000"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
```

## Monitoring & Alerts

### Application Monitoring

```javascript
// Install monitoring package
npm install @newrelic/nodejs-agent

// In server.js - add at the very top
require('newrelic');
```

### Log Aggregation

```javascript
// Install logging
npm install winston pino-elasticsearch

// In services
const logger = require('./logger');
logger.info('Event message', { awb: '123456' });
```

### Key Metrics to Monitor

1. **API Performance**
   - Response time (target: < 200ms)
   - Error rate (target: < 0.1%)
   - Throughput (requests/second)

2. **Database**
   - Connection count
   - Query latency
   - Replication lag

3. **Business Metrics**
   - Alerts generated per hour
   - Delay prediction accuracy
   - Consignments in transit
   - On-time delivery rate

### Alert Thresholds

```
- API Response Time > 500ms → WARN
- Error Rate > 1% → CRITICAL
- MongoDB CPU > 80% → WARN
- MongoDB Memory > 90% → CRITICAL
- Disk Usage > 85% → WARN
```

## Security Checklist

### Before Going to Production

- [ ] Environment variables configured securely (no hardcoded secrets)
- [ ] SSL/TLS certificates installed
- [ ] Database backups automated
- [ ] Database access restricted to application only
- [ ] API authentication (JWT) enabled
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Security headers set (Content-Security-Policy, X-Frame-Options, etc.)
- [ ] SQL injection/NoSQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Session management configured
- [ ] Sensitive data logging disabled
- [ ] Penetration testing completed
- [ ] Data encryption at rest enabled
- [ ] Key rotation policy established
- [ ] Incident response plan documented
- [ ] Compliance requirements (GDPR, HIPAA) addressed

### Production Security Headers (NGINX)
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# Daily backup script
BACKUP_DIR="/backups/fedex-ops"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# MongoDB backup
mongodump --uri="mongodb://admin:pass@localhost:27017/fedex-ops" \
  --out="$BACKUP_DIR/mongo_$TIMESTAMP"

# Compress
tar -czf "$BACKUP_DIR/fedex-ops_$TIMESTAMP.tar.gz" \
  "$BACKUP_DIR/mongo_$TIMESTAMP"

# Upload to S3
aws s3 cp "$BACKUP_DIR/fedex-ops_$TIMESTAMP.tar.gz" \
  s3://fedex-ops-backups/

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
```

### Disaster Recovery Plan

1. **Detection**: Monitoring alerts on service failure
2. **Assessment**: Check backup integrity and freshness
3. **Restoration**: Restore from most recent backup
4. **Validation**: Verify data consistency
5. **Notification**: Alert stakeholders

## Performance Tuning

### Node.js Optimization
```bash
# Increase file descriptors
ulimit -n 65535

# Node memory
node --max-old-space-size=4096 server.js
```

### MongoDB Optimization
```javascript
db.consignments.createIndex({ "awb": 1 }, { unique: true });
db.consignments.createIndex({ "status": 1 });
db.consignments.createIndex({ "estimatedDelivery": 1 });
db.scans.createIndex({ "consignment_id": 1, "timestamp": -1 });
```

## Scaling Strategy

### Horizontal Scaling
- Add more backend instances behind load balancer
- Use connection pooling for database
- Implement session affinity or distributed sessions

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching layer (Redis)

## Troubleshooting Production Issues

### High API Response Time
1. Check database query performance
2. Monitor network latency
3. Check for blocking operations
4. Review application logs
5. Check for memory leaks

### Database Replication Lag
1. Check network between replica set members
2. Verify oplog size is adequate
3. Check for large operations
4. Monitor CPU and disk I/O

### Out of Disk Space
1. Clean up old logs
2. Clean up temporary files
3. Check for rogue processes
4. Archive old data
5. Expand disk capacity

## Support & Escalation

**Critical Issues**: Page on-call engineer
**High Priority**: Email within 1 hour
**Medium Priority**: Email within 4 hours
**Low Priority**: Email within 24 hours

---

For more information, see README.md and ARCHITECTURE.md
