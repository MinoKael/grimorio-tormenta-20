<script setup>
import { ref, watch, onMounted } from 'vue';
import { AJUSTE_PADRAO, ZOOM_MAXIMO, ZOOM_MINIMO, renderizarToken } from '../plugins/token.js';

const props = defineProps({
    moldura: { type: Object, default: null },
    arte: { type: Object, default: null },
    ajuste: { type: Object, default: () => ({ ...AJUSTE_PADRAO }) },
    fundo: { type: String, default: null },
    lado: { type: Number, default: 512 },
    interativo: { type: Boolean, default: false },
    guia: { type: Boolean, default: false },
});

const emit = defineEmits(['update:ajuste']);

const canvas = ref(null);
const ponteiros = new Map();
let distanciaAnterior = 0;
let quadroPendente = false;

function desenhar() {
    if (quadroPendente || !canvas.value) return;
    quadroPendente = true;
    requestAnimationFrame(() => {
        quadroPendente = false;
        if (canvas.value) renderizarToken(canvas.value, props);
    });
}

function editavel() {
    return props.interativo && props.arte && props.moldura;
}

/** Coordenadas em fração do lado do canvas, a mesma unidade do ajuste. */
function posicao(evento) {
    const area = canvas.value.getBoundingClientRect();
    return {
        x: (evento.clientX - area.left) / area.width,
        y: (evento.clientY - area.top) / area.height,
    };
}

function aplicar(mudanca) {
    emit('update:ajuste', { ...props.ajuste, ...mudanca });
}

/** Aproxima mantendo parado o ponto do canvas sob o cursor (ou entre os dedos). */
function ampliar(fator, centro) {
    const escala = Math.min(Math.max(props.ajuste.escala * fator, ZOOM_MINIMO), ZOOM_MAXIMO);
    const efetivo = escala / props.ajuste.escala;
    const ancoraX = centro.x - 0.5;
    const ancoraY = centro.y - 0.5;

    aplicar({
        escala,
        x: ancoraX + (props.ajuste.x - ancoraX) * efetivo,
        y: ancoraY + (props.ajuste.y - ancoraY) * efetivo,
    });
}

function pinca() {
    const [um, dois] = [...ponteiros.values()];
    return {
        distancia: Math.hypot(dois.x - um.x, dois.y - um.y),
        centro: { x: (um.x + dois.x) / 2, y: (um.y + dois.y) / 2 },
    };
}

function aoPressionar(evento) {
    if (!editavel()) return;
    canvas.value.setPointerCapture(evento.pointerId);
    ponteiros.set(evento.pointerId, posicao(evento));
    if (ponteiros.size === 2) distanciaAnterior = pinca().distancia;
}

function aoMover(evento) {
    if (!ponteiros.has(evento.pointerId)) return;
    const anterior = ponteiros.get(evento.pointerId);
    const atual = posicao(evento);
    ponteiros.set(evento.pointerId, atual);

    if (ponteiros.size === 1) {
        aplicar({
            x: props.ajuste.x + atual.x - anterior.x,
            y: props.ajuste.y + atual.y - anterior.y,
        });
        return;
    }
    if (ponteiros.size === 2 && distanciaAnterior > 0) {
        const { distancia, centro } = pinca();
        ampliar(distancia / distanciaAnterior, centro);
        distanciaAnterior = distancia;
    }
}

function aoSoltar(evento) {
    ponteiros.delete(evento.pointerId);
    distanciaAnterior = ponteiros.size === 2 ? pinca().distancia : 0;
}

function aoRolar(evento) {
    if (!editavel()) return;
    ampliar(Math.exp(-evento.deltaY / 400), posicao(evento));
}

// props e shallowReactive: a copia do ajuste garante o redesenho campo a campo
watch(() => ({ ...props, ajuste: { ...props.ajuste } }), desenhar, { deep: true });
onMounted(desenhar);
</script>

<template>
    <div class="token-palco" :class="{ 'token-palco--arrastavel': editavel() }">
        <canvas ref="canvas" :width="lado" :height="lado" @pointerdown="aoPressionar" @pointermove="aoMover"
            @pointerup="aoSoltar" @pointercancel="aoSoltar" @wheel.prevent="aoRolar"></canvas>
    </div>
</template>

<style scoped>
.token-palco {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    overflow: hidden;
    background-color: #2b2b2b;
    background-image:
        linear-gradient(45deg, #212121 25%, transparent 25%, transparent 75%, #212121 75%),
        linear-gradient(45deg, #212121 25%, transparent 25%, transparent 75%, #212121 75%);
    background-size: 18px 18px;
    background-position: 0 0, 9px 9px;
}

.token-palco canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
}

.token-palco--arrastavel canvas {
    cursor: grab;
}

.token-palco--arrastavel canvas:active {
    cursor: grabbing;
}
</style>
