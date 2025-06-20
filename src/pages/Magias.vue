<script setup>
import DialogCard from '../components/DialogCard.vue';
import { useDisplay } from 'vuetify';
import Filtros from '../components/Filtros.vue';
import { useFiltrosMagiasStore } from '../stores/filtrosMagias';
import { computed, ref, watch } from 'vue';

const filtroMagias = useFiltrosMagiasStore();
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
                  v-model="filtroMagias.filtroPesquisa.nome"
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
            <h4 class="pa-0 my-2 font-tormenta magias-title">
                {{ filtroMagias.filteredJson.length }} de
                {{ filtroMagias.jsonMagias.length }} magias encontradas
            </h4>
            <!-- CARDS CONTAINER -->
            <v-container fluid class="d-flex flex-wrap justify-center pt-1">
                <v-hover v-slot="{ isHovering }">
                    <v-card
                        v-for="(magia, index) in magiasComputed"
                        :key="magia.id"
                        class="ma-2 pa-2 d-flex flex-column"
                        :class="{ 'on-hover': isHovering }"
                        hover
                        :elevation="isHovering ? 12 : 6"
                        width="296"
                    >
                        <v-card-item class="pb-0">
                            <v-card-title class="text-tormentaText text-wrap font-tormenta">
                                {{ magia.nome }}
                            </v-card-title>
                            <v-card-subtitle class="pb-2 d-flex align-center justify-center ga-1" style="opacity: 1!important;">
                                <span style="font-size: 1rem;">
                                    {{ magia.tipo }} {{ magia.circulo }} ({{ magia.escola }})
                                </span>
                                <span class="text-tormentaText font-weight-black font-tormenta-sm d-flex align-self-end">
                                    {{ magia.custo }} PM
                                </span>
                            </v-card-subtitle>
                        </v-card-item>
                        <span class="mb-1">
                            <strong>Referência:</strong> {{ magia.referencia }};&nbsp
                        </span>
                    
                        <DialogCard :magiaIndex="index + (isShowingAll ? 0 : (modelPaginationComputed - 1) * maxItemsPerPage)" />
                    </v-card>
                </v-hover>
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
.magias-title {
    color: #ce2a28;
    text-shadow: 0 2px 8px #000a;
    letter-spacing: 1px;
}
</style>
