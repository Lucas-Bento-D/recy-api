# Use an official Node.js runtime as a parent image
FROM node:20-alpine3.19 AS builder

# Set the working directory
WORKDIR /app

# Install curl, Python, pkg-config, and build dependencies
RUN apk add --no-cache \
	pkgconfig \
	gcc \
	pixman-dev \
	cairo-dev \
	pango-dev \
	make \
	build-base

# Copy package.json and package-lock.json before other files
# Leverage Docker cache to save time on dependency installation
COPY package*.json ./

# Install dependencies 
RUN npm cache clean --force
RUN npm ci

# Copy the rest of your application code to the container
COPY . .

# Generate Prisma Client code
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Expose the port that your NestJS app runs on
EXPOSE 80

# Command to run the app
CMD [ "npm", "run", "start:migrate:prod" ]
