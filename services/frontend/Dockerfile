FROM node:22-slim
LABEL "language"="nodejs"
LABEL "framework"="astro"
LABEL "build-date"="2025-11-30"
WORKDIR /src
COPY services/frontend/package*.json ./
RUN npm install
COPY services/frontend/ ./
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]