#!/bin/bash

# Variables de configuración
PROJECT_ID="fsiordia-cloud"
REGION="us-central1"
REPOSITORY="runa-apps"
SERVICE_NAME="runa-matcher"
LOCAL_PORT="3000"
CONTAINER_NAME="runa-matcher-local"

echo "🚀 Desplegando RUNA Data Matcher localmente..."

# Autenticar Docker (si usas service account)
# gcloud auth activate-service-account --key-file=/path/to/service-account-key.json
# gcloud auth configure-docker $REGION-docker.pkg.dev

# Obtener la imagen más reciente
echo "📦 Descargando imagen más reciente..."
docker pull $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME:latest

# Detener contenedor existente si existe
echo "🛑 Deteniendo contenedor existente..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Ejecutar nuevo contenedor
echo "🏃 Iniciando nuevo contenedor..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $LOCAL_PORT:8080 \
  $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME:latest

# Verificar estado
echo "✅ Verificando estado del contenedor..."
docker ps | grep $CONTAINER_NAME

echo "🌐 RUNA Data Matcher disponible en: http://localhost:$LOCAL_PORT"
echo "📊 Para ver logs: docker logs $CONTAINER_NAME"