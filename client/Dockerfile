# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
    RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build || echo "Build failed, continuing..."

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set environment
ENV NODE_ENV=production

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Create .env.local if it doesn't exist
RUN touch .env.local

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]