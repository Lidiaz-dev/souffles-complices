"""Prépare une photo pour le site.

Usage :
    python outils/preparer-photos.py "C:/chemin/vers/photo.jpg" nom-de-la-photo

Crée deux fichiers dans le dossier du site :
  photos/nom-de-la-photo.jpg              photo complète (1400 px maximum), affichée en grand
  photos/vignettes/nom-de-la-photo.jpg    version réduite (petit côté 560 px), affichée dans les bulles

Dans content/animaux.json, on référence toujours la photo complète :
  "photo": "/photos/nom-de-la-photo.jpg"
Le site utilise tout seul la vignette quand elle existe.

Nécessite Pillow : pip install pillow
"""
import os
import re
import sys
import unicodedata

from PIL import Image, ImageOps

DOSSIER_SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAILLE_MAX = 1400      # plus grand côté de la photo complète
PETIT_COTE_MIN = 560   # petit côté de la vignette


def nom_propre(nom):
    """minuscules, sans accents ni espaces : 'Été Killerine' -> 'ete-killerine'"""
    nom = unicodedata.normalize("NFD", nom).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", nom.lower()).strip("-")


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    source, nom = sys.argv[1], nom_propre(sys.argv[2])
    if not nom:
        sys.exit("Nom de photo invalide.")

    # exif_transpose remet la photo à l'endroit ; l'enregistrement sans EXIF retire aussi la localisation GPS.
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")

    complete = image.copy()
    complete.thumbnail((TAILLE_MAX, TAILLE_MAX), Image.LANCZOS)
    os.makedirs(os.path.join(DOSSIER_SITE, "photos", "vignettes"), exist_ok=True)
    chemin_complete = os.path.join(DOSSIER_SITE, "photos", nom + ".jpg")
    complete.save(chemin_complete, "JPEG", quality=85, optimize=True, progressive=True)

    vignette = complete
    ratio = PETIT_COTE_MIN / min(complete.size)
    if ratio < 1:
        vignette = complete.resize((round(complete.width * ratio), round(complete.height * ratio)), Image.LANCZOS)
    chemin_vignette = os.path.join(DOSSIER_SITE, "photos", "vignettes", nom + ".jpg")
    vignette.save(chemin_vignette, "JPEG", quality=88, optimize=True, progressive=True)

    print(f"Photo complète : {chemin_complete} ({complete.width}x{complete.height}, {os.path.getsize(chemin_complete) // 1024} Ko)")
    print(f"Vignette       : {chemin_vignette} ({vignette.width}x{vignette.height}, {os.path.getsize(chemin_vignette) // 1024} Ko)")
    print(f'\nÀ mettre dans content/animaux.json :  "photo": "/photos/{nom}.jpg"')


if __name__ == "__main__":
    main()
