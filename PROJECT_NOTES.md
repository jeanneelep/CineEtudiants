# CinéÉtudiants — Notes de projet

Ce fichier remplace la mémoire locale d'une session Claude Code : il voyage avec le repo Git, donc toute nouvelle session (sur n'importe quel ordinateur) doit le lire en premier pour retrouver le contexte complet du projet.

**Dernière mise à jour : 2026-08-30**

---

## 1. Le projet en une phrase

CinéÉtudiants est une plateforme de partage de courts métrages réalisés par des étudiants — donner de la visibilité aux créateurs et créer une communauté de spectateurs. Projet étudiant, approche MVP (pas de sur-ingénierie, scalabilité = considération future).

## 2. Les 3 types d'utilisateurs

- **Créateur (étudiant inscrit)** : upload de vidéos (titre, description, catégorie, thumbnail), profil public, stats (vues/likes/commentaires). Compte et vidéos doivent être validés par un admin avant publication.
- **Spectateur inscrit** : regarde, like, commente (modéré). Compte auto-activé après vérification email.
- **Spectateur non inscrit** : lecture seule, pas de like/commentaire.
- **Admin** : valide/rejette comptes, vidéos, commentaires ; gère les signalements ; voit les stats globales.

## 3. Stack technique (à jour)

- **Frontend** : React + Vite, JavaScript (pas TypeScript côté frontend)
- **Backend** : Node.js + Express + **TypeScript**
- **Base de données** : PostgreSQL + Prisma ORM
- **Auth** : JWT + bcrypt (mots de passe hashés, migration automatique des anciens comptes en clair) ; vérification email
- **Stockage vidéo** : filesystem local pour l'instant (`/backend/uploads`, pas trackée par git)
- **Hébergement cible** : **VPS Scaleway + Caddy (HTTPS auto) + pm2, sans Docker, sans Redis/Bull** — budget non-négociable ~50-60€/an. (⚠️ Hostinger a été évoqué dans les toutes premières notes du projet mais c'est obsolète, ne plus le proposer.)
- **Encodage vidéo prévu** : FFmpeg → HLS (une seule résolution pour le V1, pas de multi-résolution), fichier original supprimé après encodage pour économiser l'espace disque.

## 4. État actuel (implémenté et fonctionnel)

### Backend
- Auth complète (register/login/JWT/vérification email via Mailtrap)
- Upload vidéo (Multer, MP4 brut — **pas encore d'encodage HLS**, c'est dans la roadmap)
- Streaming avec support HTTP range requests
- Commentaires CRUD + réponses imbriquées, likes, favoris
- Dashboard admin (stats, modération vidéos/utilisateurs/commentaires)
- Modération obligatoire : toute vidéo passe en `pending` avant `approved` (corrigé le 2026-08-10, avant c'était du théâtre — tout passait direct en `approved`)
- Sécurité : bcrypt sur les mots de passe, JWT_SECRET obligatoire au démarrage (plus de fallback `'secret'`), profil public ne fuite plus l'email/vidéos non-approuvées à un tiers anonyme
- ⚠️ CORS encore grand ouvert — à traiter en Semaine 6 de la roadmap

### Frontend
- Pages : Home, Explore, Réalisateurs, Profile, Upload, AdminDashboard, VerifyEmail, **Rules (nouvelle, 2026-08-30)**
- Auth flow complet (register → vérif email → login)
- Recherche connectée à de vrais utilisateurs/films (Réalisateurs n'est plus en fausses données statiques, sauf vérif à refaire ponctuellement)
- Comments avec menu kebab (•••) pour édition/suppression — **design finalisé, voir règle stricte section 6**
- Page "Règles de dépôt" ajoutée le 2026-08-30, accessible depuis le Footer (lien "Règles de dépôt")
- Tout tourne encore en local uniquement (localhost:5173 frontend / localhost:5000 backend), **jamais déployé en prod**

### Comptes de test
- jeannelep@hotmail.fr → ADMIN
- test@exemple.com, test2@exemple.com, jlepitre@fubo.tv → utilisateurs standards
- Mot de passe de reset : `password` (si besoin de réinitialiser les comptes de test)

## 5. Roadmap officielle — v5 (2026-08-20), source de vérité

La roadmap complète et détaillée (tableau avec Phase/Éléments/Semaine/Jalon/Priorité/Statut) est publiée en artifact Claude : `https://claude.ai/code/artifact/f1bd2d13-f85c-405c-8ba8-1204be49c7ad`. Un export PDF existe aussi dans `documentation/roadmap-cinetudiants-v2.pdf`.

**Logique de la roadmap** : tout le développement technique pur passe en premier (S1-S8, "MAINTENANT"), tout ce qui est administratif/périphérique (finance, juridique CGU, charte graphique, nom de domaine, emailing, mot de passe oublié) est regroupé en **Semaine 9** ("PLUS TARD"), puis le déploiement réel en S10.

Résumé des 12 semaines :
- **S1** — Achat domaine + VPS Scaleway, DNS, premier jet CGU/mentions légales
- **S2** — Install VPS (Node/PostgreSQL/Caddy/pm2, sans Docker), mot de passe oublié
- **S3** — Validation ffprobe des uploads (codec/durée/poids réels), case de certification des droits
- **S4** — Pipeline FFmpeg → HLS (1 résolution), suppression original, vignette auto, email fin d'encodage, lecteur HLS (Plyr)
- **S5** — Premier déploiement réel (backend+frontend+DB+HTTPS), email transactionnel en prod
- **S6** — Système de signalement (film + commentaire) + vue admin dédiée, rate limiting login, CORS restreint
- **S7** — Sélection manuelle "coups de cœur" admin, rail "Tendances" (tri likes à la volée)
- **S8** — Sauvegarde DB hebdomadaire + test de restauration, finalisation textes légaux
- **S9** — Bêta fermée (3-5 testeurs réels), retours centralisés
- **S10** — Correction bugs par gravité (bloquants → majeurs → mineurs)
- **S11** — Recrutement premiers contributeurs, message de lancement
- **S12** — Ouverture progressive, diffusion, décision d'ouverture élargie
- **Backlog V2 (hors 3 mois)** : notifications, stats avancées, follow/unfollow, partage réseaux sociaux, OAuth, monétisation

**9 décisions d'architecture verrouillées (19/08), à ne pas remettre en question sans le signaler explicitement à l'utilisatrice** :
1. On fait évoluer le code existant, pas de nouveau repo
2. Pas de Docker
3. Pas de Redis/Bull — traitement séquentiel simple pour l'encodage
4. Une seule résolution HLS au départ
5. Tous les films passent en modération humaine, pas d'exception heuristique
6. Fichier vidéo original supprimé après encodage HLS
7. Scaleway VPS + Caddy (pas de plateforme gérée type Render/Railway, trop cher)
8. CGU/mentions légales rédigées dès S1-S2, pas reportées à la fin
9. Trending calculé à la volée, pas de table de cache

## 6. Règles strictes à ne jamais enfreindre

### 🚫 Ne JAMAIS retoucher le design des commentaires
Le composant commentaires (Home.jsx / Explore.jsx / Profile.jsx + CSS associé : `.comment-item`, `.comment-header`, `.comment-meta`, `.comment-time`, `.comment-text`, `.comment-footer`, `.reply-item`, `.reply-header`, `.reply-text`, `.replies-container`) est **finalisé et validé** depuis le 2026-08-11 après de nombreux allers-retours frustrants. L'utilisatrice a dit explicitement : *"PARFAIT pour l'espace commentaire touche plus à rien, ne modifie jamais ça."*

- Exception : un bug précis et explicitement signalé peut être corrigé (ex: fix backend d'un bug de duplication de réponse le 2026-08-11), tant que le correctif reste minimal et scope à ce bug précis.
- **Incident du 2026-08-30** : un commit ajoutant la page "Règles de dépôt" a supprimé par erreur les timestamps des commentaires en effet de bord. Repéré et corrigé après coup. **Leçon retenue : avant tout commit touchant Home.jsx/Explore.jsx/Profile.jsx, revérifier le diff par rapport à cette règle avant de committer, ne pas compter sur l'utilisatrice pour repérer l'erreur.**

### 🚫 Ne pas fusionner de lignes de roadmap "pour simplifier"
Chaque ligne du document de référence de l'utilisatrice doit rester sa propre ligne dans toute reformulation. On peut réordonner/redistribuer/reformuler, jamais fusionner deux lignes distinctes.

### 🚫 Pas de système de priorité à plus de 2 niveaux sans demande explicite
Système simplifié à MAINTENANT / PLUS TARD uniquement, sauf demande contraire.

## 7. Comment travailler avec l'utilisatrice (préférences validées)

- **Expliquer avant de coder** : proposer et faire confirmer une approche avant d'implémenter, surtout pour des choix d'architecture.
- **S'arrêter immédiatement si elle dit "arrête de coder"** ou demande une clarification — basculer en discussion.
- **Focus MVP** : pas de sur-ingénierie, pas de fonctionnalité non demandée, pas de design pour des besoins hypothétiques.
- **Français OK**, termes techniques en anglais si plus naturels.
- **Toujours vérifier qu'un fichier a bien été écrit** après modification (l'outil d'écriture peut échouer silencieusement sur des chemins avec espaces comme "Projet PGR").
- Elle remarque les détails (lignes fusionnées, règles enfreintes) — être rigoureux plutôt que de compter sur elle pour repérer les erreurs après coup.

## 8. Comment relancer le projet en local

```bash
cd "Projet PGR/backend"
npm install
npm start
# backend sur http://localhost:5000

cd "Projet PGR/projet_plateforme"
npm install
npm run dev
# frontend sur http://localhost:5173
```

Voir aussi `ADMIN_SETUP.md` et `QUICK_START.sh` à la racine du repo pour la configuration admin/démarrage rapide.

## 9. Sujets ouverts / dette technique connue

- Home.jsx et Explore.jsx ont une logique de commentaires/réponses ~100% dupliquée (CSS et JSX identiques) — source probable de futurs bugs incohérents entre les deux pages ; extraction d'un composant `<CommentsSection>` partagé envisagée mais pas faite.
- `Gallery.jsx` est du code mort.
- `Realisateurs.jsx` — vérifier si encore sur données réelles ou repassé sur du hardcodé.
- CORS grand ouvert (traité en S6 de la roadmap).
- Pas encore d'encodage HLS — vidéos servies en MP4 brut avec range requests.
- Pas de mot de passe oublié fonctionnel actuellement (prévu S2).
