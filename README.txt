SOUFFLES COMPLICES - site vitrine (HTML / CSS / JavaScript, sans outil de compilation)

=== Structure ===

index.html          Accueil
association.html    L'association (présentation + bloc Contact en bas de page)
equicie.html        Équicie (principe de la médiation par le cheval, renvoie vers le contact)
animaux.html        Liste des animaux (filtre par espèce, encart "Les gardiennes")
animal.html         Fiche d'un animal (animal.html?id=0001)
soutenir.html       Nous soutenir (don, parrainage, adhésion)
style.css           Tous les styles
js/site.js          Fonctions partagées (menu, pied de page, liens, etc.)
content/*.json      TOUS LES TEXTES MODIFIABLES (voir ci-dessous)
photos/             Photos des animaux ; photos/vignettes/ = versions réduites
assets/logo.jpg     Logo
outils/             Outils pour les photos (voir plus bas)

=== Modifier le contenu : fichiers content/*.json ===

Les pages lisent ces fichiers : modifier un fichier suffit, pas besoin de toucher au HTML.
Attention à la syntaxe JSON : guillemets doubles, virgule entre deux éléments, pas de virgule
après le dernier. En cas de doute, coller le fichier dans un validateur JSON.

content/animaux.json   -> un bloc { ... } par animal (voir "Ajouter un animal")
content/asso.json      -> "intro" (liste de paragraphes) et "actions" (liste)
content/adhesion.json  -> cotisation, période, étapes, avantages, précisions (facultatif), bouton, lien
content/soutien.json   -> tuiles don / parrainage / adhésion (titre, texte, bouton, lien, photo)
content/contact.json   -> téléphone, email, facebook, adresse (facultatif), lien HelloAsso par défaut
                          ("helloasso") et lien HelloAsso dédié au parrainage ("helloasso_parrainage",
                          utilisé par défaut sur les boutons « Parrainer » des animaux sans lien propre)
content/accueil.json   -> images des cartes « L'association » et « Nous soutenir » de l'accueil
                          ("image": "photos/x.jpg", "image_position": "50% 50%") ; la carte « Les animaux »
                          affiche au hasard la photo d'un animal
content/equicie.json   -> page Équicie : soustitre, intro, bienfaits, public, tarifs (liste de
                          { libelle, prix }), tarifs_note, cta_intro, cta_bouton

Lien HelloAsso par défaut : champ "helloasso" de content/contact.json. Il est utilisé partout
(don, adhésion, parrainage, bouton fixe) dès qu'un lien précis est vide ou invalide.
Un lien précis se met dans le champ "lien" (ou "lien_parrainage" pour un animal).

Téléphone : écrire "06 20 35 14 31" ; le site en fait les liens "Appeler" et "SMS" tout seul.

=== Ajouter un animal ===

Dans content/animaux.json, copier un bloc existant à la suite des autres et modifier :

  "numero"           unique (ex : "0010") ; il sert d'adresse à la fiche (animal.html?id=0010)
  "nom", "espece"    textes affichés ("espece" est libre : Cheval, Chienne...)
  "type"             sert au filtre : cheval, poney, ane, mouton, poule, canard, chien
                     (un nouveau type demande d'ajouter une ligne dans animaux.html : TYPE_LABEL,
                     et dans js/site.js : EMOJI_TYPE)
  "naissance"        "1998" ou "1998-06-24" ou "24/06/1998" (ou vide) ; seul l'âge est affiché
  "statut"           resident, soins, parrainable ou gardienne (étiquette sur la carte)
  "resume"           court texte de la carte
  "histoire"         texte de la fiche (ligne vide = nouveau paragraphe) ; vide = le résumé est repris
  "photo"            "photos/nom.jpg" (voir Photos) ; vide = "Photo à venir"
  "photo_position"   cadrage dans la bulle, ex : "30% 50%" (voir outils/cadrage.html) ; vide = centré
  "galerie"          liste de { "image": "photos/x.jpg", "legende": "..." } (polaroïds de la fiche)
  "lien_parrainage"  lien HelloAsso propre à l'animal (vide = lien par défaut)
  "sans_parrainage"  true pour ne pas proposer le parrainage (cas des gardiennes)
  "arrivee", "caractere"  facultatifs, affichés sur la fiche

Les animaux de type "chien" n'apparaissent pas dans "Tous" : ils ont leur encart "Les gardiennes"
en bas de la page animaux et le filtre "Chiens".

=== Photos ===

1. Préparer la photo (réduction + vignette + suppression des données cachées comme la localisation) :
       python outils/preparer-photos.py "C:/chemin/photo.jpg" nom-de-la-photo
   (nécessite Pillow : pip install pillow). Crée photos/nom-de-la-photo.jpg et
   photos/vignettes/nom-de-la-photo.jpg.
2. Dans content/animaux.json : "photo": "photos/nom-de-la-photo.jpg"
   (toujours la photo complète : le site prend seul la vignette quand elle existe).
3. Cadrage dans la bulle : ouvrir outils/cadrage.html (voir plus bas), copier le résultat
   dans "photo_position".

Ne publier que des photos sans personne reconnaissable, sauf accord des personnes concernées.

=== Outil de cadrage : outils/cadrage.html ===

Ouvert via le serveur local : http://localhost:8123/outils/cadrage.html
Détecte l'animal sur une photo (TensorFlow.js, connexion internet nécessaire), propose le meilleur
cadrage dans la bulle et permet de l'ajuster en cliquant. Copier le cadrage affiché (ex : 34% 50%).

=== Tester le site en local ===

Dans un terminal, dans le dossier du site :
       python -m http.server 8123
puis ouvrir http://localhost:8123
(Ouvrir index.html par double-clic ne fonctionne pas : le site charge ses contenus en JSON.)

=== Publier ===

Site statique : aucun outil de compilation. Il suffit de publier le contenu du dossier chez
n'importe quel hébergeur de sites statiques (Netlify, GitHub Pages, Cloudflare Pages...).
Avec GitHub :  git add .  ;  git commit -m "..."  ;  git push
Les chemins des photos commencent par "/" (ex : photos/x.jpg) : le site doit donc être publié à la
racine d'un domaine, pas dans un sous-dossier d'adresse.
