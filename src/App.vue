<script setup>
import { ref, onMounted } from 'vue';
import Footer from './components/Footer.vue';
import Magias from './pages/Magias.vue';
import Poderes from './pages/Poderes.vue';
import Condicoes from './pages/Condicoes.vue';
import Itens from './pages/Itens.vue';
import { useFiltrosStore } from './stores/filtros';
import { useFiltroPoderesStore } from './stores/filtroPoderes';

const tab = ref(1);

const filtrosStore = useFiltrosStore();
const filtroPoderesStore = useFiltroPoderesStore();
const loading = ref(true);

onMounted(async () => {
    await Promise.all([
        filtrosStore.loadMagias(),
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
            <v-tabs v-model="tab" align-tabs="center" color="#ebebea">
                <v-tab :value="1">Magias</v-tab>
                <v-tab :value="2">Poderes</v-tab>
                <v-tab :value="3">Condições</v-tab>
                <v-tab :value="4">Itens</v-tab>
            </v-tabs>
            <v-main>
                <v-tabs-window v-model="tab">
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
