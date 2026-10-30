"""Fabrique le logo « ZA » (sans le mot « Mobilités ») et les icônes à partir de l'image fournie.

Usage : python -I make_logo.py <image_source.jpg> <dossier_public>
"""
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

source, public = Path(sys.argv[1]), Path(sys.argv[2])

# Zone du symbole (mesurée sur l'image 2000×2000) : le texte « MOBILITÉS » commence plus bas (y ≥ 1191).
X0, X1, Y0, Y1 = 499, 1585, 505, 1123
PAD = 40  # marge autour du symbole, en pixels de l'image d'origine

img = Image.open(source).convert("RGB")
mark = img.crop((X0 - PAD, Y0 - PAD, X1 + PAD + 1, Y1 + PAD + 1))
a = np.asarray(mark).astype(np.float64)
h, w, _ = a.shape

# --- 1. Détourage : on ne retire que le fond relié aux bords (les traits blancs à l'intérieur du Z restent) ---
near_white = (a > 238).all(axis=2)
outside = np.zeros((h, w), dtype=bool)
queue = deque()
for x in range(w):
    for y in (0, h - 1):
        if near_white[y, x] and not outside[y, x]:
            outside[y, x] = True
            queue.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if near_white[y, x] and not outside[y, x]:
            outside[y, x] = True
            queue.append((y, x))
while queue:
    y, x = queue.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and near_white[ny, nx] and not outside[ny, nx]:
            outside[ny, nx] = True
            queue.append((ny, nx))

# --- 2. Bord adouci : sur une bande de 4 px autour du fond retiré, on estime la transparence et on
#        retire le « liseré blanc » (le pixel de bord est un mélange de couleur et de blanc) ---
band = Image.fromarray((outside * 255).astype(np.uint8))
dilated = np.asarray(band.filter(__import__("PIL.ImageFilter", fromlist=["MaxFilter"]).MaxFilter(9))) > 0
edge = dilated & ~outside
alpha = np.where(outside, 0.0, 1.0)
# Plus un pixel de bord est proche du blanc, plus il est transparent.
dist = (255.0 - a).max(axis=2)  # 0 = blanc pur, 255 = très foncé/saturé
edge_alpha = np.clip(dist / 110.0, 0.0, 1.0)
alpha = np.where(edge, edge_alpha, alpha)
rgb = a.copy()
safe = np.maximum(alpha, 1e-3)[..., None]
decontaminated = (a - (1 - alpha)[..., None] * 255.0) / safe
rgb = np.where(edge[..., None], np.clip(decontaminated, 0, 255), a)

rgba = np.dstack([rgb, alpha * 255.0]).astype(np.uint8)
full = Image.fromarray(rgba, "RGBA")
print("symbole détouré :", full.size)

# --- 3. Logo pour l'en-tête (affiché vers 70 px de large) : 400 px suffisent, même sur écrans 3× ---
logo_w = 400
logo = full.resize((logo_w, round(full.height * logo_w / full.width)), Image.LANCZOS)
logo.save(public / "logo-za.png", optimize=True)
print("logo-za.png :", logo.size, f"{(public / 'logo-za.png').stat().st_size // 1024} Ko")


def on_square(side: int, margin: float, background=None) -> Image.Image:
    """Symbole centré dans un carré de `side` px, avec une marge relative ; fond transparent ou uni."""
    inner = round(side * (1 - 2 * margin))
    scaled = full.resize((inner, round(full.height * inner / full.width)), Image.LANCZOS)
    canvas = Image.new("RGBA", (side, side), background or (0, 0, 0, 0))
    canvas.alpha_composite(scaled, ((side - scaled.width) // 2, (side - scaled.height) // 2))
    return canvas


# --- 4. Icônes ---
# favicon.ico : 16, 32 et 48 px, marge minimale (à 16 px, chaque pixel compte)
big = on_square(256, 0.03)
big.save(public / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
# icône générique 192 px (onglets haute densité, Android)
on_square(192, 0.05).save(public / "icon-192.png", optimize=True)
# icône iOS : 180 px, fond blanc opaque (iOS n'aime pas la transparence)
on_square(180, 0.10, (255, 255, 255, 255)).convert("RGB").save(public / "apple-touch-icon.png", optimize=True)
for name in ("favicon.ico", "icon-192.png", "apple-touch-icon.png"):
    print(name, f"{(public / name).stat().st_size // 1024} Ko")
