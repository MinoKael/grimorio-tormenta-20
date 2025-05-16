<script setup>
import { ref, watch, computed } from 'vue';
import { useFiltroPoderesStore } from '../stores/filtroPoderes';

const filtroPoderes = useFiltroPoderesStore();
const dialog = ref(false);
const { poderIndex } = defineProps(['poderIndex']);

const currentIndex = ref(poderIndex);
const currentPoder = computed(() => filtroPoderes.filteredJson[currentIndex.value]);

function nextPoder() {
    if (currentIndex.value < filtroPoderes.filteredJson.length - 1) {
        currentIndex.value++;
    }
}
function prevPoder() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    }
}
watch(dialog, () => {
    if(dialog.value) {
        currentIndex.value = poderIndex;
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
        style="min-height: 50%;"
    >
        <v-card>
            <v-card-item class="pb-0">
                <v-card-title class="text-tormentaText text-wrap font-tormenta-lg text-center">
                    {{ currentPoder.nome }}
                </v-card-title>
            </v-card-item>
            <div class="d-flex flex-column text-body-1 pl-6">
                <v-card-subtitle
                    class="pb-2 d-flex justify-center flex-wrap ga-1"
                >
                    <span
                        style="
                            font-size: 0.9rem;
                            background-color: #ce2a28;
                            color: white;
                            font-weight: bold;
                            border-radius: 30px;
                        "
                        class="px-2"
                        v-for="tag in currentPoder.tags"
                        :key="tag"
                    >
                        {{ filtroPoderes.convertTag(tag) }}
                    </span>
                </v-card-subtitle>
                <span class="text-tormentaText font-tormenta-xs"><strong>Referência:</strong> </span> {{ currentPoder.referencia }};&nbsp
            </div>
            <v-divider class="my-3"></v-divider>
            <v-card-text class="pt-2">

                <p class="text-pre-wrap" v-html="currentPoder.texto"></p>

                <v-divider class="my-3"></v-divider>
            </v-card-text>
            <v-card-actions class="d-flex justify-space-between" style="width: 100%;">
                <v-btn icon @click="prevPoder" :disabled="currentIndex === 0">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <v-btn color="tormentaText font-tormenta" class="mx-2" style="flex: 1;" @click="dialog = false">
                    Fechar
                </v-btn>
                <v-btn icon @click="nextPoder" :disabled="currentIndex === filtroPoderes.filteredJson.length - 1">
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
