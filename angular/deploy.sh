#!/bin/bash
set -e

# Parámetros por defecto
USUARIO=""
PUERTO="22"
IP=""
PASS=""
BRANCH="master"
DEPLOY_PATH="/var/www/GFC-Front-PRD"

usage() {
  echo "Uso: $0 [parámetros]"
  echo ""
  echo "Parámetros nombrados (--clave=valor):"
  echo "  --user=<usuario>          Usuario SSH (requerido)"
  echo "  --host=<ip>               IP o hostname del servidor (requerido)"
  echo "  --password=<contraseña>   Contraseña SSH"
  echo "  --port=<puerto>           Puerto SSH (default: 22)"
  echo "  --branch=<rama>           Rama a desplegar (default: master)"
  echo "  --deploy-path=<ruta>      Ruta del despliegue en el server (default: /var/www/GFC-Front-PRD)"
  echo ""
  echo "También acepta posiciónales (compatibilidad):"
  echo "  $0 <usuario> <puerto> <ip> <contraseña>"
  echo "  Ej: $0 root 22 192.168.1.100 miPass"
  echo ""
  echo "Ejemplo completo:"
  echo "  $0 --host=149.50.134.169 --user=root --password='miPass' --branch=master --deploy-path=/var/www/GFC-Front-PRD --port=5842"
  exit 1
}

# Si se pasan 4 posiciónales, se mantiene la compatibilidad con el formato original
if [ $# -eq 4 ] && [[ "$1" != --* ]]; then
  USUARIO="$1"
  PUERTO="$2"
  IP="$3"
  PASS="$4"
else
  for arg in "$@"; do
    case "$arg" in
      --user=*)    USUARIO="${arg#*=}" ;;
      --host=*)    IP="${arg#*=}" ;;
      --password=*) PASS="${arg#*=}" ;;
      --port=*)    PUERTO="${arg#*=}" ;;
      --branch=*)  BRANCH="${arg#*=}" ;;
      --deploy-path=*) DEPLOY_PATH="${arg#*=}" ;;
      --help|-h)   usage ;;
      *)           echo "Parámetro desconocido: $arg" >&2; usage ;;
    esac
  done
fi

if [ -z "$USUARIO" ] || [ -z "$IP" ]; then
  echo "Error: faltan --user y --host" >&2
  usage
fi

echo "Desplegando GFC-Front a $USUARIO@$IP:$PUERTO"
echo "  Rama:        $BRANCH"
echo "  Deploy path: $DEPLOY_PATH"

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no -p "$PUERTO" "$USUARIO@$IP" "
  set -e
  cd \"$DEPLOY_PATH/angular\"
  git stash || true
  git fetch --all
  git checkout \"$BRANCH\"
  git pull origin \"$BRANCH\"
  npm i
  npm run build
"
