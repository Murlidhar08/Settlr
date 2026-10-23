```bat
@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ==========================================
REM Docker Image Updater - Property Hub
REM ==========================================

REM Add all Docker images to check here.
REM Separate image names with spaces.
set "IMAGES=chavda2772/property-hub:latest chavda2772/prisma-studio:latest"

REM ==========================================
REM Start
REM ==========================================

echo.
echo ==========================================
echo       Docker Image Updater
echo ==========================================
echo.

REM Check Docker availability
docker info >nul 2>&1

if errorlevel 1 (
    echo ERROR: Docker Desktop is not running.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check Compose configuration
docker compose config --quiet

if errorlevel 1 (
    echo ERROR: Invalid Docker Compose configuration.
    pause
    exit /b 1
)

set "IMAGE_CHANGED=0"
set "PULL_FAILED=0"

REM ==========================================
REM Check and Pull Images
REM ==========================================

for %%I in (%IMAGES%) do (
    echo.
    echo ------------------------------------------
    echo Checking image: %%I
    echo ------------------------------------------

    set "OLD_ID="

    for /f "tokens=*" %%A in ('docker image inspect "%%I" --format "{{.Id}}" 2^>nul') do (
        set "OLD_ID=%%A"
    )

    if not defined OLD_ID (
        echo Image not found locally.
        echo Pulling image: %%I

        docker pull "%%I"

        if errorlevel 1 (
            echo ERROR: Failed to pull %%I
            set "PULL_FAILED=1"
        ) else (
            echo Image downloaded successfully.
            set "IMAGE_CHANGED=1"
        )
    ) else (
        echo Local image ID:
        echo !OLD_ID!

        echo.
        echo Checking Docker Hub for the latest image...

        docker pull "%%I"

        if errorlevel 1 (
            echo ERROR: Failed to pull %%I
            echo Keeping the existing local image.
            set "PULL_FAILED=1"
        ) else (
            set "NEW_ID="

            for /f "tokens=*" %%A in ('docker image inspect "%%I" --format "{{.Id}}" 2^>nul') do (
                set "NEW_ID=%%A"
            )

            echo Latest image ID:
            echo !NEW_ID!

            if "!OLD_ID!"=="!NEW_ID!" (
                echo Image is already up to date.
            ) else (
                echo New image version detected!
                set "IMAGE_CHANGED=1"
            )
        )
    )
)

REM ==========================================
REM Handle Pull Failures
REM ==========================================

echo.
echo ==========================================
echo Image check completed.
echo ==========================================

if "!PULL_FAILED!"=="1" (
    echo.
    echo WARNING: One or more image pulls failed.
    echo Not recreating containers because the update
    echo could be incomplete.
    echo.

    echo Starting existing containers...
    docker compose up -d

    if errorlevel 1 (
        echo ERROR: Failed to start all Compose services.
        pause
        exit /b 1
    )

    echo.
    echo Existing Compose services have been started.
    echo Review the pull errors before retrying.
    pause
    exit /b 1
)

REM ==========================================
REM Recreate Containers Only When Needed
REM ==========================================

if "!IMAGE_CHANGED!"=="0" (
    echo.
    echo All images are already up to date.
    echo No container recreation is needed.
    echo.

    echo Ensuring all Compose services are running...
    docker compose up -d

    if errorlevel 1 (
        echo ERROR: Failed to start all Compose services.
        pause
        exit /b 1
    )

    goto FINISH
)

echo.
echo ==========================================
echo New image(s) detected!
echo ==========================================
echo.

echo Stopping existing Compose containers...
docker compose down

if errorlevel 1 (
    echo ERROR: Failed to stop Compose containers.
    pause
    exit /b 1
)

echo.
echo Starting all Compose services with updated images...
docker compose up -d

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start all Compose services.
    echo Check logs using: docker compose logs
    pause
    exit /b 1
)

REM ==========================================
REM Cleanup
REM ==========================================

echo.
echo Cleaning up dangling images...
docker image prune -f

:FINISH

echo.
echo ==========================================
echo Update process completed!
echo ==========================================
echo.
echo Current Compose status:
docker compose ps

echo.
pause
endlocal
```
