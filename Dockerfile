FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000
USER node
CMD ["node", "server.js"]
