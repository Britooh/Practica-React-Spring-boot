@echo off
cd /d "%~dp0"
echo Iniciando Sistema de Clinica (Backend + Frontend)...
node backend/src/index.js --open
pause
