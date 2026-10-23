# Stage 1: Install dependencies
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# Copy prisma schema so that postinstall script 'prisma generate' can run successfully
COPY prisma ./prisma
RUN npm ci

# Stage 2: Prisma & Build Base
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Next.js and environment verification
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_DESCRIPTION
ARG BETTER_AUTH_URL
ARG BETTER_AUTH_SECRET
ARG DATABASE_URL

# Environment variables for build process
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_APP_DESCRIPTION=${NEXT_PUBLIC_APP_DESCRIPTION}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV DATABASE_URL=${DATABASE_URL}

RUN npx prisma generate
RUN npm run build

# Stage 3: Production Dependencies
FROM node:24-alpine AS prod-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# Stage 4: Runner
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files for runtime prisma generation
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib/generated ./lib/generated
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/scripts ./scripts
COPY --from=prod-deps /app/node_modules ./node_modules

# Set up the startup script with carriage return cleanup (handles Windows CRLF issue)
COPY --from=builder /app/resources/scripts/docker-bootstrap.sh /usr/local/bin/bootstrap.sh
RUN sed -i 's/\r$//' /usr/local/bin/bootstrap.sh && chmod +x /usr/local/bin/bootstrap.sh

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Logic: Generate prisma command then start next js application server
ENTRYPOINT ["bootstrap.sh"]
CMD ["node", "server.js"]
