#!/usr/bin/env python3
import paramiko, os, sys

VPS_HOST = '168.231.81.67'
VPS_USER = 'root'
VPS_PASS = 'Frederic2201.'
REMOTE_DIR = '/var/www/cizo/public/js'

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FILES = [
    (os.path.join(SCRIPT_DIR, 'js', 'stock.js'), f'{REMOTE_DIR}/stock.js'),
    (os.path.join(SCRIPT_DIR, 'js', 'nav.js'),   f'{REMOTE_DIR}/nav.js'),
    (os.path.join(SCRIPT_DIR, 'js', 'api.js'),   f'{REMOTE_DIR}/api.js'),
]

print('=== Deploiement CIZO ===')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
    print('Connecte!\n')
    sftp = client.open_sftp()
    for local, remote in FILES:
        print(f'Envoi {os.path.basename(local)}...')
        sftp.put(local, remote)
        print(f'  OK -> {remote}')
    sftp.close()
    _, out, _ = client.exec_command('pm2 restart cizo && pm2 status')
    print(out.read().decode())
    print('=== Termine! ===')
except Exception as e:
    print(f'Erreur: {e}'); sys.exit(1)
finally:
    client.close()
