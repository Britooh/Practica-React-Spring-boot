@echo off
echo Deteniendo servidores de Node.js...
taskkill /F /IM node.exe >nul 2>&1
echo Servidor apagado correctamente.
pause
