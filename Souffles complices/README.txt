Dossier pour tes photos d'animaux (ex: nala.jpg)

--- Structure du site ---

Le site comporte 4 pages, chacune avec un rôle différent :
- index.html        -> Accueil (hero + liens vers les 3 pages)
- association.html  -> L'association (mission, actions, chiffres clés)
- animaux.html       -> Les animaux (fiches filtrables, parrainage HelloAsso)
- soutenir.html      -> Nous soutenir (don, parrainage, et "Comment adhérer")

La navigation et le pied de page (coordonnées) sont dupliqués sur chaque page
et se chargent via js/site.js + content/contact.json.

--- Contenu administrable ---

Une fois le site déployé sur Netlify (avec Identity + Git Gateway activés),
tout le contenu ci-dessous est modifiable depuis /admin sans toucher au code :

- content/animaux.json   -> fiches des animaux (statut, histoire, photo, galerie polaroïds avec légendes, lien de parrainage)
- content/asso.json      -> présentation de l'association + chiffres clés
- content/adhesion.json  -> section "Comment adhérer" (tarif, avantages, étapes, lien HelloAsso)
- content/soutien.json   -> cartes "Nous soutenir" (don, parrainage général)
- content/contact.json   -> téléphone, email, liens Facebook / HelloAsso du pied de page

Pour activer l'admin :
1. Déployer ce dossier sur Netlify.
2. Dans Netlify : Site settings > Identity > Enable Identity, puis activer Git Gateway.
3. Remplacer site_url et display_url dans admin/config.yml par l'URL réelle du site Netlify.
4. Créer ton compte via Identity, puis te rendre sur /admin pour éditer le contenu.

Le lien HelloAsso par défaut se règle dans l'admin (Coordonnées). Il est utilisé partout
quand un lien spécifique (don, adhésion, animal) est vide ou invalide.

--- Photos des animaux : outil de cadrage ---

admin/cadrage.html (sur le site : /admin/cadrage.html) détecte l'animal sur une photo,
propose le meilleur cadrage dans la bulle et permet d'ajuster en cliquant.
1. Ouvrir l'outil, choisir la photo (la détection utilise TensorFlow.js, connexion internet requise).
2. Copier le cadrage (ex : 34% 50%) dans le champ "Cadrage de la photo dans la bulle" de la fiche.
3. Télécharger la photo optimisée (1400 px max, JPEG) et l'envoyer comme "Photo principale".
