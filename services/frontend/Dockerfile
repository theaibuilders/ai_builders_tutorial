FROM node:22-alpine AS builder
LABEL "language"="nodejs"
LABEL "framework"="astro"

WORKDIR /app
COPY . .

WORKDIR /app/services/frontend
RUN npm install
RUN npm run build

FROM zeabur/caddy-static:latest
COPY --from=builder /app/services/frontend/dist /usr/share/caddy
EXPOSE 8080
