# Production-Ready Saleor Deployment on VPS with Docker Compose

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Preparation](#system-preparation)
3. [Project Structure](#project-structure)
4. [Environment Configuration](#environment-configuration)
5. [Docker Compose Setup](#docker-compose-setup)
6. [SSL and Reverse Proxy](#ssl-and-reverse-proxy)
7. [Database Initialization](#database-initialization)
8. [Deployment](#deployment)
9. [Webhook Integration with Next.js](#webhook-integration-with-nextjs)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)
11. [Security Hardening](#security-hardening)
12. [Backup and Recovery](#backup-and-recovery)
13. [Troubleshooting](#troubleshooting)

## Prerequisites

### VPS Requirements

- **Minimum Specs**: 4GB RAM, 2 vCPUs, 50GB SSD
- **Recommended**: 8GB RAM, 4 vCPUs, 100GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Network**: Public IPv4 with configured DNS A record

### Domain Setup

- We've pointed Alcora domain to VPS IP address
- Configure subdomains:
  - `commerce.getverity.com` → Saleor API
  - `IP_ADDRESS_WITH_PORT` → Saleor Dashboard
  - `shop.getverity.com"` → Storefront

## System Preparation

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget git ufw fail2ban -y
```

### 2. Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply group changes
exit
```

### 3. Configure Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Project Structure

Create the project directory structure:

```bash
mkdir -p ~/saleor-production/{data/{postgres,redis,media,static},config,backups,logs}
cd ~/saleor-production
```

Data structure looks like:

```
saleor-production/
├── docker-compose.yml
├── .env
├── data/
│   ├── postgres/
│   ├── redis/
│   ├── media/
│   └── static/
├── config/
├── backups/
└── logs/
```

## Environment Configuration

Create `.env` file:

```bash
cat > .env << 'EOF'
# =================================
# SALEOR PRODUCTION CONFIGURATION
# =================================

# Core Settings
DEBUG=False
SECRET_KEY=your_ultra_secure_32_character_secret_key_here_change_this
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com,dashboard.yourdomain.com
ALLOWED_CLIENT_HOSTS=https://yourdomain.com,https://dashboard.yourdomain.com

# Database Configuration
POSTGRES_USER=saleor
POSTGRES_PASSWORD=your_very_secure_postgres_password_change_this
POSTGRES_DB=saleor
DATABASE_URL=postgres://saleor:your_very_secure_postgres_password_change_this@db:5432/saleor

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password_change_this
REDIS_URL=redis://:your_secure_redis_password_change_this@redis:6379/0
CELERY_BROKER_URL=redis://:your_secure_redis_password_change_this@redis:6379/1

# Email Configuration (Replace with your SMTP provider)
EMAIL_URL=smtp://username:password@smtp.provider.com:587/?tls=True
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# JWT Settings
JWT_EXPIRE=true
JWT_TTL_ACCESS=300
JWT_TTL_REFRESH=2592000

# File Storage
DEFAULT_FILE_STORAGE=saleor.core.storage.FileSystemMediaStorage
STATIC_URL=/static/
MEDIA_URL=/media/

# Webhook Secret for Next.js Integration
WEBHOOK_SECRET_KEY=your_webhook_secret_key_32_characters_long

# Domain Configuration
SALEOR_API_URL=https://api.yourdomain.com/graphql/
DASHBOARD_URL=https://dashboard.yourdomain.com/

# Let's Encrypt Email
ACME_EMAIL=admin@yourdomain.com

# Timezone
TZ=UTC
EOF
```

**Important**: Replace all placeholder values with actual secure passwords and your domain information.

## Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  # Saleor API Service
  api:
    image: saleor/saleor:3.20
    restart: unless-stopped
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=${DEBUG}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - ALLOWED_CLIENT_HOSTS=${ALLOWED_CLIENT_HOSTS}
      - EMAIL_URL=${EMAIL_URL}
      - DEFAULT_FROM_EMAIL=${DEFAULT_FROM_EMAIL}
      - JWT_EXPIRE=${JWT_EXPIRE}
      - JWT_TTL_ACCESS=${JWT_TTL_ACCESS}
      - JWT_TTL_REFRESH=${JWT_TTL_REFRESH}
      - STATIC_URL=${STATIC_URL}
      - MEDIA_URL=${MEDIA_URL}
    volumes:
      - ./data/media:/app/media
      - ./data/static:/app/static
    networks:
      - saleor-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.api.tls=true"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=8000"
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # Celery Worker
  worker:
    image: saleor/saleor:3.20
    restart: unless-stopped
    command: celery -A saleor --app=saleor.celeryconf:app worker --loglevel=info --concurrency=4
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CELERY_BROKER_URL=${CELERY_BROKER_URL}
      - SECRET_KEY=${SECRET_KEY}
      - EMAIL_URL=${EMAIL_URL}
      - DEFAULT_FROM_EMAIL=${DEFAULT_FROM_EMAIL}
    volumes:
      - ./data/media:/app/media
      - ./logs:/app/logs
    networks:
      - saleor-network
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Celery Beat (Scheduler)
  beat:
    image: saleor/saleor:3.20
    restart: unless-stopped
    command: celery -A saleor --app=saleor.celeryconf:app beat --loglevel=info
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - CELERY_BROKER_URL=${CELERY_BROKER_URL}
      - SECRET_KEY=${SECRET_KEY}
    networks:
      - saleor-network
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - ./data/postgres:/var/lib/postgresql/data/pgdata
    networks:
      - saleor-network
    ports:
      - "127.0.0.1:5432:5432" # Only accessible from localhost
    command: >
      postgres
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c work_mem=4MB
      -c min_wal_size=1GB
      -c max_wal_size=4GB
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # Redis Cache and Message Broker
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --appendonly yes
      --appendfsync everysec
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000
    volumes:
      - ./data/redis:/data
    networks:
      - saleor-network
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Saleor Dashboard
  dashboard:
    image: saleor/saleor-dashboard:3.20
    restart: unless-stopped
    environment:
      - API_URL=https://api.yourdomain.com/graphql/
      - APP_MOUNT_URI=/dashboard/
    networks:
      - saleor-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`dashboard.yourdomain.com`)"
      - "traefik.http.routers.dashboard.tls=true"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
      - "traefik.http.services.dashboard.loadbalancer.server.port=80"

  # Traefik Reverse Proxy
  traefik:
    image: traefik:v3.0
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--global.checknewversion=false"
      - "--global.sendanonymoususage=false"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./data/letsencrypt:/letsencrypt
    networks:
      - saleor-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.yourdomain.com`)"
      - "traefik.http.routers.traefik.tls=true"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"

networks:
  saleor-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  media_data:
  static_data:
  letsencrypt_data:
```

## SSL and Reverse Proxy

The Traefik configuration above automatically handles:

- SSL certificate generation via Let's Encrypt
- HTTP to HTTPS redirects
- Load balancing
- Service discovery

Ensure your DNS records are properly configured before deployment.

## Database Initialization

### 1. Start Database Services First

```bash
docker-compose up -d db redis
```

### 2. Wait for Database to Initialize

```bash
docker-compose logs -f db
# Wait until you see "database system is ready to accept connections"
```

### 3. Run Database Migrations

```bash
docker-compose run --rm api python manage.py migrate
```

### 4. Create Superuser

```bash
docker-compose run --rm api python manage.py createsuperuser
```

### 5. Populate Sample Data (Optional)

```bash
docker-compose run --rm api python manage.py populatedb --createsuperuser
```

### 6. Collect Static Files

```bash
docker-compose run --rm api python manage.py collectstatic --noinput
```

## Deployment

### 1. Start All Services

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 2. Scale Services for Production

```bash
# Scale API and worker services
docker-compose up -d --scale api=3 --scale worker=2
```

### 3. Verify Deployment

```bash
# Check API health
curl -k https://api.yourdomain.com/graphql/

# Check Dashboard
curl -k https://dashboard.yourdomain.com/

# Monitor logs
docker-compose logs -f --tail=50
```

## Webhook Integration with Next.js

### 1. Configure Webhooks in Saleor Dashboard

1. Access dashboard at `https://dashboard.yourdomain.com`
2. Navigate to **Settings** → **Webhooks**
3. Create new webhook:
   - **Target URL**: `https://your-nextjs-app.com/api/webhooks/saleor`
   - **Secret Key**: Use the `WEBHOOK_SECRET_KEY` from your `.env`
   - **Events**: Select required events (ORDER_CREATED, PRODUCT_UPDATED, etc.)

### 2. Next.js API Route Implementation

Create `pages/api/webhooks/saleor.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

interface SaleorWebhookEvent {
  event: string;
  data: any;
  meta: {
    issued_at: string;
    version: string;
  };
}

const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const computedSignature = hmac.digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(computedSignature, "hex")
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["saleor-signature"] as string;
  const payload = JSON.stringify(req.body);

  if (!signature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const isValid = verifyWebhookSignature(
    payload,
    signature,
    process.env.SALEOR_WEBHOOK_SECRET!
  );

  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event: SaleorWebhookEvent = req.body;

  try {
    switch (event.event) {
      case "ORDER_CREATED":
        await handleOrderCreated(event.data);
        break;
      case "ORDER_UPDATED":
        await handleOrderUpdated(event.data);
        break;
      case "PRODUCT_CREATED":
        await handleProductCreated(event.data);
        break;
      case "PRODUCT_UPDATED":
        await handleProductUpdated(event.data);
        break;
      case "CUSTOMER_CREATED":
        await handleCustomerCreated(event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    res.status(200).json({ received: true, event: event.event });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Event Handlers
async function handleOrderCreated(order: any) {
  console.log("New order created:", order.number);

  // Example: Send confirmation email
  // await sendOrderConfirmationEmail(order);

  // Example: Update inventory in external system
  // await updateInventorySystem(order);

  // Example: Create shipping label
  // await createShippingLabel(order);
}

async function handleOrderUpdated(order: any) {
  console.log("Order updated:", order.number);

  // Handle order status changes
  if (order.status === "FULFILLED") {
    // await sendFulfillmentNotification(order);
  }
}

async function handleProductCreated(product: any) {
  console.log("New product created:", product.name);

  // Example: Sync with external catalog
  // await syncProductToCatalog(product);
}

async function handleProductUpdated(product: any) {
  console.log("Product updated:", product.name);

  // Example: Update search index
  // await updateSearchIndex(product);
}

async function handleCustomerCreated(customer: any) {
  console.log("New customer registered:", customer.email);

  // Example: Send welcome email
  // await sendWelcomeEmail(customer);

  // Example: Add to mailing list
  // await addToMailingList(customer);
}
```

### 3. Environment Variables for Next.js

Add to your Next.js `.env.local`:

```bash
SALEOR_WEBHOOK_SECRET=your_webhook_secret_key_32_characters_long
SALEOR_API_URL=https://api.yourdomain.com/graphql/
```

## Monitoring and Maintenance

### 1. Health Check Script

Create `health-check.sh`:

```bash
#!/bin/bash

echo "=== Saleor Health Check ==="
echo "Timestamp: $(date)"

# Check container status
echo -e "\n--- Container Status ---"
docker-compose ps

# Check API health
echo -e "\n--- API Health ---"
curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/graphql/ || echo "API check failed"

# Check database connections
echo -e "\n--- Database Connections ---"
docker-compose exec -T db psql -U saleor -d saleor -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null || echo "DB check failed"

# Check Redis
echo -e "\n--- Redis Status ---"
docker-compose exec -T redis redis-cli -a $REDIS_PASSWORD ping 2>/dev/null || echo "Redis check failed"

# Check disk usage
echo -e "\n--- Disk Usage ---"
df -h

# Check memory usage
echo -e "\n--- Memory Usage ---"
free -h

echo -e "\n=== Health Check Complete ===\n"
```

Make it executable and run:

```bash
chmod +x health-check.sh
./health-check.sh
```

### 2. Log Monitoring

Monitor application logs:

```bash
# Follow all logs
docker-compose logs -f

# Follow specific service logs
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f db

# View recent errors
docker-compose logs --tail=100 | grep -i error
```

### 3. Performance Monitoring

Monitor resource usage:

```bash
# Container resource usage
docker stats

# Detailed container info
docker-compose exec api python manage.py check --deploy
```

## Security Hardening

### 1. Container Security

Update your `docker-compose.yml` with security enhancements:

```yaml
# Add to each service
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
  - /var/tmp
cap_drop:
  - ALL
cap_add:
  - CHOWN
  - SETGID
  - SETUID
```

### 2. Network Security

Create isolated networks:

```yaml
networks:
  frontend:
    internal: false
  backend:
    internal: true
```

### 3. Environment Security

Secure your `.env` file:

```bash
chmod 600 .env
chown root:root .env
```

### 4. System Security

Configure fail2ban for SSH protection:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Backup and Recovery

### 1. Database Backup Script

Create `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/saleor_db_$DATE.sql"
MEDIA_BACKUP="$BACKUP_DIR/saleor_media_$DATE.tar.gz"

echo "Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Backing up database..."
docker-compose exec -T db pg_dump -U saleor -d saleor | gzip > "$DB_BACKUP.gz"

# Media files backup
echo "Backing up media files..."
tar -czf $MEDIA_BACKUP ./data/media/

# Redis backup
echo "Backing up Redis..."
docker-compose exec -T redis redis-cli -a $REDIS_PASSWORD --rdb /data/dump.rdb BGSAVE

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "saleor_*" -mtime +7 -delete

echo "Backup completed: $DB_BACKUP.gz, $MEDIA_BACKUP"
```

### 2. Automated Backups

Set up daily backups with cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/saleor-production && ./backup.sh >> ./logs/backup.log 2>&1
```

### 3. Restore Process

Create `restore.sh`:

```bash
#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1

echo "Stopping services..."
docker-compose stop api worker beat

echo "Restoring database from $BACKUP_FILE..."
gunzip -c $BACKUP_FILE | docker-compose exec -T db psql -U saleor -d saleor

echo "Starting services..."
docker-compose start api worker beat

echo "Restore completed!"
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

```bash
# Check database logs
docker-compose logs db

# Test connection
docker-compose exec api python manage.py dbshell

# Reset database connections
docker-compose restart db
```

#### 2. Memory Issues

```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
```

#### 3. SSL Certificate Issues

```bash
# Check Traefik logs
docker-compose logs traefik

# Force certificate renewal
docker-compose exec traefik traefik acme renew
```

#### 4. Performance Issues

```bash
# Check API response times
curl -w "@curl-format.txt" -s -o /dev/null https://api.yourdomain.com/graphql/

# Monitor database queries
docker-compose exec db psql -U saleor -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

#### 5. Storage Issues

```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -af

# Clean old logs
docker-compose logs --tail=1000 > recent.log
```

### Emergency Recovery

If something goes wrong:

1. **Save current state**:

   ```bash
   docker-compose logs > emergency_logs.txt
   ./backup.sh
   ```

2. **Stop services**:

   ```bash
   docker-compose down
   ```

3. **Restore from backup**:

   ```bash
   ./restore.sh backups/saleor_db_YYYYMMDD_HHMMSS.sql.gz
   ```

4. **Restart services**:
   ```bash
   docker-compose up -d
   ```

## Production Optimization Tips

### 1. Performance Tuning

- Monitor and adjust PostgreSQL configuration based on your VPS specs
- Use Redis for caching frequently accessed data
- Implement CDN for static assets
- Scale API and worker services based on load

### 2. Resource Management

- Set appropriate memory and CPU limits
- Monitor resource usage regularly
- Plan for traffic spikes

### 3. Updates and Maintenance

- Test updates in staging environment first
- Schedule maintenance windows for updates
- Keep regular backups before any changes

## Conclusion

This guide provides a robust, production-ready Saleor deployment that includes:

- ✅ SSL encryption with automatic certificate management
- ✅ Scalable container architecture
- ✅ Secure database configuration
- ✅ Automated backups
- ✅ Webhook integration with Next.js
- ✅ Monitoring and logging
- ✅ Security hardening
- ✅ Disaster recovery procedures

Your Saleor instance should now be running securely and efficiently on your VPS, ready to handle production traffic with proper monitoring and maintenance procedures in place.
