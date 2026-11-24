#!/bin/bash

# Exit if any command fails
set -e

# Check if arguments are provided
if [ "$#" -lt 1 ]; then
  echo "Usage: ./docker-release.sh <version> [env_file]"
  echo "Example: ./docker-release.sh 0.0.2"
  echo "Example with env file: ./docker-release.sh 0.0.2 .env.production"
  exit 1
fi

VERSION=$1

# Update docker username and Project Image
ENV_FILE=${2:-.env.production}
IMAGE="chavda2772/settlr" 

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: Env file '$ENV_FILE' not found!"
  exit 1
fi

echo "🚀 Loading environment variables from $ENV_FILE..."
set -a
source <(tr -d '\r' < "$ENV_FILE")
set +a

echo "🚀 Building Docker image with tag $VERSION (runtime-configured, zero embedded secrets)..."

docker build -t $IMAGE:$VERSION .

echo "🔖 Tagging image as latest..."
docker tag $IMAGE:$VERSION $IMAGE:latest

echo "📤 Pushing version tag..."
docker push $IMAGE:$VERSION

echo "📤 Pushing latest tag..."
docker push $IMAGE:latest

echo "✅ Docker image $IMAGE:$VERSION successfully pushed!"