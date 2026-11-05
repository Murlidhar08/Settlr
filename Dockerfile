# Stage 1: Install dependencies
FROM node:24-alpine AS pro-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Install dependencies
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Stage 3: Prisma & Next.js Build
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments with production defaults to prevent build-time missing env validation errors
ARG NEXT_PUBLIC_APP_NAME=Settlr
ARG NEXT_PUBLIC_APP_DESCRIPTION="Settlr for managing personal finance"
ARG BETTER_AUTH_URL=http://localhost:3000
ARG BETTER_AUTH_SECRET=build_dummy_secret_for_docker_build_only_32_chars
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/settlr"

# Environment variables for build process
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_APP_DESCRIPTION=${NEXT_PUBLIC_APP_DESCRIPTION}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run db:generate
RUN npm run build

# Stage 4: Minimal Production Runner
FROM node:24-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set up the startup script with carriage return cleanup (handles Windows CRLF issue)
COPY --from=builder /app/resources/scripts/docker-bootstrap.sh /usr/local/bin/bootstrap.sh
RUN sed -i 's/\r$//' /usr/local/bin/bootstrap.sh && chmod +x /usr/local/bin/bootstrap.sh

# Leverage Next.js standalone output tracing for ultra-small image size
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/lib/generated ./lib/generated
COPY --from=pro-deps --chown=node:node /app/node_modules ./node_modules

# Ensure uploads directory exists with non-root node ownership without duplicating layer data
RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node

EXPOSE 3000

ENTRYPOINT ["bootstrap.sh"]
CMD ["node", "server.js"]
