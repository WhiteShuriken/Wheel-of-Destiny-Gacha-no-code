# Wheel of Destiny Gacha

## Description
Wheel of Destiny Gacha est un jeu de tirage ("gacha game") simple où les utilisateurs peuvent dépenser des pièces pour obtenir des personnages de différentes raretés. Le projet utilise HTML, CSS, et JavaScript pour offrir une expérience utilisateur interactive.

## Fonctionnalités
- **Système de Packs** :
  - Pack Genesis : Pack de base du jeu
  - Pack Apocalypse : Pack de la saison 2
- **Tirage de personnages** :
  - Tirage simple pour 100 pièces
  - Tirage multiple (x10) pour 900 pièces, avec un bonus d'économie
- **Collection des personnages** :
  - Les personnages obtenus sont automatiquement ajoutés à la collection
  - La collection affiche le niveau des personnages, leur expérience (XP), et leur progression
- **Raretés des personnages** :
  - Commun (Common)
  - Rare
  - Légendaire (Legendary)
- **Système de progression** :
  - Les personnages montent en niveau en fonction du nombre de fois qu'ils ont été tirés
  - Niveau maximum : 5
- **Tri de la collection** :
  - Par ordre alphabétique
  - Par niveau
  - Par rareté

## Technologies utilisées
- **HTML** : Structure de la page, mise à jour pour une meilleure accessibilité et organisation.
- **CSS** : Design et mise en page, avec une refonte significative pour améliorer l'esthétique et la réactivité. Utilisation de variables CSS pour la cohérence du thème.
- **JavaScript** : Logique du jeu et interactions utilisateur, incluant la gestion des données via DataCache, la persistance de l'état du jeu avec StorageManager, et une gestion améliorée de l'interface utilisateur.
- **JSON** : Stockage des données des personnages, configuration du jeu et des raretés.

## Structure du projet
```
Wheel-of-Destiny-Gacha/
├── index.html         # Page principale du jeu, structure mise à jour pour l'accessibilité
├── style.css         # Styles pour le jeu, refonte complète avec des variables CSS
├── script.js         # Logique du jeu, incluant la gestion des données, de l'état et de l'interface utilisateur
├── characters.json   # Données des personnages, incluant les personnages du pack Apocalypse
├── packs.json        # Configuration des packs de tirage, incluant le pack Apocalypse
├── rarity.json       # Configuration des raretés avec des informations de couleur
├── assets/          # Contient les images et autres fichiers multimédias
│   ├── images/
│   │   ├── hero/    # Images des personnages
│   │   ├── icon/    # Icônes pour la navigation et les éléments de l'interface utilisateur
│   │   └── pack/    # Images des packs
```

## Instructions pour l'utilisation
1. **Cloner le projet** :
   ```bash
   git clone https://github.com/WhiteShuriken/Wheel-of-Destiny-Gacha-no-code
   ```
2. **Ouvrir le fichier `index.html` dans un navigateur**
3. **Jouer** :
   - Utilisez les boutons de navigation en bas pour accéder aux différentes sections :
     - **Home** : Accueil du jeu
     - **Pull** : Effectuez des tirages de personnages à partir des packs disponibles
     - **Collection** : Consultez votre collection de personnages et triez-la selon vos préférences

## Ajout de nouveaux personnages
Pour ajouter de nouveaux personnages au jeu :
1. Ouvrez le fichier `characters.json`
2. Ajoutez un nouvel objet avec les attributs suivants :
   ```json
   {
       "name": "Nom du personnage",
       "rarity": "Common | Rare | Legendary",
       "image": "Chemin de l'image dans le dossier assets",
       "packId": ["id_du_pack"] // L'ID du pack auquel le personnage appartient
   }
   ```
3. Enregistrez le fichier et rechargez la page dans le navigateur

## Améliorations possibles
- Améliorer l'interface des tirages avec de plus grandes icônes
- Afficher tous les personnages dans la collection (grisés si non débloqués)
- Implémenter un système de news par blocs
- Ajouter une animation pour les tirages
- Implémenter un système de récompenses journalières
- Créer un backend pour sauvegarder les collections des utilisateurs
- Ajouter des effets sonores pour améliorer l'expérience utilisateur

## Mises à jour récentes
- **Refonte de l'interface utilisateur** : Le CSS a été entièrement refait pour améliorer l'apparence et la réactivité du jeu.
- **Icônes de navigation** : La barre de navigation utilise désormais des icônes pour une meilleure expérience utilisateur.
- **Pack Apocalypse** : Ajout du pack Apocalypse avec de nouveaux personnages.
- **Gestion des données** : Introduction de `DataCache` pour une gestion efficace des données du jeu.
- **Persistance de l'état** : Utilisation de `StorageManager` pour sauvegarder l'état du jeu dans le navigateur.
- **Améliorations de la collection** : La collection de personnages affiche désormais le niveau et la progression de chaque personnage.

## Auteur
Projet développé par KemseyG (DrWhite)

## Source 
- Utilisation de ChatGPT (OpenAI)
- Utilisation de Gemini (Google)
- Utilisation de MistralAI (Mistral AI)
- Utilisation de BlackoxAI (Cours Connecte Inc)
- Utilisation de Devdocs.io 
- Utilisation de Ollama (ollama)
- Utilisation de Cline (Saoud Rizwan)
- Utilisation de CopilotAI (Microsoft)
