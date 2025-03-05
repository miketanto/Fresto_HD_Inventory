# Use Node.js LTS alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire backend code
COPY . .

# Expose port
EXPOSE 4000

# Start command
CMD ["npm", "start"]