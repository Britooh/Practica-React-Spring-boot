@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ======================================================================
echo   CLINICA SAN RAFAEL - ENLACE PUBLICO PARA INTERNET
echo   (Manten esta ventana abierta mientras quieras que el link funcione)
echo ======================================================================
node backend/src/index.js --public
pause
