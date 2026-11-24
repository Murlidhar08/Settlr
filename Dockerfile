
# ==========================================
# Stage 1: Production Dependencies
# ==========================================
FROM node:24-alpine AS pro-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force


# ==========================================
# Stage 2: Development Dependencies
# ==========================================
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci \
    && npm cache clean --force


# ==========================================
# Stage 3: Build Application
# ==========================================
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Only build-essential flags (no runtime secrets, URLs, or branding variables)
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    IS_DOCKER_BUILD=true

# Generate Prisma client
RUN npm run db:generate

# Build Next.js application
RUN npm run build \
    && rm -f /app/.next/standalone/.env*

# Preserve runtime NODE_ENV
RUN sed -i "s/process.env.NODE_ENV = 'production'/process.env.NODE_ENV = process.env.NODE_ENV || 'production'/" \
    /app/.next/standalone/server.js


# ==========================================
# Stage 4: Production Runner
# ==========================================
FROM node:24-alpine AS runner
RUN apk add --no-cache libc6-compat su-exec
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    IS_DOCKER_BUILD=true

# Bootstrap script
COPY --from=builder /app/resources/scripts/docker-bootstrap.sh /usr/local/bin/bootstrap.sh

RUN sed -i 's/\r$//' /usr/local/bin/bootstrap.sh \
    && chmod 755 /usr/local/bin/bootstrap.sh

# Next.js standalone output
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Generated Prisma files
COPY --from=builder --chown=node:node /app/lib/generated ./lib/generated

# Production dependencies
COPY --from=pro-deps --chown=node:node /app/node_modules ./node_modules

# ==========================================
# Upload Directory Permissions
# ==========================================

RUN mkdir -p /app/uploads \
    && chown -R node:node /app/uploads \
    && chmod -R 775 /app/uploads

# Persistent uploads directory
VOLUME ["/app/uploads"]

EXPOSE 3000

# Run as non-root user
USER node

ENTRYPOINT ["bootstrap.sh"]
CMD ["node", "server.js"]
