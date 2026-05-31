#!/bin/bash
# Déploiement CIZO — copie les fichiers frontend sur le VPS et redémarre PM2

VPS="root@168.231.81.67"
KEY="$HOME/.ssh/cizo_vps"
REMOTE="/var/www/cizo/public"
LOCAL="$(dirname "$0")"

SSH="ssh -i $KEY -o StrictHostKeyChecking=no"
SCP="scp -i $KEY -o StrictHostKeyChecking=no"

echo "=== Déploiement CIZO ==="

# Copie des fichiers JS
echo "→ Envoi js/stock.js..."
$SCP "$LOCAL/js/stock.js" $VPS:$REMOTE/js/stock.js

echo "→ Envoi js/nav.js..."
$SCP "$LOCAL/js/nav.js" $VPS:$REMOTE/js/nav.js

echo "→ Envoi js/api.js..."
$SCP "$LOCAL/js/api.js" $VPS:$REMOTE/js/api.js

# Redémarrage PM2
echo "→ Redémarrage PM2..."
$SSH $VPS 'pm2 restart cizo && pm2 status'

echo "=== Déploiement terminé ==="
