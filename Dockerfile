# syntax=docker/dockerfile:1

# Stage 1: Compile and build Angular application
FROM node:22-slim AS build

# Set the working directory
WORKDIR /app

# Copy package files to the image
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm clean-install

# Copy the source code to the image
COPY . .

# Get the environment profile
ARG PROFILE=dev

# Get the environment properties
ARG DARTS_MATCHER_API_URL=http://localhost:8080
ARG DARTS_MATCHER_WEB_SOCKET_URL=ws://localhost:8080/darts-matcher-websocket

# Generate the build of the application. Accepts: prod, dev
RUN if [ "$PROFILE" = "prod" ] || [ "$PROFILE" = "dev" ]; then \
      npm run build-${PROFILE} -- \
        --define "DARTS_MATCHER_API_URL='${DARTS_MATCHER_API_URL}'" \
        --define "DARTS_MATCHER_WEB_SOCKET_URL='${DARTS_MATCHER_WEB_SOCKET_URL}'"; \
    else \
      echo "Invalid PROFILE: $PROFILE. Expected 'dev' or 'prod'." && exit 1; \
    fi

# Stage 2: Serve application with Nginx
FROM nginx:stable-alpine

# Remove the default configuration and add our own
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove the default Nginx content and add the Angular application contents
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/darts-matcher-web/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
