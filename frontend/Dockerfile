# Frontend Dockerfile - Next.js
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command (production would use `npm run build && npm run start`)
CMD ["npm", "run", "dev"]
