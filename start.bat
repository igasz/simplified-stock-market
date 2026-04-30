@echo off
SET APP_PORT=%1
IF "%APP_PORT%"=="" SET APP_PORT=8080
docker-compose up --build -d
echo Stock Market is running on http://localhost:%APP_PORT%