FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p uploads/attachments uploads/avatars

EXPOSE 5000

CMD ["npx", "tsx", "index.ts"]