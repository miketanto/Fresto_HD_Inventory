# Example Dockerfile for the backend
FROM node:18

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code (excluding node_modules)
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]