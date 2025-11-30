FROM node:22-slim
LABEL "language"="nodejs"
LABEL "framework"="astro"
WORKDIR /src
COPY services/frontend/package*.json .
RUN npm install
COPY services/frontend .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]