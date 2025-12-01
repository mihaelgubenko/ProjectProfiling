@echo off
chcp 65001 >nul
title Запуск сервера портфолио
color 0A

echo.
echo ═══════════════════════════════════════════════════════════
echo    ЗАПУСК СЕРВЕРА ПОРТФОЛИО
echo ═══════════════════════════════════════════════════════════
echo.

REM Проверка наличия node_modules
if not exist "node_modules" (
    echo [INFO] Установка зависимостей...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Ошибка при установке зависимостей!
        pause
        exit /b 1
    )
    echo [OK] Зависимости установлены
    echo.
)

REM Проверка наличия node
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js не найден! Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Запуск сервера...
echo [INFO] Сервер будет доступен на http://localhost:3000
echo [INFO] Для остановки нажмите Ctrl+C
echo.

REM Автоматическое открытие браузера через 3 секунды
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

REM Запуск сервера
node server.js

REM Если сервер закрылся, пауза для просмотра ошибок
if errorlevel 1 (
    echo.
    echo [ERROR] Сервер завершился с ошибкой!
    pause
)
