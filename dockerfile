# Step 1: Specify the base image
FROM --platform=linux/amd64 oven/bun:latest

RUN mkdir /app
WORKDIR /app

# Step 2: Copy application code into Docker image
COPY ./moewe_server ./
RUN rm ./.env
COPY ./studio/dist ./studio/dist

RUN bun install

EXPOSE 80
ENTRYPOINT ["bun", "."]