<script setup>
import { computed, markRaw, onBeforeUnmount, onMounted, ref, shallowReactive, watch } from 'vue';
import TokenCanvas from '../components/TokenCanvas.vue';
import {
    AJUSTE_PADRAO,
    CATEGORIAS_DISPONIVEIS,
    FORMATOS,
    MOLDURAS,
    RESOLUCOES,
    TAMANHOS_LISTA,
    ZOOM_MAXIMO,
    ZOOM_MINIMO,
    carregarImagem,
    carregarMoldura,
    escalaParaCaber,
    gerarArquivo,
    limparNome,
    moldurasDe,
} from '../plugins/token.js';
import { baixarBlob, criarZip } from '../plugins/zip.js';

const raiz = ref(null);
const entrada = ref(null);

const itens = ref([]);
const selecionadoId = ref(null);
const molduras = shallowReactive({});
const molduraPadraoId = ref(MOLDURAS[0]?.id || null);

const arrastando = ref(false);
const carregando = ref(false);
const gerando = ref(false);
const progresso = ref(0);
const aviso = ref('');
const mostrarAviso = computed({
    get: () => Boolean(aviso.value),
    set: (valor) => {
        if (!valor) aviso.value = '';
    },
});

const fundoTransparente = ref(true);
const corFundo = ref('#151515');
const formato = ref('png');
const qualidade = ref(92);
const resolucao = ref(300);
const modoNome = ref('individual');
const nomeGeral = ref('token');
const guia = ref(true);

let sequencia = 0;

const selecionado = computed(() => itens.value.find((item) => item.id === selecionadoId.value) || null);
const molduraAtual = computed(() => MOLDURAS.find((moldura) => moldura.id === (selecionado.value?.molduraId || molduraPadraoId.value)) || null);
const molduraPronta = computed(() => (molduraAtual.value ? molduras[molduraAtual.value.id] : null));
const fundoAtivo = computed(() => (fundoTransparente.value ? null : corFundo.value));
const ladoFinal = computed(() => resolucao.value * (molduraAtual.value?.quadrados || 1));

const tamanhos = computed(() => TAMANHOS_LISTA.map((tamanho) => ({
    ...tamanho,
    existe: moldurasDe(molduraAtual.value?.categoria).some((moldura) => moldura.tamanho === tamanho.id),
})));

/** Nome final de cada arquivo, já sem repetições. */
const nomes = computed(() => {
    const usados = new Map();
    return itens.value.map((item, indice) => {
        const numerado = itens.value.length > 1 ? `_${String(indice + 1).padStart(2, '0')}` : '';
        const base = modoNome.value === 'geral'
            ? `${limparNome(nomeGeral.value, 'token')}${numerado}`
            : limparNome(item.nome, `token${numerado}`);

        const repeticao = (usados.get(base) || 0) + 1;
        usados.set(base, repeticao);
        return repeticao > 1 ? `${base}_${repeticao}` : base;
    });
});

async function garantirMoldura(id) {
    if (!id || molduras[id]) return;
    try {
        molduras[id] = markRaw(await carregarMoldura(id));
    } catch {
        aviso.value = 'Não foi possível carregar a moldura.';
    }
}

async function adicionarArquivos(lista) {
    const imagens = [...lista].filter((arquivo) => arquivo.type.startsWith('image/'));
    if (!imagens.length) return;

    carregando.value = true;
    for (const arquivo of imagens) {
        const url = URL.createObjectURL(arquivo);
        try {
            const arte = await carregarImagem(url);
            itens.value.push({
                id: ++sequencia,
                nome: arquivo.name.replace(/\.[^.]+$/, ''),
                url,
                arte: markRaw(arte),
                molduraId: molduraPadraoId.value,
                ajuste: { ...AJUSTE_PADRAO },
            });
        } catch {
            URL.revokeObjectURL(url);
            aviso.value = `Não foi possível ler ${arquivo.name}.`;
        }
    }
    carregando.value = false;
    if (!selecionado.value) selecionadoId.value = itens.value.at(-1)?.id || null;
}

function aoEscolher(evento) {
    adicionarArquivos(evento.target.files);
    evento.target.value = '';
}

function aoSoltarArquivos(evento) {
    arrastando.value = false;
    adicionarArquivos(evento.dataTransfer.files);
}

/** Ctrl+V só interessa enquanto a aba está visível. */
function aoColar(evento) {
    if (!raiz.value?.$el?.offsetParent) return;
    const arquivos = [...(evento.clipboardData?.files || [])];
    if (arquivos.length) adicionarArquivos(arquivos);
}

function remover(item) {
    URL.revokeObjectURL(item.url);
    itens.value = itens.value.filter((outro) => outro.id !== item.id);
    if (selecionadoId.value === item.id) selecionadoId.value = itens.value[0]?.id || null;
}

function limparFila() {
    itens.value.forEach((item) => URL.revokeObjectURL(item.url));
    itens.value = [];
    selecionadoId.value = null;
}

function ajustar(mudanca) {
    if (selecionado.value) selecionado.value.ajuste = { ...selecionado.value.ajuste, ...mudanca };
}

function enquadrar(modo) {
    if (!selecionado.value) return;
    const escala = modo === 'caber' ? escalaParaCaber(selecionado.value.arte) : 1;
    ajustar({ escala, x: 0, y: 0 });
}

function definirMoldura({ categoria, tamanho }) {
    const alvo = moldurasDe(categoria);
    const escolhida = alvo.find((moldura) => moldura.tamanho === tamanho) || alvo.at(-1);
    if (!escolhida) return;

    molduraPadraoId.value = escolhida.id;
    if (selecionado.value) selecionado.value.molduraId = escolhida.id;
}

function replicar(campo) {
    if (!selecionado.value) return;
    const valor = selecionado.value[campo];
    itens.value.forEach((item) => {
        item[campo] = campo === 'ajuste' ? { ...valor } : valor;
    });
    aviso.value = campo === 'ajuste' ? 'Enquadramento aplicado a todos.' : 'Moldura aplicada a todos.';
}

async function opcoesDe(item) {
    await garantirMoldura(item.molduraId);
    const moldura = molduras[item.molduraId];
    if (!moldura) throw new Error('Moldura indisponível.');

    return {
        moldura,
        arte: item.arte,
        ajuste: item.ajuste,
        fundo: fundoAtivo.value,
        lado: resolucao.value * moldura.quadrados,
        formato: formato.value,
        qualidade: qualidade.value / 100,
    };
}

async function baixarSelecionado() {
    if (!selecionado.value) return;
    gerando.value = true;
    try {
        const blob = await gerarArquivo(await opcoesDe(selecionado.value));
        baixarBlob(blob, `${nomes.value[itens.value.indexOf(selecionado.value)]}.${formato.value}`);
    } catch (erro) {
        aviso.value = erro.message;
    } finally {
        gerando.value = false;
    }
}

async function baixarTodos() {
    if (!itens.value.length) return;
    gerando.value = true;
    progresso.value = 0;
    try {
        const arquivos = [];
        for (const [indice, item] of itens.value.entries()) {
            arquivos.push({
                nome: `${nomes.value[indice]}.${formato.value}`,
                blob: await gerarArquivo(await opcoesDe(item)),
            });
            progresso.value = Math.round(((indice + 1) / itens.value.length) * 100);
        }
        baixarBlob(await criarZip(arquivos), `${limparNome(nomeGeral.value, 'tokens')}.zip`);
    } catch (erro) {
        aviso.value = erro.message;
    } finally {
        gerando.value = false;
    }
}

watch(
    () => itens.value.map((item) => item.molduraId),
    (usadas) => new Set(usadas).forEach(garantirMoldura),
    { immediate: true }
);
watch(molduraPadraoId, garantirMoldura, { immediate: true });

onMounted(() => window.addEventListener('paste', aoColar));
onBeforeUnmount(() => {
    window.removeEventListener('paste', aoColar);
    itens.value.forEach((item) => URL.revokeObjectURL(item.url));
});
</script>

<template>
    <v-container ref="raiz" class="py-6">
        <v-row>
            <v-col cols="12" md="3">
                <v-card variant="outlined" class="mb-4">
                    <div class="zona pa-6 text-center" :class="{ 'zona--ativa': arrastando }"
                        @dragover.prevent="arrastando = true" @dragleave="arrastando = false"
                        @drop.prevent="aoSoltarArquivos">
                        <v-icon size="42" color="grey-darken-1">mdi-image-plus</v-icon>
                        <div class="text-body-2 mt-2 text-grey">Arraste as artes aqui ou cole com Ctrl+V</div>
                        <v-btn class="mt-3" variant="tonal" color="tormentaText" prepend-icon="mdi-folder-open"
                            :loading="carregando" @click="entrada.click()">Escolher arquivos</v-btn>
                        <input ref="entrada" type="file" accept="image/*" multiple hidden @change="aoEscolher" />
                    </div>
                </v-card>

                <v-card v-if="itens.length" variant="outlined">
                    <v-toolbar density="compact" color="transparent">
                        <v-toolbar-title class="text-body-2 text-uppercase font-weight-bold">
                            Fila · {{ itens.length }}
                        </v-toolbar-title>
                        <v-btn size="small" variant="text" @click="limparFila">Limpar</v-btn>
                    </v-toolbar>
                    <v-divider />
                    <v-list density="compact" bg-color="transparent" class="py-0 fila">
                        <v-list-item v-for="(item, indice) in itens" :key="item.id"
                            :active="item.id === selecionadoId" @click="selecionadoId = item.id">
                            <template #prepend>
                                <div class="miniatura mr-3">
                                    <TokenCanvas :moldura="molduras[item.molduraId]" :arte="item.arte"
                                        :ajuste="item.ajuste" :fundo="fundoAtivo" :lado="96" />
                                </div>
                            </template>
                            <v-list-item-title class="text-body-2">{{ nomes[indice] }}.{{ formato }}</v-list-item-title>
                            <v-list-item-subtitle class="text-caption">
                                {{ MOLDURAS.find((m) => m.id === item.molduraId)?.rotulo }}
                            </v-list-item-subtitle>
                            <template #append>
                                <v-btn icon="mdi-close" size="x-small" variant="text" @click.stop="remover(item)" />
                            </template>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>

            <v-col cols="12" md="5">
                <v-card variant="outlined" class="pa-4 editor">
                    <TokenCanvas :moldura="molduraPronta" :arte="selecionado?.arte" :fundo="fundoAtivo"
                        :ajuste="selecionado?.ajuste || AJUSTE_PADRAO" :guia="guia" interativo
                        @update:ajuste="ajustar" />

                    <div class="text-caption text-grey text-center mt-2">
                        <template v-if="selecionado">Arraste para mover · role para aproximar</template>
                        <template v-else>Envie uma arte para começar</template>
                    </div>

                    <v-divider class="my-4" />

                    <v-text-field v-if="selecionado && modoNome === 'individual'" v-model="selecionado.nome"
                        label="Nome deste token" density="compact" variant="outlined" hide-details class="mb-4" />

                    <div class="d-flex align-center ga-2 mb-1">
                        <v-icon size="small" color="grey">mdi-magnify-plus-outline</v-icon>
                        <v-slider :model-value="selecionado?.ajuste.escala || 1" :min="ZOOM_MINIMO" :max="ZOOM_MAXIMO" :step="0.01"
                            :disabled="!selecionado" hide-details density="compact" color="tormentaText"
                            @update:model-value="(valor) => ajustar({ escala: valor })" />
                        <span class="text-caption text-grey" style="min-width: 3.5em">
                            {{ Math.round((selecionado?.ajuste.escala || 1) * 100) }}%
                        </span>
                    </div>

                    <div class="d-flex align-center ga-2 mb-3">
                        <v-icon size="small" color="grey">mdi-rotate-right</v-icon>
                        <v-slider :model-value="selecionado?.ajuste.rotacao || 0" :min="-180" :max="180" :step="1"
                            :disabled="!selecionado" hide-details density="compact" color="tormentaText"
                            @update:model-value="(valor) => ajustar({ rotacao: valor })" />
                        <span class="text-caption text-grey" style="min-width: 3.5em">
                            {{ Math.round(selecionado?.ajuste.rotacao || 0) }}°
                        </span>
                    </div>

                    <div class="d-flex flex-wrap ga-2">
                        <v-btn size="small" variant="tonal" :disabled="!selecionado" prepend-icon="mdi-fit-to-screen"
                            @click="enquadrar('caber')">Caber</v-btn>
                        <v-btn size="small" variant="tonal" :disabled="!selecionado" prepend-icon="mdi-crop-free"
                            @click="enquadrar('preencher')">Preencher</v-btn>
                        <v-btn size="small" variant="tonal" :disabled="!selecionado"
                            :color="selecionado?.ajuste.espelhado ? 'tormentaText' : undefined"
                            prepend-icon="mdi-flip-horizontal"
                            @click="ajustar({ espelhado: !selecionado.ajuste.espelhado })">Espelhar</v-btn>
                        <v-btn size="small" variant="tonal" :disabled="!selecionado" prepend-icon="mdi-restore"
                            @click="ajustar({ ...AJUSTE_PADRAO })">Zerar</v-btn>
                        <v-spacer />
                        <v-btn size="small" variant="text" :disabled="itens.length < 2"
                            prepend-icon="mdi-content-duplicate" @click="replicar('ajuste')">Aplicar a todos</v-btn>
                    </div>

                    <v-switch v-model="guia" label="Mostrar a arte fora da janela" density="compact" hide-details
                        color="tormentaText" class="mt-2" />
                </v-card>
            </v-col>

            <v-col cols="12" md="4">
                <v-card variant="outlined" class="pa-4 mb-4">
                    <div class="text-body-2 text-uppercase font-weight-bold mb-3">Moldura</div>

                    <v-btn-toggle :model-value="molduraAtual?.categoria" mandatory divided density="comfortable"
                        variant="outlined" class="mb-3 w-100"
                        @update:model-value="(valor) => valor && definirMoldura({ categoria: valor, tamanho: molduraAtual.tamanho })">
                        <v-btn v-for="categoria in CATEGORIAS_DISPONIVEIS" :key="categoria.valor"
                            :value="categoria.valor" class="flex-grow-1">{{ categoria.titulo }}</v-btn>
                    </v-btn-toggle>

                    <v-btn-toggle :model-value="molduraAtual?.tamanho" mandatory divided density="comfortable"
                        variant="outlined" class="w-100"
                        @update:model-value="(valor) => valor && definirMoldura({ categoria: molduraAtual.categoria, tamanho: valor })">
                        <v-btn v-for="tamanho in tamanhos" :key="tamanho.id" :value="tamanho.id"
                            :disabled="!tamanho.existe" class="flex-grow-1">{{ tamanho.id }}</v-btn>
                    </v-btn-toggle>

                    <div class="text-caption text-grey mt-2">
                        {{ molduraAtual?.rotulo }} · {{ molduraAtual?.quadrados }}x{{ molduraAtual?.quadrados }}
                        quadrados
                    </div>
                    <div class="d-flex">
                        <v-spacer />
                        <v-btn size="small" variant="text" :disabled="itens.length < 2"
                            prepend-icon="mdi-content-duplicate" @click="replicar('molduraId')">Aplicar a todos</v-btn>
                    </div>

                    <v-alert v-if="tamanhos.some((tamanho) => !tamanho.existe)" type="info" variant="tonal"
                        density="compact" class="mt-3 text-caption">
                        Só existe PSD de personagem até Grande; Enorme e Colossal estão disponíveis apenas como ameaça.
                    </v-alert>
                </v-card>

                <v-card variant="outlined" class="pa-4 mb-4">
                    <div class="text-body-2 text-uppercase font-weight-bold mb-3">Fundo da janela</div>
                    <v-switch v-model="fundoTransparente" label="Transparente" density="compact" hide-details
                        color="tormentaText" />
                    <v-expand-transition>
                        <v-color-picker v-if="!fundoTransparente" v-model="corFundo" mode="hex" :modes="['hex']"
                            width="100%" class="mt-2" />
                    </v-expand-transition>
                </v-card>

                <v-card variant="outlined" class="pa-4">
                    <div class="text-body-2 text-uppercase font-weight-bold mb-3">Saída</div>

                    <v-btn-toggle v-model="modoNome" mandatory divided density="comfortable" variant="outlined"
                        class="mb-3 w-100">
                        <v-btn value="individual" class="flex-grow-1">Nome de cada</v-btn>
                        <v-btn value="geral" class="flex-grow-1">Nome único</v-btn>
                    </v-btn-toggle>

                    <v-text-field v-model="nomeGeral" :label="modoNome === 'geral' ? 'Nome base' : 'Nome do .zip'"
                        density="compact" variant="outlined" hide-details class="mb-4" />

                    <v-btn-toggle v-model="formato" mandatory divided density="comfortable" variant="outlined"
                        class="mb-3 w-100">
                        <v-btn v-for="opcao in FORMATOS" :key="opcao.valor" :value="opcao.valor" class="flex-grow-1">
                            {{ opcao.titulo }}
                        </v-btn>
                    </v-btn-toggle>

                    <v-expand-transition>
                        <div v-if="formato === 'webp'" class="d-flex align-center ga-2 mb-2">
                            <span class="text-caption text-grey">Qualidade</span>
                            <v-slider v-model="qualidade" :min="50" :max="100" :step="1" hide-details
                                density="compact" color="tormentaText" />
                            <span class="text-caption text-grey" style="min-width: 2.5em">{{ qualidade }}</span>
                        </div>
                    </v-expand-transition>

                    <v-select v-model="resolucao" :items="RESOLUCOES" density="compact" variant="outlined"
                        hide-details label="Pixels por quadrado" class="mb-2">
                        <template #item="{ props: opcao, item }">
                            <v-list-item v-bind="opcao" :title="`${item.raw} px por quadrado`"
                                :subtitle="item.raw === 300 ? 'resolução original do PSD' : null" />
                        </template>
                    </v-select>
                    <div class="text-caption text-grey mb-4">
                        Arquivo final: {{ ladoFinal }}×{{ ladoFinal }} px
                    </div>

                    <v-progress-linear v-if="gerando" :model-value="progresso" color="tormentaText" height="4"
                        class="mb-3" />

                    <v-btn block variant="tonal" color="tormentaText" class="mb-2" prepend-icon="mdi-download"
                        :disabled="!selecionado || gerando" @click="baixarSelecionado">Baixar selecionado</v-btn>
                    <v-btn block variant="flat" color="tormentaText" prepend-icon="mdi-folder-zip"
                        :disabled="!itens.length || gerando" :loading="gerando" @click="baixarTodos">
                        Baixar todos ({{ itens.length }}) em .zip
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>

        <v-snackbar v-model="mostrarAviso" :timeout="4000" color="grey-darken-3">{{ aviso }}</v-snackbar>
    </v-container>
</template>

<style scoped>
.zona {
    border: 1px dashed rgba(255, 255, 255, 0.25);
    border-radius: 6px;
    transition: border-color 0.2s, background-color 0.2s;
}

.zona--ativa {
    border-color: #ce2a28;
    background-color: rgba(206, 42, 40, 0.08);
}

/* em telas largas a coluna passa de 700px e o canvas quadrado empurraria os
   controles para fora da tela: o teto desconta a altura que eles ocupam. O piso
   de 420px evita que uma janela baixa encolha o canvas alem do que a propria
   coluna ja daria — ali a rolagem e inevitavel de qualquer jeito. */
.editor :deep(.token-palco) {
    max-width: min(100%, max(420px, calc(100vh - 470px)));
    margin-inline: auto;
}

.v-btn-toggle .v-btn {
    min-width: 0;
    padding-inline: 8px;
    font-size: 0.75rem;
}

.fila {
    max-height: 60vh;
    overflow-y: auto;
}

.miniatura {
    width: 48px;
    flex: 0 0 48px;
}
</style>
