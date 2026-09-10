# -*- coding: utf-8 -*-
"""Converte os PSDs de token nos assets webp usados pela aba Token.

Cada PSD traz as camadas Plano de Fundo (oculta), Sombra, Janela, ARTE AQUI
(placeholder) e BORDA/ARO. A arte do usuario entra no lugar do placeholder,
recortada pela Janela, entao cada moldura vira duas imagens:

    <id>-mascara.webp  alpha da Janela, recorta a arte e o fundo escolhido
    <id>-moldura.webp  todo o resto, desenhado por cima da arte

Dentro da Janela a moldura guarda so o que cobre a arte (a parte interna da
borda e a sombra interna); fora dela guarda o quadro inteiro ja achatado, que
e onde a arte nunca chega. O placeholder "ARTE DO PERSONAGEM AQUI" fica de
fora porque a sombra interna so alcanca uma faixa junto da borda da Janela.

A referencia e o composite que o proprio Photoshop gravou no PSD, porque o
psd-tools nao renderiza layer effects (InnerShadow da Janela, InnerGlow e Bevel
da Sombra do 6q). Dentro da Janela o preenchimento e um cinza solido conhecido,
o que permite isolar por aritmetica o que esta desenhado por cima dele.

    pip install "psd-tools[composite]"
    python scripts/gerar-frames-token.py "C:/caminho/dos/psds"
"""
import os
import sys
import unicodedata

import numpy as np
from PIL import Image
from psd_tools import PSDImage
from scipy import ndimage

SOMBRA, JANELA, BORDA = 'Sombra', 'Janela', ('BORDA', 'ARO')
FILL_JANELA = 142.0  # cinza solido da Janela, identico nos seis PSDs

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'assets', 'tokens')


def identificar(caminho):
    """'Token - Ameaça 3q (Enorme).psd' -> 'ameaca-3q'."""
    nome = os.path.splitext(os.path.basename(caminho))[0]
    nome = unicodedata.normalize('NFKD', nome).encode('ascii', 'ignore').decode().lower()
    categoria = 'pj' if 'pj' in nome.split() else 'ameaca'
    for quadrados in ('1q', '2q', '3q', '4q', '5q', '6q'):
        if quadrados in nome:
            return f'{categoria}-{quadrados}'
    return None


def render(psd, visiveis):
    for camada in psd.descendants():
        camada.visible = camada.name in visiveis
    return np.asarray(psd.composite().convert('RGBA'), dtype=np.float64)


def sobre_branco(dados):
    alpha = dados[..., 3:4] / 255.0
    return dados[..., :3] * alpha + 255.0 * (1.0 - alpha)


def premultiplicar(dados):
    return np.concatenate([dados[..., :3] * dados[..., 3:4] / 255.0, dados[..., 3:4]], axis=2)


def desmultiplicar(dados):
    alpha = dados[..., 3:4] / 255.0
    rgb = np.divide(dados[..., :3], alpha, out=np.zeros_like(dados[..., :3]), where=alpha > 0)
    return np.concatenate([rgb, dados[..., 3:4]], axis=2)


def sobre(frente, fundo):
    a = frente[..., 3:4] / 255.0
    rgb = frente[..., :3] * a + fundo[..., :3] * (fundo[..., 3:4] / 255.0) * (1 - a)
    alpha = frente[..., 3:4] + fundo[..., 3:4] * (1 - a)
    return desmultiplicar(np.concatenate([rgb, alpha], axis=2))


def para_imagem(dados):
    return Image.fromarray(np.round(np.clip(dados, 0, 255)).astype(np.uint8), 'RGBA')


def alcance_da_sombra_interna(psd):
    """Ate onde, em pixels, o efeito da Janela consegue entrar forma adentro."""
    janela = next(c for c in psd.descendants() if c.name == JANELA)
    limites = [getattr(e, 'distance', 0.0) + getattr(e, 'size', 0.0)
               for e in janela.effects if type(e).__name__ == 'InnerShadow' and e.enabled]
    return max(limites, default=0.0) + 2.0


def faixa_da_borda(mascara, alcance):
    """Onde a sombra interna pode existir: o miolo da Janela e so a arte."""
    return ndimage.distance_transform_edt(mascara > 0) <= alcance


def cobertura_da_arte(preview, borda, faixa):
    """Isola o que o Photoshop desenhou por cima do preenchimento da Janela.

    Dentro da Janela o preview vale `borda SOBRE (sombraInterna SOBRE cinza)`.
    A borda nao tem efeito e sai limpa do psd-tools, entao o unico desconhecido
    e o alpha da sombra interna, que e preta:

        alphaInterna = 1 - (preview - bordaPremultiplicada) / ((1 - alphaBorda) * cinza)

    Valores negativos sao pixels mais claros que o cinza, ou seja o texto branco
    do placeholder: viram zero e o placeholder some sozinho.
    """
    borda_rgb, borda_a = borda[..., :3], borda[..., 3:4] / 255.0
    visivel = 1.0 - borda_a
    sob_borda = np.divide(sobre_branco(preview) - borda_rgb * borda_a, visivel * FILL_JANELA,
                          out=np.ones_like(borda_rgb), where=visivel > 0.02)
    interna_a = np.clip(1.0 - sob_borda.min(axis=2, keepdims=True), 0.0, 1.0) * faixa[..., None]

    interna = np.concatenate([np.zeros_like(borda_rgb), interna_a * 255.0], axis=2)
    return sobre(borda, interna)


def montar_moldura(preview, borda, mascara, faixa):
    """Funde as duas leituras da moldura: fora da Janela o quadro achatado,
    dentro dela so a parte que cobre a arte. A transicao acontece no anel
    antialiasado da Janela, que em todos os PSDs cai sob a borda opaca."""
    peso = (mascara / 255.0)[..., None]
    coberto = premultiplicar(cobertura_da_arte(preview, borda, faixa))
    fundido = premultiplicar(preview) * (1 - peso) + coberto * peso
    return para_imagem(desmultiplicar(fundido))


def converter(psd_path, destino):
    token_id = identificar(psd_path)
    if not token_id:
        return None, 'sem tamanho reconhecivel no nome'

    psd = PSDImage.open(psd_path)
    # tem que vir antes de qualquer render(): mexer na visibilidade das camadas
    # faz o psd-tools recompor na mao e perder os efeitos
    preview = np.asarray(psd.composite().convert('RGBA'), dtype=np.float64)
    nomes = {c.name for c in psd.descendants()}
    bordas = nomes.intersection(BORDA)
    if not bordas or SOMBRA not in nomes or JANELA not in nomes:
        return None, f'camadas inesperadas: {sorted(nomes)}'

    mascara = render(psd, {JANELA})[..., 3]
    faixa = faixa_da_borda(mascara, alcance_da_sombra_interna(psd))
    moldura = montar_moldura(preview, render(psd, bordas), mascara, faixa)

    recorte = Image.new('RGBA', moldura.size, (255, 255, 255, 0))
    recorte.putalpha(Image.fromarray(mascara.astype(np.uint8), 'L'))

    erro = validar(preview, np.asarray(moldura, dtype=np.float64), mascara, faixa)
    total = 0
    for sufixo, img in (('mascara', recorte), ('moldura', moldura)):
        caminho = os.path.join(destino, f'{token_id}-{sufixo}.webp')
        img.save(caminho, 'WEBP', lossless=True, method=6)
        total += os.path.getsize(caminho)

    return token_id, f'{psd.width}x{psd.height}  {total / 1024:6.1f} KB  {erro}'


def validar(preview, moldura, mascara, faixa):
    """Remonta o token com o cinza original no lugar da arte e compara com o
    preview. O placeholder e tudo que aparece no miolo da Janela, fora do
    alcance da sombra interna: e justamente o que o processo joga fora."""
    placa = np.concatenate([np.full(preview[..., :3].shape, FILL_JANELA), mascara[..., None]], axis=2)
    erro = np.abs(sobre_branco(preview) - sobre_branco(sobre(moldura, placa))).max(axis=2)

    miolo = (mascara > 0) & ~faixa
    placeholder = miolo & (np.abs(preview[..., :3] - FILL_JANELA).max(axis=2) > 2)
    return f'erro max {int(erro[~placeholder].max())}/255, {int(placeholder.sum())} px de placeholder'


def main():
    try:
        import aggdraw  # noqa: F401  rasteriza a forma vetorial da Janela
    except ImportError:
        sys.exit('faltam os extras: pip install "psd-tools[composite]"')

    origem = sys.argv[1] if len(sys.argv) > 1 else '.'
    destino = os.path.abspath(SAIDA)
    os.makedirs(destino, exist_ok=True)

    psds = sorted(f for f in os.listdir(origem) if f.lower().endswith('.psd'))
    if not psds:
        sys.exit(f'nenhum .psd encontrado em {origem}')

    print(f'lendo {len(psds)} psd(s) de {origem}\ngravando em {destino}\n')
    gerados = set()
    for arquivo in psds:
        token_id, detalhe = converter(os.path.join(origem, arquivo), destino)
        print(f'  {token_id or "--":10} {detalhe:56} <- {arquivo}')
        gerados.add(token_id)
    gerados.discard(None)
    print(f'\n{len(gerados)} frame(s): {", ".join(sorted(gerados))}')


if __name__ == '__main__':
    main()
