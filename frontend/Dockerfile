# Use Node.js LTS alpine image
FROM node:18-alpine as base
# Set working directory
WORKDIR /app

# Copy package filess
COPY package*.json ./
EXPOSE 3000

RUN apk add --no-cache python3 make g++

FROM base as builder
WORKDIR /app
RUN npm install
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# Production stage
FROM base as production
WORKDIR /app
ENV NODE_ENV=production
ENV NEXTAUTH_URL=http://localhost:8080
ENV NEXTAUTH_SECRET=53009a144f82a237797b32f2cb42778f
ENV AUTH_TRUST_HOST=true
RUN npm ci

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Copy build artifacts and necessary files

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
CMD ["npm", "start"]
# Expose port and start command

# FROM base as dev
# ENV NODE_ENV=development
# RUN npm install
# COPY . .
# CMD npm run dev