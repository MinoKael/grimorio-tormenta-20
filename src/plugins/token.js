const arquivos = import.meta.glob('../assets/tokens/*.webp', { eager: true, query: '?url', import: 'default' });

const CATEGORIAS = {
    ameaca: { nome: 'Ameaça', ordem: 1 },
    pj: { nome: 'Personagem', ordem: 2 },
};

const TAMANHOS = {
    '1q': { nome: 'Médio ou menor', quadrados: 1 },
    '2q': { nome: 'Grande', quadrados: 2 },
    '3q': { nome: 'Enorme', quadrados: 3 },
    '6q': { nome: 'Colossal', quadrados: 6 },
};

export const FORMATOS = [
    { titulo: 'PNG', valor: 'png', tipo: 'image/png' },
    { titulo: 'WebP', valor: 'webp', tipo: 'image/webp' },
];

export const RESOLUCOES = [70, 100, 140, 200, 300];

export const AJUSTE_PADRAO = { escala: 1, x: 0, y: 0, rotacao: 0, espelhado: false };

// o mesmo alcance vale para a roda do mouse, a pinca e o slider
export const ZOOM_MINIMO = 0.1;
export const ZOOM_MAXIMO = 8;

/** Lê os assets gerados por scripts/gerar-frames-token.py e monta o catálogo. */
function catalogar() {
    const molduras = new Map();

    for (const [caminho, url] of Object.entries(arquivos)) {
        const partes = caminho.match(/\/(\w+)-(\dq)-(mascara|moldura)\.webp$/);
        if (!partes) continue;

        const [, categoria, tamanho, peca] = partes;
        if (!CATEGORIAS[categoria] || !TAMANHOS[tamanho]) continue;

        const id = `${categoria}-${tamanho}`;
        const moldura = molduras.get(id) || {
            id,
            categoria,
            tamanho,
            ...TAMANHOS[tamanho],
            rotulo: `${CATEGORIAS[categoria].nome} · ${TAMANHOS[tamanho].nome}`,
            pecas: {},
        };
        moldura.pecas[peca] = url;
        molduras.set(id, moldura);
    }

    return [...molduras.values()]
        .filter((moldura) => moldura.pecas.mascara && moldura.pecas.moldura)
        .sort((a, b) => CATEGORIAS[a.categoria].ordem - CATEGORIAS[b.categoria].ordem || a.quadrados - b.quadrados);
}

export const MOLDURAS = catalogar();

export const TAMANHOS_LISTA = Object.entries(TAMANHOS).map(([id, tamanho]) => ({ id, ...tamanho }));

export function moldurasDe(categoria) {
    return MOLDURAS.filter((moldura) => moldura.categoria === categoria);
}

export const CATEGORIAS_DISPONIVEIS = Object.entries(CATEGORIAS)
    .filter(([id]) => MOLDURAS.some((moldura) => moldura.categoria === id))
    .map(([id, categoria]) => ({ valor: id, titulo: categoria.nome }));

export function carregarImagem(url) {
    return new Promise((resolver, rejeitar) => {
        const imagem = new Image();
        imagem.onload = () => resolver(imagem);
        imagem.onerror = () => rejeitar(new Error(`Não foi possível carregar ${url}`));
        imagem.src = url;
    });
}

const carregadas = new Map();

/** Baixa (uma vez só) as duas peças de uma moldura e devolve as imagens prontas. */
export function carregarMoldura(id) {
    if (!carregadas.has(id)) {
        const moldura = MOLDURAS.find((item) => item.id === id);
        if (!moldura) return Promise.reject(new Error(`Moldura desconhecida: ${id}`));

        carregadas.set(
            id,
            Promise.all([carregarImagem(moldura.pecas.mascara), carregarImagem(moldura.pecas.moldura)])
                .then(([mascara, quadro]) => ({ ...moldura, mascara, quadro, lado: quadro.naturalWidth }))
                .catch((erro) => {
                    carregadas.delete(id);
                    throw erro;
                })
        );
    }
    return carregadas.get(id);
}

/** Escala em que a arte cobre o token inteiro: a referencia do zoom 1x. */
function escalaBase(arte, lado) {
    return Math.max(lado / arte.naturalWidth, lado / arte.naturalHeight);
}

/** Escala relativa em que a arte cabe inteira dentro do token. */
export function escalaParaCaber(arte) {
    return Math.min(arte.naturalWidth, arte.naturalHeight) / Math.max(arte.naturalWidth, arte.naturalHeight);
}

function prepararContexto(canvas) {
    const contexto = canvas.getContext('2d');
    contexto.setTransform(1, 0, 0, 1, 0, 0);
    contexto.globalCompositeOperation = 'source-over';
    contexto.globalAlpha = 1;
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = 'high';
    return contexto;
}

function desenharArte(contexto, arte, ajuste, lado) {
    const escala = escalaBase(arte, lado) * ajuste.escala;
    const largura = arte.naturalWidth * escala;
    const altura = arte.naturalHeight * escala;

    contexto.save();
    contexto.translate(lado / 2 + ajuste.x * lado, lado / 2 + ajuste.y * lado);
    contexto.rotate((ajuste.rotacao * Math.PI) / 180);
    if (ajuste.espelhado) contexto.scale(-1, 1);
    contexto.drawImage(arte, -largura / 2, -altura / 2, largura, altura);
    contexto.restore();
}

function desenharToken(canvas, { moldura, arte, ajuste, fundo }) {
    const lado = canvas.width;
    const contexto = prepararContexto(canvas);

    if (fundo) {
        contexto.fillStyle = fundo;
        contexto.fillRect(0, 0, lado, lado);
    }
    if (arte) desenharArte(contexto, arte, ajuste, lado);

    contexto.globalCompositeOperation = 'destination-in';
    contexto.drawImage(moldura.mascara, 0, 0, lado, lado);
    contexto.globalCompositeOperation = 'source-over';
    contexto.drawImage(moldura.quadro, 0, 0, lado, lado);
}

let rascunho = null;

function obterRascunho(lado) {
    if (!rascunho) rascunho = document.createElement('canvas');
    if (rascunho.width !== lado) {
        rascunho.width = lado;
        rascunho.height = lado;
    }
    return rascunho;
}

/**
 * Desenha o token: a arte recortada pela mascara da janela e a moldura por cima.
 * O canvas precisa ser quadrado e tudo e proporcional ao lado dele, entao o
 * mesmo ajuste serve para a previa pequena e para o arquivo final. Com `guia`,
 * o que sobra fora da janela aparece esmaecido, so para ajudar a enquadrar.
 */
export function renderizarToken(canvas, { moldura, arte, ajuste = AJUSTE_PADRAO, fundo = null, guia = false }) {
    if (!moldura) {
        prepararContexto(canvas);
        return;
    }
    if (!guia || !arte) {
        desenharToken(canvas, { moldura, arte, ajuste, fundo });
        return;
    }

    const lado = canvas.width;
    const contexto = prepararContexto(canvas);
    contexto.globalAlpha = 0.22;
    desenharArte(contexto, arte, ajuste, lado);
    contexto.globalAlpha = 1;

    const auxiliar = obterRascunho(lado);
    desenharToken(auxiliar, { moldura, arte, ajuste, fundo });
    contexto.drawImage(auxiliar, 0, 0);
}

/** Renderiza o token no tamanho final e devolve o arquivo pronto para download. */
export async function gerarArquivo({ moldura, arte, ajuste, fundo, lado, formato, qualidade = 0.92 }) {
    const canvas = document.createElement('canvas');
    canvas.width = lado;
    canvas.height = lado;
    renderizarToken(canvas, { moldura, arte, ajuste, fundo });

    const { tipo } = FORMATOS.find((item) => item.valor === formato) || FORMATOS[0];
    const blob = await new Promise((resolver) => canvas.toBlob(resolver, tipo, qualidade));
    if (!blob) throw new Error(`O navegador nao conseguiu gerar um arquivo ${formato}`);
    return blob;
}

/** Deixa o texto utilizável como nome de arquivo em qualquer sistema. */
export function limparNome(texto, alternativa = 'token') {
    const limpo = (texto || '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/[^A-Za-z0-9 _.-]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^\.+|\.+$/g, '');
    return limpo || alternativa;
}
