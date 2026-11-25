"""Normaliza as fotos do cardápio: recorte quadrado com o produto inteiro, tamanho padrão, WebP."""
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import numpy as np

# Uso (na raiz do projeto):  python3 scripts/process_images.py
ROOT = Path(__file__).resolve().parent.parent
P = ROOT / 'source-images' / 'menudino'    # fotos originais da MenuDino (nome = id do produto)
UP = ROOT / 'source-images' / 'cliente'    # fotos enviadas pela loja
OUT = ROOT / 'public' / 'images'
MAX = 720

def menudino(id_): return P / f'{id_}.webp'

def save(im, name, q=82):
    if im.width > MAX: im = im.resize((MAX, MAX), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
    im.save(OUT / 'products' / f'{name}.webp', 'WEBP', quality=q, method=6)
    print(name, im.size)

def square(src, cx=0.5, cy=0.5, scale=1.0):
    """Recorte quadrado centrado em (cx, cy); scale<1 aproxima."""
    im = Image.open(src).convert('RGB')
    s = int(min(im.size) * scale)
    x = int(round(cx * im.width - s / 2)); y = int(round(cy * im.height - s / 2))
    x = max(0, min(im.width - s, x)); y = max(0, min(im.height - s, y))
    return im.crop((x, y, x + s, y + s))

def extend_square(crop):
    """Completa um recorte paisagem até virar quadrado, com fundo desfocado do próprio recorte."""
    w, h = crop.size
    s = w
    bg = crop.resize((s, s), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
    bg = ImageEnhance.Brightness(bg).enhance(0.35)
    canvas = bg.copy()
    y = (s - h) // 2
    # máscara com bordas suaves em cima e embaixo
    mask = Image.new('L', (w, h), 255)
    m = np.array(mask).astype(float)
    feather = int(h * 0.12)
    for i in range(feather):
        a = (i + 1) / feather
        m[i, :] *= a; m[h - 1 - i, :] *= a
    canvas.paste(crop, (0, y), Image.fromarray(m.astype('uint8')))
    return canvas

def packshot(src, fill=0.86, bg=(255, 255, 255)):
    """Produto em fundo branco: apara o branco e centraliza num quadrado padrão."""
    im = Image.open(src).convert('RGB')
    a = np.array(im).astype(int)
    nonwhite = (a < 235).any(axis=2)
    ys, xs = np.where(nonwhite)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    prod = im.crop(box)
    S = 900
    target_h = int(S * fill)
    r = target_h / prod.height
    if prod.width * r > S * 0.8: r = S * 0.8 / prod.width
    prod = prod.resize((int(prod.width * r), int(prod.height * r)), Image.LANCZOS)
    canvas = Image.new('RGB', (S, S), bg)
    canvas.paste(prod, ((S - prod.width) // 2, (S - prod.height) // 2))
    return canvas

# ---- Hambúrgueres (fotos da MenuDino) ----
save(square(menudino('1b862943-df68-4044-821a-8dfdf7f3e0d4'), cy=0.50), 'sertaozinho')
save(square(menudino('bd667465-1265-4f00-ab09-c48464abca49'), cy=0.56), 'emporio-burguer')
save(square(menudino('cc921d07-f616-4778-90ed-309cb9bbd65e'), cy=0.55), 'esfomeado')
save(square(menudino('99da5903-8db8-4c7d-b3a4-bcf7b394f2e4'), cy=0.56), 'pepper-burguer')
save(square(menudino('4d9d3f54-0e86-445b-83f5-1c479ea3a319'), cy=0.60), 'cheddar-nordestino')
save(square(menudino('c2c63257-1b86-48fc-9943-8299fd47b653'), cy=0.62), 'cheese-mexicano')
save(square(menudino('d7aab4b5-1365-4d17-8317-5237064ff37b'), cy=0.62), 'hot-bacon')
save(square(menudino('6b10785c-3df9-455d-9c30-90434256c2bb'), cy=0.62), 'onion-bacon')
save(square(menudino('1ac23fea-1abd-4993-89a1-3f7695d63c3f'), cy=0.62), 'smoke-burguer')
save(square(menudino('473c7eaf-5c46-43f3-9d61-191ed09bea3f'), cy=0.5), 'smash-turbo')
save(square(menudino('074947bc-e937-4734-8661-1110775282f2'), cy=0.5), 'super-smash')
save(square(menudino('c7650ebf-85ca-41e4-8316-2baf5fa98cfc'), cy=0.55), 'smash-triplo')

# ---- Arte enviada pelo cliente: Duplo Mexicano (metade de cima) e Smash Cheddar (metade de baixo) ----
banner = Image.open(UP / 'duplo-mexicano-e-smash-cheddar-limpo.webp').convert('RGB')  # arte da loja, sem os riscos decorativos
save(extend_square(banner.crop((20, 40, 790, 470))), 'duplo-mexicano')
save(extend_square(banner.crop((20, 530, 760, 1000))), 'smash-cheddar')
# versão grande para o topo do site
hero = banner.crop((0, 512, 790, 1024))
hero.save(OUT / 'brand' / 'hero-smash-cheddar.webp', 'WEBP', quality=86, method=6)
print('hero', hero.size)

# ---- Batatas e porções ----
save(square(menudino('9ec86ee8-662c-4f09-917f-0a991e8c8a13'), cy=0.6), 'batata-simples')
save(square(menudino('9ec86ee8-662c-4f09-917f-0a991e8c8a13'), cx=0.45, cy=0.55, scale=0.72), 'batata-p')
save(square(menudino('23f9e894-f656-43d6-bcf5-81a61bc0c78e'), cy=0.6), 'batata-com-cheddar')
save(square(menudino('6cdeecf8-0bf8-40d8-b338-ffc747bf46e9'), cy=0.6), 'batata-com-cheddar-e-bacon')
save(square(menudino('ca4c592f-fb59-45d2-a535-a2401c99d88f'), cy=0.5), 'batata-com-cream-cheese-e-carne-de-sol')
save(square(menudino('bdaad93d-d38d-4d00-9f86-8d5c14add3af'), cy=0.5), 'porcao-de-onion-rings')
fries = Image.open(UP / 'batata-com-cheddar-e-calabresa.jpg').convert('RGB')
save(fries.crop((40, 175, 680, 815)), 'batata-com-cheddar-e-calabresa')
save(square(UP / 'batata-com-bacon.jpg', cy=0.42), 'batata-com-bacon')

# ---- Bebidas ----
save(packshot(UP / 'sprite-600ml.jpg'), 'sprite-600ml')
save(packshot(UP / 'agua-com-gas.jpg'), 'agua-com-gas')
save(packshot(UP / 'fanta-laranja-350ml.jpg'), 'fanta-laranja-350ml')
save(packshot(menudino('fc640654-f49d-4963-9b7c-1d5709d7c89e')), 'fanta-uva-350ml')
save(packshot(menudino('05d81fa7-df1b-40c5-9bd3-6e45c98b619d'), fill=0.78), 'guarana-zero-350ml')
save(square(menudino('116295ac-f3bf-4f46-8901-266f942ca0d8')), 'cajuina')

# ---- Marca ----
logo = Image.open(P / 'logo.webp').convert('RGB')
a = np.array(logo).astype(float)
alpha = a.max(axis=2)
alpha = np.clip((alpha - 12) / (255 - 12), 0, 1)
rgb = np.where(alpha[..., None] > 0, np.clip(a / np.maximum(alpha[..., None], 1e-3), 0, 255), 0)
rgba = np.dstack([rgb, alpha * 255]).astype('uint8')
lt = Image.fromarray(rgba, 'RGBA').crop((228, 52, 471, 347))
lt.save(OUT / 'brand' / 'logo.png', optimize=True); lt.save(OUT / 'brand' / 'logo.webp', 'WEBP', quality=92)
print('logo', lt.size)
fav = logo.crop((199, 50, 499, 350))
for s in (32, 180, 192, 512):
    fav.resize((s, s), Image.LANCZOS).save(OUT / 'brand' / f'icon-{s}.png', optimize=True)
og = Image.new('RGB', (1200, 630), (14, 11, 9))
hb = hero.copy(); hb.thumbnail((760, 630)); og.paste(hb, (440, (630 - hb.height) // 2))
lg = lt.copy(); lg.thumbnail((340, 420)); og.paste(lg, (70, (630 - lg.height) // 2), lg)
og.save(OUT / 'brand' / 'og-image.jpg', quality=85)
print('done')
