# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build


# Stage 2: Production environment
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY package.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD ["node", "-e","fetch('http://127.0.0.1:3000/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"]
CMD ["npm", "start"]