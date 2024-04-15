#!/bin/zsh
# make script executable: chmod +x deploy.sh
name="registry.gitlab.com/constorux/moewe"

cd ./studio
bun install
bun run build

# Build
cd ../moewe_server
bun install

cd ..

# Docker: create Image and push
docker build -t "$name" .
docker push "$name"