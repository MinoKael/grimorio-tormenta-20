<script setup>
import { useFiltrosMagiasStore } from '../stores/filtrosMagias';
import { ref, watch, computed } from 'vue';

const filtros = useFiltrosMagiasStore();
const dialog = ref(false);
const { magiaIndex } = defineProps(['magiaIndex']);

const currentIndex = ref(magiaIndex);
const currentMagia = computed(() => filtros.filteredJson[currentIndex.value]);

function nextMagia() {
    if (currentIndex.value < filtros.filteredJson.length - 1) {
        currentIndex.value++;
    }
}
function prevMagia() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    }
}
watch(dialog, () => {
    if(dialog.value) {
        currentIndex.value = magiaIndex;
    }
});
</script>
<template>
    <v-dialog
        v-model="dialog"
        height="90%"
        max-width="800px"
        scrollable
        transition="dialog-bottom-transition"
        activator="parent"
        scrim="background"
        style="min-height: 100%;"
    >
        <v-card>
            <v-card-item class="pb-0">
                <v-card-title class="text-tormentaText text-wrap font-tormenta-lg text-center">
                    {{ currentMagia.nome }}
                </v-card-title>
                <v-card-subtitle class="pb-2 d-flex justify-center align-center ga-1">
                    <span>
                        {{ currentMagia.tipo }} {{ currentMagia.circulo }} ({{ currentMagia.escola }})
                    </span>
                    <span class="text-tormentaText font-weight-black font-tormenta">
                        {{ currentMagia.custo }} PM
                    </span>
                </v-card-subtitle>
            </v-card-item>
            <div class="d-flex flex-column text-body-1 pl-6">
                <span v-if="currentMagia.execucao">
                    <span class="text-tormentaText font-tormenta-xs"><strong>Execução:</strong> </span> {{ currentMagia.execucao }};&nbsp
                </span>
                <span v-if="currentMagia.alcance">
                    <span class="text-tormentaText font-tormenta-xs"><strong>Alcance:</strong> </span> {{ currentMagia.alcance }};&nbsp
                </span>
                <span v-if="currentMagia.alvo">
                    <span class="text-tormentaText font-tormenta-xs"><strong>Alvo:</strong> </span> {{ currentMagia.alvo }};&nbsp
                </span>
                <span v-if="currentMagia.area">
                    <span class="text-tormentaText font-tormenta-xs"><strong>Área:</strong> </span> {{ currentMagia.area }};&nbsp
                </span>
                <span v-if="currentMagia.efeito">
                    <span class="text-tormentaText font-tormenta-xs"><strong>Efeito:</strong> </span> {{ currentMagia.efeito }};&nbsp
                </span>
                <span v-if="currentMagia.duracao">
                    <span class="text-tormentaText font-tormenta-xs"><strong>Duração:</strong> </span> {{ currentMagia.duracao }};&nbsp
                </span>
                <span v-if="currentMagia.resistencia">
                    <span class="text-tormentaText font-tormenta-xs"><strong>Resistência:</strong> </span> {{ currentMagia.resistencia }};&nbsp
                </span>
                <span>
                    <span class="text-tormentaText font-tormenta-xs"><strong>Referência:</strong> </span> {{ currentMagia.referencia }};&nbsp
                </span>
            </div>
            <v-divider class="my-3"></v-divider>
            <v-card-text class="pt-2">

                <p class="text-pre-wrap" v-html="currentMagia.texto"></p>

                <v-divider class="my-3"></v-divider>

                <p v-for="aprimoramento in currentMagia.aprimoramentos">
                    <span class="text-tormentaText font-weight-bold font-tormenta-sm">{{
                        aprimoramento.match(/.+?:/).toString()
                    }}</span>
                    <span v-html="aprimoramento.match(/(?<=:).+/).toString()"></span>
                </p>
            </v-card-text>
            <v-card-actions class="d-flex justify-space-between" style="width: 100%;">
                <v-btn icon @click="prevMagia" :disabled="currentIndex === 0">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <v-btn color="tormentaText font-tormenta" style="flex: 1;" @click="dialog = false">
                    Fechar
                </v-btn>
                <v-btn icon @click="nextMagia" :disabled="currentIndex === filtros.filteredJson.length - 1">
                    <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style scoped>
:deep(.v-card-subtitle) {
    opacity: 1 !important;
}
</style>
