@echo off
echo 🧹 Limpiando cache del navegador...
echo.

REM Detener procesos de navegadores comunes
taskkill /f /im chrome.exe 2>nul
taskkill /f /im msedge.exe 2>nul
taskkill /f /im firefox.exe 2>nul

echo ✅ Navegadores cerrados
echo.
echo 📋 Instrucciones para limpiar cache manualmente:
echo.
echo 1. Abre Chrome/Edge
echo 2. Presiona F12 para abrir DevTools
echo 3. Ve a Application ^> Storage
echo 4. Marca todas las opciones y haz clic en "Clear storage"
echo.
echo 5. O presiona Ctrl+Shift+Delete y limpia:
echo    - Cookies y datos de sitios
echo    - Imágenes y archivos en caché
echo.
echo 6. Reinicia el navegador y ve a http://localhost:8100
echo.
pause