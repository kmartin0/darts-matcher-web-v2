# syntax=docker/dockerfile:1

# ==============================================
# === Stage 1: Build the Angular application ===
# ==============================================
# Use the current Node.js version for building.
FROM node:22-alpine AS build-stage

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json.
COPY package.json .
COPY package-lock.json .

# Install project dependencies.
RUN npm install

# Copy the rest of the project files.
COPY . .

# Generate the build of the application. Two profiles possible:
# - prod-pi
# - dev (default)
ARG PROFILE
ENV PROFILE ${PROFILE:-dev} # Default to 'dev' if PROFILE is not provided
RUN npm run build-${PROFILE}

# =========================================================
# === Stage 2: Serve the Angular application with NGINX ===
# =========================================================
# Use the current nginx version for building.
FROM nginx:1.29.0-alpine AS serve-stage

# Copy the custom NGINX configuration file into the container.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove the default NGINX content to avoid conflicts.
RUN rm -rf /usr/share/nginx/html/*

# Copy the built Angular application from the 'build-stage' into NGINX's web root. Dist path is defined in angular.json "outputPath"
COPY --from=build-stage /app/dist/darts-matcher-web-v2 /usr/share/nginx/html

# Expose port 80, which NGINX will be listening on inside the container.
EXPOSE 80

# Command to start NGINX when the container launches.
CMD ["nginx", "-g", "daemon off;"]
