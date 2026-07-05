#!/bin/bash
set -e

if [ $# -ne 4 ]; then
  echo "Uso: $0 <usuario> <puerto> <ip> <contraseña>"
  echo "Ej: $0 root 22 192.168.1.100 miPass"
  exit 1
fi

USUARIO="$1"
PUERTO="$2"
IP="$3"
PASS="$4"

sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no -p "$PUERTO" "$USUARIO@$IP" "
  cd /var/www/GFC-Front-PRD/angular
  git pull
  npm i
  npm run build
"
