FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/server.js .
COPY --from=frontend /app/dist ./public
ENV PORT=8765 HOST=0.0.0.0 NODE_ENV=production
USER node
EXPOSE 8765
CMD ["node", "server.js"]
