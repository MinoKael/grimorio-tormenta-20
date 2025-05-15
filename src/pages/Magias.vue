<script setup>
import Card from '../components/Card.vue';
import { useDisplay } from 'vuetify';
import Filtros from '../components/Filtros.vue';
import { useFiltrosStore } from '../stores/filtros';
import { computed, ref, watch } from 'vue';

const filtroMagias = useFiltrosStore();
const { mdAndUp } = useDisplay();

const ITEMS_OPTIONS = [30, 50, 'Tudo'];
const isShowingAll = computed(() => maxItemsPerPage.value === 'Tudo');

const maxItemsPerPage = ref(30);
const modelPagination = ref(1);
const magiasComputed = computed(() => {
    if (maxItemsPerPage.value === 'Tudo') {
        return filtroMagias.filteredJson;
    } else {
        const startIndex =
            (modelPaginationComputed.value - 1) * maxItemsPerPage.value;
        const endIndex = startIndex + maxItemsPerPage.value;
        return filtroMagias.filteredJson.slice(startIndex, endIndex);
    }
});
watch([maxItemsPerPage, () => filtroMagias.filteredJson.length], () => {
  const totalPages = paginationComputed.value;
  if (modelPagination.value > totalPages) {
    modelPagination.value = totalPages;
  }
});
watch(() => filtroMagias.filteredJson.length, (newLength, oldLength) => {
  if (oldLength === 0 && newLength > 0) {
    modelPagination.value = 1;
  }
});

const paginationComputed = computed(() => {
    if (maxItemsPerPage.value === 'Tudo') return 1;
    return Math.ceil(filtroMagias.filteredJson.length / maxItemsPerPage.value);
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
                  v-model.trim="filtroMagias.filtroPesquisa.nome"
                  hide-details
                  clearable
                  label="Magia"
                  placeholder="Bola de Fogo..."
                  variant="solo"
                  bg-color="tormentaText"
                  class="mx-4 custom-placeholer"
                  @update:model-value="filtroMagias.filterMagias"
                />
            </v-responsive>
            <v-responsive class="mx-0 pa-1">
                <v-select
                  v-model="filtroMagias.filtroPesquisa.referencia"
                  :items="filtroMagias.filtroOpcoes.Referência"
                  multiple
                  clearable
                  chips
                  label="Referência"
                  density="comfortable"
                  variant="solo"
                  hide-details
                  bg-color="tormentaText"
                  class="mx-4 custom-placeholer"
                  @update:model-value="filtroMagias.filterMagias"
                />
            </v-responsive>
            <v-container fluid class="d-flex flex-wrap pt-1 pb-1">
                <Filtros v-if="mdAndUp" :mdAndUp="mdAndUp" />

                <v-expansion-panels v-else class="mx-1 pb-1 font-weight-bold" color="tormentaText">
                  <v-expansion-panel title="Filtros">
                    <v-expansion-panel-text>
                      <Filtros :mdAndUp="mdAndUp" />
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
            </v-container>

            <v-btn color="tormentaText" class="mx-2" @click="filtroMagias.resetFiltro">
                Limpar Filtros
            </v-btn>
            <h4 class="pa-0 my-2">
                {{ filtroMagias.filteredJson.length }} de
                {{ filtroMagias.jsonMagias.length }} magias encontradas
            </h4>
            <!-- CARDS CONTAINER -->
            <v-container fluid class="d-flex flex-wrap justify-center pt-1">
              <Card
                v-for="(magia, index) in magiasComputed"
                :key="magia.id"
                :magiaIndex="index + (isShowingAll ? 0 : (modelPaginationComputed - 1) * maxItemsPerPage)"
                :magia="magia"
                v-bind="$attrs"
              />
            </v-container>
        </v-responsive>
        <v-responsive :width="mdAndUp ? '1000' : ''" v-if="!isShowingAll">
            <v-row no-gutters justify="end" class="my-4">
                <span class="mr-3 d-flex align-center">Itens por página</span>
                <v-select
                    v-model="maxItemsPerPage"
                    :items="ITEMS_OPTIONS"
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
        <v-responsive :width="mdAndUp ? '1000' : ''" v-else>
            <v-row no-gutters justify="end" class="my-4">
                <span class="mr-3 d-flex align-center">Itens por página</span>
                <v-select
                    v-model="maxItemsPerPage"
                    :items="ITEMS_OPTIONS"
                    variant="solo-filled"
                    hide-details
                    style="max-width: fit-content !important;margin-right: 40px;"
                ></v-select>
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
