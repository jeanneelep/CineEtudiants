# CinéÉtudiants - Plateforme Vidéo pour Étudiants

## 🎬 Objectif Principal
Plateforme de partage de courts métrages réalisés par des étudiants. Donner de la visibilité aux créateurs tout en créant une communauté de spectateurs.

## 📋 Type de Projet
Projet étudiant (MVP/Base solide). Scalabilité à évaluer plus tard.

---

## 👥 3 Types d'Utilisateurs

### 1. Créateur (Étudiant inscrit)
- Upload des vidéos (titre, description, catégorie, thumbnail)
- Profil public avec ses vidéos
- Voir les stats de ses vidéos (vues, likes, commentaires)
- **Modération**: Compte doit être validé AVANT activation
- **Modération**: Vidéos doivent être validées AVANT publication

### 2. Spectateur inscrit
- Regarder les vidéos
- Liker les vidéos
- Commenter les vidéos *(modérés, possiblement les premiers du user)*
- Suivre des créateurs *(optionnel)*
- Compte auto-activé après email verification

### 3. Spectateur non inscrit
- Regarder les vidéos uniquement (pas de like/commentaire)

## ⚙️ Admin
- Gérer les comptes (validation, ban, suppression)
- Modérer les vidéos (validation avant publication, suppression)
- Modérer les commentaires
- Voir les stats globales
- Gérer les signalements de contenu inapproprié

---

## ✨ Fonctionnalités Clés

### Authentification
- ✓ Inscription (créateur + spectateur)
- ✓ Email verification
- ✓ Login/Logout
- ✓ Password reset
- ✓ JWT tokens

### Vidéos
- ✓ Upload vidéo (MP4, WebM)
- ✓ **Durée max**: Paramétrable (5-15 min typically)
- ✓ **Modération**: Avant publication (file d'attente admin)
- ✓ Pas de limite de nombre de vidéos par user
- ✓ Métadonnées: Titre, description, catégorie, thumbnail
- ✓ Stats: Vues, likes, commentaires

### Galerie/Découverte
- ✓ Page d'accueil avec vidéos populaires/récentes
- ✓ Profil créateur (bio, photo, liste vidéos)
- ✓ Recherche + filtres (catégorie, durée, date)
- ✓ Système de like/unlike

### Commentaires
- ✓ Commenter les vidéos
- ✓ **Modération**: Possiblement les premiers du user, puis auto-approved
- ✓ Signaler les commentaires inappropriés

### Notifications *(Optionnel pour MVP)*
- ✓ Nouveau like
- ✓ Nouveau commentaire
- ✓ Nouveau follower

### Modération/Admin
- ✓ Dashboard admin pour valider comptes
- ✓ Dashboard admin pour valider vidéos
- ✓ Système de signalement pour contenu inapproprié
- ✓ Modération des commentaires

---

## 🏗️ Architecture Non-Technique
- Base solide et fonctionnelle
- Pas besoin d'optimisation extreme au départ
- Scalabilité = future consideration
