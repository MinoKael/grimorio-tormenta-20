<script setup>
import { ref, onMounted } from 'vue';
import { getData } from '../plugins/global.js';

const poderes = ref([]);

onMounted(async () => {
  poderes.value = await getData(import.meta.env.VITE_PODERES_API_URL);
});
</script>
<template>
    <v-container>
        <div class="d-flex flex-wrap justify-center pt-1">
            <v-card v-for="poder in poderes" :key="poder.id" class="ma-2 pa-2 " width="300">
                <v-card-title class="text-tormentaText text-wrap font-tormenta">
                    {{ poder.nome }}
                </v-card-title>
                <v-card-text class="pb-2">
                    <p class="text-body-1" v-html="poder.texto"></p>
                </v-card-text>
            </v-card>
        </div>
  </v-container> 
</template>
<style scoped></style>