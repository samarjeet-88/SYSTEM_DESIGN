# Lightweight Node.js base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies (if any)
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose Redis custom port
EXPOSE 6381

# Command to run the server
CMD ["npm", "start"]
