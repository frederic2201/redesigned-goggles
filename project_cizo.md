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
- SSH sans mot de passe : ssh -i ~/.ssh/cizo_vps root@168.231.81.67
- App : /var/www/cizo, PM2 process "cizo", port 3000
- Nginx : écoute port 8080, proxy vers localhost:3000
- DB : cizo_prod, user cizo_user
- Frontend local : C:\Cizo_frontend_v2\
- Frontend VPS : /var/www/cizo/public/
- Déploiement : scp -i ~/.ssh/cizo_vps depuis Git Bash local
- JAMAIS utiliser le terminal web Hostinger (traduit le code en français)
- Tenant ID : 5fd77cae-a208-4fb6-9a50-1dd0ca4a372f

## Bugs corrigés (session mai 2026)
- Navigation pages → CSS .page{display:none} manquait
- Bouton suppression client → idem
- Remises 404 → double préfixe /api/api/ dans stock.js → corrigé
- Carte cadeau 400 → champs frontend ≠ backend → initial_value, recipient_name, purchaser_email, purchaser_name
- Backend gift_cards.controller.js : ligne corrompue "initial_value = valeur_initiale" → supprimée
- Affichage cartes cadeau : gc.amount → gc.initial_value, statut dérivé de is_active
- Modal envoi carte cadeau avec prévisualisation → créé (frontend + backend)
- Route POST /api/gift-cards/:id/send-email → ajoutée dans gift_cards.routes.js
- Serveur plantait (33 restarts) → SyntaxError ligne 38 gift_cards.controller.js → corrigée
- Page de connexion inaccessible (boucle infinie) → express.static servait index.html à "/" → fix: index:false + route app.get("/") → login.html
- Skill vps-manager créée → connexion SSH directe sans mot de passe depuis Claude

## À faire (prochaine session)
- [ ] Tester envoi carte cadeau par email (route send-email ajoutée mais pas encore testée)
- [ ] Déployer nav.js mis à jour sur VPS
- [ ] Tester modules : Agenda, Personnel, Fidélité, Forfaits, Stock
- [ ] Mail satisfaction post-RDV (à implémenter plus tard)
