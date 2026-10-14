"""
Gera versões enxutas da Newsreader para o site, em src/assets/fonts/.

- Peso limitado a 200–400 (os únicos usados) e tamanho óptico a 12–72:
  cerca de 1/3 menor que o arquivo original.
- Mantém o eixo de tamanho óptico: o navegador continua ajustando o desenho
  ao tamanho do texto (mais fino e contrastado nos títulos grandes).

Requer: pip install fonttools brotli
Uso (na raiz do projeto): python scripts/subset-fonts.py
"""

from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = Path("node_modules/@fontsource-variable/newsreader/files")
OUT = Path("src/assets/fonts")

# Latim básico + Latim-1 (acentos do português) + pontuação tipográfica
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,"
    "U+2013-2014,U+2018-201E,U+2022,U+2026,U+2039-203A,U+20AC,U+2122"
)
FEATURES = ["kern", "liga", "rvrn", "tnum", "pnum", "ccmp", "locl", "mark", "mkmk"]
AXES = {"wght": (200, 400), "opsz": (12, 72)}

OUT.mkdir(parents=True, exist_ok=True)

for style in ("normal", "italic"):
    source = SRC / f"newsreader-latin-opsz-{style}.woff2"
    font = instancer.instantiateVariableFont(TTFont(source), AXES)

    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = FEATURES
    options.name_IDs = ["*"]
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)

    target = OUT / f"newsreader-{style}.woff2"
    font.flavor = "woff2"
    font.save(target)
    print(f"{target}  {source.stat().st_size // 1024} KB -> {target.stat().st_size // 1024} KB")
