# Projet CIZO

App de gestion de salon (caisse, clients, agenda, fidélité, personnel, prestations) — SPA HTML + API REST  
Stack : Node.js 20 + Express, PostgreSQL 16, PM2, Nginx, VPS Ubuntu 24.04  
Domaine : cizopro.fr — Tenant test : Image By Urban (slug: image-by-urban)

## TODO — Roadmap fonctionnelle

### Priorité haute
- [ ] SMS rappels RDV — Brevo configuré mais pas branché (seulement email actif)
- [ ] Fiche technique client — table existe en DB, interface manquante (teintes, formules, longueur)
- [ ] Acompte en ligne — paiement Stripe lors de la réservation pour éviter no-shows
- [ ] Chatbot aide au choix — assistant sur page booking pour orienter vers la bonne prestation

### Priorité moyenne
- [ ] Vue agenda par coiffeur — colonnes séparées par employé
- [ ] Mail satisfaction post-RDV — envoi auto après chaque RDV terminé (infra Brevo/SMTP déjà en place, à implémenter dans appointments.controller.js). Questions en suspens : déclenchement (auto/manuel), délai (immédiat/1h), contenu (étoiles, lien Google, remerciement simple)
- [ ] Widget réservation — iframe intégrable sur site web existant
- [ ] Rapport comptable mensuel — synthèse TVA, CA par prestation

### Priorité basse
- [ ] Notifications push mobile — alertes RDV sur téléphone
- [ ] Multi-salons — gérer plusieurs établissements (infrastructure déjà en place)
- [ ] Abonnements Stripe — monétisation de CIZO

## Infos techniques clés
- SSH : ssh root@168.231.81.67 (mot de passe)
- App : /var/www/cizo, PM2 process "cizo", port 3000
- DB : cizo_prod, user cizo_user
- Frontend local : C:\Cizo_frontend_v2\
- Déploiement : scp depuis Git Bash local (PAS depuis SSH, PAS depuis terminal Hostinger)
- ATTENTION : Le terminal web Hostinger traduit le code en français — ne jamais l'utiliser pour modifier du code !
- Tenant ID : 5fd77cae-a208-4fb6-9a50-1dd0ca4a372f

## Bugs corrigés (session mai 2026)
- Navigation pages : CSS manquait .page{display:none} → corrigé
- Bouton suppression client : idem CSS
- Fichiers VPS traduits en français par WinSCP → remplacé par scp Git Bash
- _sitesData déclaré 2x (settings.js + agenda-cizo.js) → renommé _settingsSitesData
- loadAgenda() en double → agenda.js vidé
- Remises 404 : double préfixe /api/api/ → corrigé dans stock.js
- Carte cadeau : fonction saveGC() → renommée saveGiftCard()
- Carte cadeau 400 : champs français ≠ backend anglais → initial_value, recipient_name, purchaser_email
- Backend gift_cards.controller.js corrompu (502) → réparé avec Python
- stock manquant dans PAGE_CFG nav.js → ajouté
- Affichage cartes cadeau : gc.amount → gc.initial_value, gc.status → dérivé de is_active

## En attente
- Déployer index.html + stock.js mis à jour (modal envoi carte cadeau avec prévisualisation)
- Ajouter route POST /:id/send-email dans gift_cards.routes.js sur le VPS
- Redémarrer pm2 après modifs backend
