@echo off
echo 🚀 Preparando despliegue a producción - Gestión Equina
echo.

REM Restaurar service worker para producción
if exist ngsw-config.json.backup (
    echo ✅ Restaurando service worker para producción...
    move ngsw-config.json.backup ngsw-config.json
) else (
    echo ⚠️  Advertencia: ngsw-config.json.backup no encontrado
)

echo.
echo 🔨 Construyendo aplicación para producción...
npm run build:prod

if %errorlevel% neq 0 (
    echo ❌ Error en el build. Abortando despliegue.
    pause
    exit /b 1
)

echo.
echo 📦 Build completado exitosamente
echo.
echo 📋 Checklist de producción:
echo ✅ Service worker habilitado
echo ✅ Build de producción generado
echo ✅ Archivos listos en carpeta 'www/'
echo.
echo 📤 Próximos pasos:
echo 1. Desplegar el contenido de 'www/' a tu servidor
echo 2. Configurar HTTPS (requerido para PWA)
echo 3. Probar la instalación desde navegador móvil
echo.
echo 🎯 La app tendrá funcionalidades PWA completas:
echo    - Cache offline
echo    - Actualizaciones automáticas
echo    - Instalación como app nativa
echo.
pause