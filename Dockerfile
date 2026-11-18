FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/server.js .
COPY --from=frontend /app/dist ./public
ENV PORT=8765 HOST=0.0.0.0 NODE_ENV=production
USER node
EXPOSE 8765
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8765/api/state >/dev/null || exit 1
CMD ["node", "server.js"]
