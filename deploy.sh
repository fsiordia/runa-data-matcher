#!/bin/bash
# deploy.sh

# Variables (CAMBIAR AQUÍ TU PROJECT_ID)
PROJECT_ID="fsiordia-cloud"
SERVICE_NAME="runa-matcher"
REGION="us-central1"
REPOSITORY="runa-apps"

echo "🚀 Desplegando RUNA Data Matcher en Cloud Run..."

# Habilitar APIs necesarias
echo "🔧 Habilitando APIs..."
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Crear repositorio en Artifact Registry (si no existe)
echo "📦 Creando repositorio en Artifact Registry..."
gcloud artifacts repositories create $REPOSITORY \
  --repository-format=docker \
  --location=$REGION \
  --description="Repository for RUNA applications" \
  --quiet || echo "Repository already exists"

# Configurar autenticación para Docker
echo "🔐 Configurando autenticación Docker..."
gcloud auth configure-docker $REGION-docker.pkg.dev

# Construir imagen
echo "🏗️ Construyendo imagen Docker..."
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME:latest .

# Subir imagen a Artifact Registry
echo "⬆️ Subiendo imagen a Artifact Registry..."
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME:latest

# Desplegar en Cloud Run
echo "🌍 Desplegando en Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME:latest \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080

echo "✅ Despliegue completado!"
echo "🌐 URL del servicio:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
