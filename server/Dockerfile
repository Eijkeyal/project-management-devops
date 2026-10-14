FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production UPLOAD_DIR=/app/uploads
EXPOSE 5000
CMD ["npx", "tsx", "index.ts"]