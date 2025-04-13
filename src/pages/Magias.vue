<script setup>
import Card from '../components/Card.vue';
import { useDisplay } from 'vuetify';
import Filtros from '../components/Filtros.vue';
import { useFiltrosStore } from '../stores/filtros';
import { computed, ref } from 'vue';
const filtros = useFiltrosStore();

const { mdAndUp } = useDisplay();

const maxItemsPerPage = ref(30);
const modelPagination = ref(1);
const posts = computed(() => {
    if (maxItemsPerPage.value === 'Tudo') {
        return filtros.filteredJson;
    } else {
        const startIndex =
            (modelPaginationComputed.value - 1) * maxItemsPerPage.value;
        const endIndex = startIndex + maxItemsPerPage.value;

        return filtros.filteredJson.slice(startIndex, endIndex);
    }
});

const paginationComputed = computed(() => {
    if (maxItemsPerPage.value === 'Tudo') return 1;
    return Math.ceil(filtros.filteredJson.length / maxItemsPerPage.value);
});
const modelPaginationComputed = computed({
    get: () =>
        modelPagination.value > paginationComputed.value
            ? paginationComputed.value
            : modelPagination.value,
    set: (val) => (modelPagination.value = val),
});
</script>
<template>
    <!-- MAGIAS CONTAINER -->
    <v-container fluid class="fill-height justify-center flex-column mb-4">
        <v-responsive
            class="text-center fill-height"
            :width="mdAndUp ? '1200' : '100%'"
        >
            <!-- BARRA PESQUISA -->
            <v-responsive class="mx-0 pa-1">
                <v-text-field
                  v-model.trim="filtros.filtroPesquisa.nome"
                  hide-details
                  clearable
                  label="Magia"
                  placeholder="Bola de Fogo..."
                  variant="solo"
                  bg-color="tormentaText"
                  class="mx-4 custom-placeholer"
                  @update:model-value="filtros.filterMagias"
                />
            </v-responsive>
            <v-responsive class="mx-0 pa-1">
                <v-select
                  v-model="filtros.filtroPesquisa.referencia"
                  :items="filtros.filtroOpcoes.Referência"
                  multiple
                  clearable
                  chips
                  label="Referência"
                  density="comfortable"
                  variant="solo"
                  hide-details
                  bg-color="tormentaText"
                  class="mx-4 custom-placeholer"
                  @update:model-value="filtros.filterMagias"
                />
            </v-responsive>
            <v-container class="d-flex flex-wrap pt-1 pb-1">
                <Filtros v-if="mdAndUp" :mdAndUp="mdAndUp" />

                <v-expansion-panels v-else class="mx-1 pb-1 font-weight-bold" color="tormentaText">
                  <v-expansion-panel title="Filtros">
                    <v-expansion-panel-text>
                      <Filtros :mdAndUp="mdAndUp" />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
            </v-container>

            <v-btn color="tormentaText" class="mx-2" @click="filtros.resetFiltro">
                Limpar Filtros
            </v-btn>
            <h4 class="pa-0 my-2">
                {{ filtros.filteredJson.length }} de
                {{ filtros.jsonMagias.length }} magias encontradas
            </h4>
            <!-- CARDS CONTAINER -->
            <v-container class="d-flex flex-wrap justify-center pt-1">
              <Card
                v-for="(ritual, index) in filtros.filteredJson"
                :key="ritual.id"
                :magiaIndex="index"
                :magias="filtros.filteredJson"
                v-bind="$attrs"
              />
            </v-container>
        </v-responsive>
        <v-responsive :width="mdAndUp ? '1000' : ''">
          <v-row no-gutters justify="end" class="my-4">
            <span class="mr-3 d-flex align-center"
                  >Itens por página</span
                >
                <v-select
                    v-model="maxItemsPerPage"
                    :items="[30, 50, 'Tudo']"
                    variant="solo-filled"
                    hide-details
                    style="max-width: fit-content !important"
                    ></v-select>

                <v-pagination
                    style="min-width: 400px !important"
                    v-model="modelPaginationComputed"
                    :length="paginationComputed"
                    :total-visible="3"
                    ></v-pagination>
          </v-row>
        </v-responsive>
    </v-container>
</template>
<style scoped>
:deep(.v-label) {
    color: white !important;
    opacity: 1;
    font-weight: bolder;
}
:deep(.v-field--active) {
    font-weight: 400 !important;
}
</style>
