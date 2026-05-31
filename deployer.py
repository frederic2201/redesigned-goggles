#!/usr/bin/env python3
"""
Script de déploiement CIZO
Lance depuis Git Bash : python deployer.py
Nécessite : pip install paramiko
"""
import paramiko, os, sys

VPS_HOST = "168.231.81.67"
VPS_USER = "root"
VPS_PASS = "Frederic2201."
REMOTE_DIR = "/var/www/cizo/public/js"

# Fichiers à déployer (chemin local → chemin distant)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FILES = [
    (os.path.join(SCRIPT_DIR, "js", "stock.js"), f"{REMOTE_DIR}/stock.js"),
    (os.path.join(SCRIPT_DIR, "js", "nav.js"),   f"{REMOTE_DIR}/nav.js"),
    (os.path.join(SCRIPT_DIR, "js", "api.js"),   f"{REMOTE_DIR}/api.js"),
]

print("=== Déploiement CIZO ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connexion à {VPS_HOST}...")
    client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    print("Connecté !\n")

    sftp = client.open_sftp()
    for local, remote in FILES:
        name = os.path.basename(local)
        print(f"→ Envoi {name}...")
        sftp.put(local, remote)
        print(f"  ✓ {remote}")
    sftp.close()

    print("\n→ Redémarrage PM2...")
    _, stdout, stderr = client.exec_command("pm2 restart cizo && pm2 status")
    print(stdout.read().decode())

    print("\n=== Déploiement terminé avec succès ! ===")

except Exception as e:
    print(f"\n❌ Erreur : {e}")
    sys.exit(1)
finally:
    client.close()
