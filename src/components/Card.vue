<script setup>
import DialogCard from './DialogCard.vue';

const { magiaIndex, magias } = defineProps(['magiaIndex', 'magias']);
let magia = Object.assign({}, magias[magiaIndex]);

</script>
<template>
    <v-hover v-slot="{ isHovering, props }">
        <v-card
            class="ma-2 pa-2 d-flex flex-column"
            :class="{ 'on-hover': isHovering }"
            :elevation="isHovering ? 12 : 6"
            width="300"
            hover
            v-bind="props"
        >
            <v-card-item class="pb-0">
                <v-card-title class="text-tormentaText text-wrap font-tormenta">
                    {{ magia.nome }}
                </v-card-title>
                <v-card-subtitle class="pb-2 d-flex align-center justify-center ga-1">
                    <span style="font-size: 1rem;">
                        {{ magia.tipo }} {{ magia.circulo }} ({{ magia.escola }})
                    </span>
                    <span class="text-tormentaText font-weight-black font-tormenta-sm d-flex align-self-end">
                        {{ magia.custo }} PM
                    </span>
                </v-card-subtitle>
            </v-card-item>
            <!-- <span v-if="magia.execucao">
                <strong>Execução: </strong> {{ magia.execucao }};&nbsp
            </span>
            <span v-if="magia.alcance">
                <strong>Alcance: </strong> {{ magia.alcance }};&nbsp
            </span>
            <span v-if="magia.alvo"
                ><strong>Alvo: </strong> {{ magia.alvo }};&nbsp
            </span>
            <span v-if="magia.area"
                ><strong>Área: </strong> {{ magia.area }};&nbsp
            </span>
            <span v-if="magia.efeito">
                <strong>Efeito: </strong> {{ magia.efeito }};&nbsp
            </span>
            <span v-if="magia.duracao">
                <strong>Duração: </strong> {{ magia.duracao }};&nbsp
            </span>
            <span v-if="magia.resistencia">
                <strong>Resistência: </strong> {{ magia.resistencia }};&nbsp
            </span> -->
            <span>
                <strong>Referência:</strong> {{ magia.referencia }};&nbsp
            </span>
            <v-spacer />
            <DialogCard :magiaIndex="magiaIndex" :magias="magias" />
        </v-card>
    </v-hover>
</template>
<style scoped>
:deep(.v-card-subtitle) {
    opacity: 1 !important;
}
</style>
