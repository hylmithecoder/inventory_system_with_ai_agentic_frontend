FROM node:18-alpine

WORKDIR /app

# Copy package.json dulu biar install dependencies (Caching layer)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy sisa project
COPY . .

# Expose port Next.js
EXPOSE 3000

# Command default (Kita override di docker-compose jadi 'npm run dev')
CMD ["npm", "run", "dev"]
