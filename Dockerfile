FROM node:20-alpine AS builder
WORKDIR /app

# Install deps (including dev deps for build)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy built app
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json* ./
RUN npm ci --production

EXPOSE 8080
CMD ["node", "dist/server.cjs"]
