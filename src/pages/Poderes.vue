<script setup>
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useFiltroPoderesStore } from '../stores/filtroPoderes';
import DialogPoder from '../components/DialogPoder.vue';
const { mdAndUp } = useDisplay();

const filtroPoderes = useFiltroPoderesStore();
const dialog = ref(false);
const dialogPoder = ref(null);
function openDialog(poder) {
    dialogPoder.value = poder;
    dialog.value = true;
}
</script>
<template>
    <v-container fluid :width="mdAndUp ? '1200' : '100%'">
        <v-responsive
            class="text-center fill-height"
            :width="mdAndUp ? '1200' : '100%'"
        >
            <!-- BARRA PESQUISA -->
            <v-responsive class="mx-0 pa-1">
                <v-text-field
                    v-model.trim="filtroPoderes.filtroPesquisa.nome"
                    hide-details
                    clearable
                    label="Poder"
                    placeholder="Acuidade com Arma..."
                    variant="solo"
                    bg-color="tormentaText"
                    class="mx-4 custom-placeholer"
                    @update:model-value="filtroPoderes.filterPoderes"
                />
            </v-responsive>
            <v-responsive class="mx-0 pa-1">
                <v-text-field
                    v-model="filtroPoderes.filtroPesquisa.texto"
                    hide-details
                    clearable
                    label="Procurar no Texto"
                    placeholder="Com uma ação padrão..."
                    variant="solo"
                    bg-color="tormentaText"
                    class="mx-4 custom-placeholer"
                    @update:model-value="filtroPoderes.filterPoderes"
                />
            </v-responsive>
            <v-responsive class="mx-0 pa-1">
                <v-autocomplete
                    v-model="filtroPoderes.filtroPesquisa.tags"
                    :items="filtroPoderes.filtroOpcoes.Tags"
                    multiple
                    clearable
                    chips
                    label="Tags"
                    density="comfortable"
                    variant="solo"
                    hide-details
                    bg-color="tormentaText"
                    class="mx-4 custom-placeholer"
                    @update:model-value="filtroPoderes.filterPoderes"
                />
            </v-responsive>
            <v-responsive class="mx-0 pa-1">
                <v-select
                    v-model="filtroPoderes.filtroPesquisa.referencia"
                    :items="filtroPoderes.filtroOpcoes.Referência"
                    multiple
                    clearable
                    chips
                    label="Referência"
                    density="comfortable"
                    variant="solo"
                    hide-details
                    bg-color="tormentaText"
                    class="mx-4 custom-placeholer"
                    @update:model-value="filtroPoderes.filterPoderes"
                />
            </v-responsive>

            <v-btn
                color="tormentaText"
                class="mx-2"
                @click="filtroPoderes.resetFiltro"
            >
                Limpar Filtros
            </v-btn>
            <h4 class="pa-0 my-2">
                {{ filtroPoderes.filteredJson.length }} de
                {{ filtroPoderes.jsonPoderes.length }} poderes encontradas
            </h4>
            <!-- CARDS CONTAINER -->
            <v-container fluid class="d-flex flex-wrap justify-center pt-1">
                <v-hover v-slot="{ isHovering }">
                    <v-card
                        @click="openDialog(poder)"
                        v-for="(poder, index) in filtroPoderes.filteredJson"
                        :key="poder.id"
                        class="ma-2 pa-2 d-flex flex-column align-center justify-space-between"
                        :class="{ 'on-hover': isHovering }"
                        hover
                        :elevation="isHovering ? 12 : 6"
                        width="300"
                    >
                        <v-card-title
                            class="text-tormentaText text-wrap font-tormenta text-center"
                        >
                            {{ poder.nome }}
                        </v-card-title>
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
                                v-for="tag in poder.tags"
                                :key="tag"
                            >
                                {{ filtroPoderes.convertTag(tag) }}
                            </span>
                        </v-card-subtitle>
                        <span class="mb-1"><strong>Referência: </strong>{{ poder.referencia }};&nbsp</span>

                        <DialogPoder :poderIndex="index" :poderes="filtroPoderes.filteredJson" />
                    </v-card>
                </v-hover>
            </v-container>
        </v-responsive>
    </v-container>
</template>
<style scoped></style>
