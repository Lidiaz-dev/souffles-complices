Dossier pour tes photos d'animaux (ex: nala.jpg)

--- Contenu administrable ---

Une fois le site déployé sur Netlify (avec Identity + Git Gateway activés),
tout le contenu ci-dessous est modifiable depuis /admin sans toucher au code :

- content/animaux.json   -> fiches des animaux (statut, histoire, photo, lien de parrainage individuel)
- content/asso.json      -> présentation de l'association + chiffres clés
- content/adhesion.json  -> section "Comment adhérer" (tarif, avantages, étapes, lien HelloAsso)
- content/soutien.json   -> cartes "Nous soutenir" (don, parrainage général)
- content/contact.json   -> téléphone, email, liens Facebook / HelloAsso du pied de page

Pour activer l'admin :
1. Déployer ce dossier sur Netlify.
2. Dans Netlify : Site settings > Identity > Enable Identity, puis activer Git Gateway.
3. Remplacer site_url et display_url dans admin/config.yml par l'URL réelle du site Netlify.
4. Créer ton compte via Identity, puis te rendre sur /admin pour éditer le contenu.

Pense aussi à remplacer les liens HelloAsso placeholder (https://www.helloasso.com/)
par tes vraies campagnes une fois ton compte association créé.
