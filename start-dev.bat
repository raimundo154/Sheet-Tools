@echo off
echo 🚀 Iniciando Sheet Tools em modo de desenvolvimento...
echo.
echo ⚠️  IMPORTANTE: Para que a verificação de email funcione, você precisa:
echo    1. Configurar a SUPABASE_SERVICE_ROLE_KEY no Netlify Dashboard
echo    2. Ou definir localmente no arquivo .env.local
echo.
echo 📧 O sistema tentará conectar às funções Netlify em:
echo    - Desenvolvimento: http://localhost:8888/.netlify/functions/
echo    - Produção: https://sheet-tools.com/.netlify/functions/
echo.
echo 🔧 Iniciando Netlify Dev (porta 8888)...
echo.

REM Iniciar Netlify Dev em background
start /B netlify dev --port 8888

REM Aguardar um pouco para o Netlify Dev inicializar
timeout /t 3 /nobreak > nul

echo ✅ Netlify Dev iniciado na porta 8888
echo 🌐 Acesse: http://localhost:8888
echo.
echo 💡 Dica: Se a verificação de email não funcionar, verifique se:
echo    - A SUPABASE_SERVICE_ROLE_KEY está configurada
echo    - O Netlify Dev está rodando na porta 8888
echo.

pause
