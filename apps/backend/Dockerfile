# Base
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/build ./
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

EXPOSE 3333
CMD ["node", "bin/server.js"]
