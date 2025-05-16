<script setup>
import { ref, onMounted } from 'vue';
import { getData } from '../plugins/global.js';
import { useDisplay } from 'vuetify';
const { mdAndUp } = useDisplay();

const condicoes = ref([]);

onMounted(async () => {
  condicoes.value = await getData(import.meta.env.VITE_CONDICOES_API_URL);
});
</script>
<template>
    <v-container fluid :width="mdAndUp ? '1200' : '90%'">
        <v-card-title class="text-center font-tormenta condicoes-title">
            A menos que especificado o contrário, as condições terminam no fim da cena.
        </v-card-title>
        <div class="d-flex flex-wrap justify-center pt-1">
            <v-card v-for="condicao in condicoes" :key="condicao.id" class="ma-2 pa-2" :width="mdAndUp ? '300' : '100%'">
                <v-card-title class="text-tormentaText text-wrap font-tormenta">
                    {{ condicao.nome }}
                </v-card-title>
                <v-card-text class="pb-2">
                    <p class="text-body-1" v-html="condicao.descricao"></p>
                </v-card-text>
            </v-card>
        </div>
  </v-container>
</template>
<style scoped>
.condicoes-title {
    color: #ce2a28;
    text-shadow: 0 2px 8px #000a;
    letter-spacing: 1px;
}
</style>