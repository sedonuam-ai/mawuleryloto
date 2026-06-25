# Loto Togo - Application installable (sans Flutter, sans compilation)

Application regroupant les 12 jeux de Loto 5/90 du Togo. Fonctionne dans le
navigateur, s'installe comme une vraie app sur l'écran d'accueil Android, et
fonctionne **hors-ligne** une fois ouverte une première fois.

**Aucune installation d'outil de développement nécessaire** (pas de Flutter,
pas d'Android Studio). Juste mettre les fichiers sur GitHub.

## Les 12 jeux intégrés

| Jour      | 13:00          | 18:00          |
|-----------|----------------|----------------|
| Lundi     | Lotto Diamant  | Loto Gold      |
| Mardi     | Loto Cash      | Loto Boom      |
| Mercredi  | Loto Benz      | Loto Prestige  |
| Jeudi     | Loto Million   | Loto Super     |
| Vendredi  | Loto Kadoo     | Loto King      |
| Samedi    | Loto Sam       | Loto Bingo     |

---

## ÉTAPE 1 — Mettre les fichiers sur GitHub

1. Décompresse ce zip : tu obtiens un dossier `loto_togo_web/` avec ces fichiers :
   ```
   index.html
   app.js
   manifest.json
   service-worker.js
   icons/icon-192.png
   icons/icon-512.png
   ```
2. Va sur ton dépôt GitHub existant (celui que tu utilises déjà,
   `S.A.M.E-GLOBAL-SERVICE-Togo_Loto5_90`).
3. Clique sur **"Add file" > "Upload files"** (en haut de la page du dépôt).
4. Glisse-dépose TOUS les fichiers et dossiers ci-dessus (y compris le dossier
   `icons` avec les 2 images dedans).
5. En bas de page, clique sur **"Commit changes"**.

⚠️ Important : ne mets pas ces fichiers dans un sous-dossier. Ils doivent être
directement à la racine du dépôt (au même niveau que ton ancien README.md),
sinon le lien GitHub Pages ne les trouvera pas.

## ÉTAPE 2 — Activer GitHub Pages (si pas déjà fait)

1. Sur la page du dépôt, clique sur **"Settings"** (dans les onglets en haut).
2. Dans le menu de gauche, clique sur **"Pages"**.
3. Sous "Build and deployment" > "Source", choisis **"Deploy from a branch"**.
4. Choisis la branche **"main"** et le dossier **"/ (root)"**.
5. Clique sur **"Save"**.

GitHub te donne alors un lien du type :
```
https://sedonuam-ai.github.io/S.A.M.E-GLOBAL-SERVICE-Togo_Loto5_90/
```
(Ça peut prendre 1 à 2 minutes pour être actif après la sauvegarde.)

## ÉTAPE 3 — Installer l'application sur un téléphone Android

1. Ouvrir le lien ci-dessus dans **Chrome** sur le téléphone.
2. Appuyer sur le menu (les 3 points en haut à droite de Chrome).
3. Choisir **"Ajouter à l'écran d'accueil"** (ou "Installer l'application" si
   Chrome le propose directement).
4. Confirmer : l'icône "LT 5/90" apparaît sur l'écran d'accueil, comme une
   vraie application.

À partir de là, l'application s'ouvre en plein écran (sans la barre du
navigateur) et fonctionne même sans connexion internet.

## Comment utiliser l'application

1. **Écran d'accueil** : les 12 jeux groupés par jour, avec le dernier
   résultat connu pour chacun.
2. **Bouton crayon ✏️ (en haut à droite)** : ouvre l'écran de saisie. Choisis
   le jeu, la date, entre les 5 numéros gagnants, puis valide.
3. **Bouton 📊 (en haut)** : ouvre l'écran "Outils & Statistiques" avec 3 onglets :
   - **🔮 Prédictions** : génère des grilles selon 5 modes au choix —
     totalement aléatoire, fréquents (numéros qui sortent le plus), écarts
     (numéros "en retard"), mixte (combine les deux), ou manuel (tu choisis
     toi-même certains numéros et l'app complète le reste).
   - **🔢 Compteur** : tableau des 90 numéros avec, pour chacun, le nombre de
     fois qu'il est sorti dans l'historique ("Cumul") et depuis combien de
     tirages il n'est pas ressorti ("Écart"). Triable par jeu ou tous jeux
     confondus.
   - **✅ Vérifier gains** : choisis un jeu et un tirage déjà enregistré,
     entre la grille que tu as jouée, et l'app te dit combien de numéros
     correspondent (avec les numéros gagnants mis en évidence en doré).
4. **Toucher un jeu** dans la liste d'accueil : affiche l'historique complet
   des résultats enregistrés pour ce jeu.

⚠️ Les prédictions (fréquents/écarts/mixte) et le compteur ne deviennent
pertinents qu'une fois que tu as saisi plusieurs tirages réels dans
l'historique — au tout début, avec peu de données, les résultats seront
proches du hasard pur.

## Comment mettre à jour l'application plus tard

Si tu veux modifier le code (ajouter un jeu, changer une couleur...), modifie
simplement le fichier concerné, puis re-upload-le sur GitHub via "Add file >
Upload files" en remplaçant l'ancien. Les utilisateurs verront la mise à jour
automatiquement la prochaine fois qu'ils ouvrent l'app avec internet.

## Important à savoir sur le stockage des résultats

Les résultats que tu saisis sont stockés **dans le navigateur de chaque
téléphone individuellement** (pas sur un serveur central). Cela veut dire
que si toi tu saisis un résultat sur ton téléphone, les autres utilisateurs
ne le verront pas automatiquement — chacun doit saisir ses propres résultats,
ou bien il faudra plus tard ajouter une base de données partagée (Firebase)
pour que tout le monde voie les mêmes résultats en temps réel.

## Prochaines améliorations possibles

- Base de données partagée (Firebase) pour que tous les utilisateurs voient
  les mêmes résultats automatiquement
- Notifications à l'heure de chaque tirage
- Vérification automatique des grilles jouées
