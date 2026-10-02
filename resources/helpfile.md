# ------------------------
# TEMPLATE SYNC WITH REPO
# ------------------------
# Add upstream repo
`git remote add upstream https://github.com/Murlidhar08/next-auth-template.git`

# Disable remote branch push
`git remote set-url --push upstream DISABLE`
`git remote -v`

# Add from upstream
`git fetch upstream`
# ----------- Only first time
`git merge upstream/main --allow-unrelated-histories`
# ----------- else use this
`git merge upstream/main`
`git push origin main`


# -------------------
# DOCKER HELP SCRIPTS
# -------------------

# Build with env file
`docker compose --env-file .env.production up --build -d`
`docker compose --file docker-compose-with-db.yml --env-file .env.production up --build -d`

# Docker Release
`sh ./resources/scripts/docker-release.sh <version> [env_file]`
`Example: sh ./resources/scripts/docker-release.sh 4.0.8`
`Example with custom env file: sh ./resources/scripts/docker-release.sh 4.0.8 .env.production`


# ------
# EXTRA 
# ------

# run script
`npx tsx -r dotenv/config resources/scripts/seed-test-data.ts`
