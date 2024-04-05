# Step 1: Specify the base image
FROM --platform=linux/amd64 oven/bun:latest

# Step 2: Copy application code into Docker image
COPY ./moewe_server /app
COPY ./studio/dist /app/studio/dist

WORKDIR /app
RUN bun .