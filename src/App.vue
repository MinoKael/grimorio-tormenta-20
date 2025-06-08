<script setup>
import { ref, onMounted } from 'vue';
import Footer from './components/Footer.vue';
import Magias from './pages/Magias.vue';
import Poderes from './pages/Poderes.vue';
import Condicoes from './pages/Condicoes.vue';
import Itens from './pages/Itens.vue';
import { useFiltrosMagiasStore } from './stores/filtrosMagias';
import { useFiltroPoderesStore } from './stores/filtroPoderes';
import { useGlobalStore } from './stores/globalStore';


const filtrosMagiasStore = useFiltrosMagiasStore();
const filtroPoderesStore = useFiltroPoderesStore();
const globalStore = useGlobalStore();
const loading = ref(true);

function incluirEvento(tab) {
  gtag('event', `clique_${tab}`, {
    event_category: 'interacao',
    event_label: `Botão ${tab}`,
  });
}

onMounted(async () => {
    await Promise.all([
        filtrosMagiasStore.loadMagias(),
        filtroPoderesStore.loadPoderes()
    ]);
    loading.value = false;
});
</script>
<template>
    <v-app>
        <template v-if="loading">
            <v-container class="fill-height d-flex flex-column align-center justify-center">
                <v-progress-circular indeterminate color="tormentaText" size="64" width="7" />
                <div class="mt-4 font-tormenta">Carregando dados...</div>
            </v-container>
        </template>
        <template v-else>
            <v-tabs :model-value="globalStore.currentTab" @update:model-value="globalStore.setCurrentTab" align-tabs="center" color="#ebebea">
                <v-tab :value="1" @click="incluirEvento('Magias')">Magias</v-tab>
                <v-tab :value="2" @click="incluirEvento('Poderes')">Poderes</v-tab>
                <v-tab :value="3" @click="incluirEvento('Condicoes')">Condições</v-tab>
                <v-tab :value="4" @click="incluirEvento('Itens')">Itens</v-tab>
            </v-tabs>
            <v-main>
                <v-tabs-window :model-value="globalStore.currentTab" @update:model-value="globalStore.setCurrentTab">
                    <v-tabs-window-item :value="1">
                        <Magias></Magias>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="2">
                        <Poderes></Poderes>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="3">
                        <Condicoes></Condicoes>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="4">
                        <Itens></Itens>
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-main>
            <Footer></Footer>
        </template>
    </v-app>
</template>
<style scoped></style>
