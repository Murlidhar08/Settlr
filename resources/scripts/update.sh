#!/usr/bin/env bash

set -Eeuo pipefail

# ==========================================
# Docker Image Updater - Property Hub
# ==========================================

# Add image names separated by spaces.
IMAGES=(
    "chavda2772/property-hub:latest"
    "chavda2772/prisma-studio:latest"
)

IMAGE_CHANGED=0
PULL_FAILED=0

# ==========================================
# Check Docker availability
# ==========================================

echo
echo "=========================================="
echo "       Docker Image Updater"
echo "=========================================="
echo

if ! docker info >/dev/null 2>&1; then
    echo "ERROR: Docker is not running or unavailable."
    exit 1
fi

if ! docker compose config --quiet; then
    echo "ERROR: Invalid Docker Compose configuration."
    exit 1
fi

# ==========================================
# Check and pull images
# ==========================================

for IMAGE in "${IMAGES[@]}"; do
    echo
    echo "------------------------------------------"
    echo "Checking image: ${IMAGE}"
    echo "------------------------------------------"

    OLD_ID=""

    if docker image inspect "$IMAGE" >/dev/null 2>&1; then
        OLD_ID=$(docker image inspect "$IMAGE" --format '{{.Id}}')
        echo "Local image ID: ${OLD_ID}"
    else
        echo "Image not found locally."
    fi

    echo
    echo "Pulling latest image from registry..."

    if ! docker pull "$IMAGE"; then
        echo "ERROR: Failed to pull ${IMAGE}"
        echo "Keeping the existing local image, if available."
        PULL_FAILED=1
        continue
    fi

    NEW_ID=$(docker image inspect "$IMAGE" --format '{{.Id}}')

    echo "Latest image ID: ${NEW_ID}"

    if [[ -z "$OLD_ID" ]]; then
        echo "Image downloaded successfully."
        IMAGE_CHANGED=1
    elif [[ "$OLD_ID" == "$NEW_ID" ]]; then
        echo "Image is already up to date."
    else
        echo "New image version detected!"
        IMAGE_CHANGED=1
    fi
done

# ==========================================
# Handle pull failures
# ==========================================

echo
echo "=========================================="
echo "Image check completed."
echo "=========================================="

if (( PULL_FAILED )); then
    echo
    echo "WARNING: One or more image pulls failed."
    echo "Skipping the update to avoid a partial deployment."
    echo

    echo "Ensuring existing Compose services are running..."
    docker compose up -d || {
        echo "ERROR: Failed to start Compose services."
        exit 1
    }

    echo "Review the pull errors and retry the update."
    exit 1
fi

# ==========================================
# Start services or update containers
# ==========================================

if (( IMAGE_CHANGED == 0 )); then
    echo
    echo "All images are already up to date."
    echo "No container recreation is needed."
    echo

    echo "Ensuring all Compose services are running..."
    docker compose up -d
else
    echo
    echo "=========================================="
    echo "New image(s) detected!"
    echo "=========================================="
    echo

    echo "Stopping existing Compose services..."
    docker compose down

    echo
    echo "Starting all Compose services with updated images..."
    docker compose up -d
fi

# ==========================================
# Cleanup
# ==========================================

echo
echo "Cleaning up dangling images..."
docker image prune -f

echo
echo "=========================================="
echo "Update process completed!"
echo "=========================================="
echo

echo "Current Compose status:"
docker compose ps
