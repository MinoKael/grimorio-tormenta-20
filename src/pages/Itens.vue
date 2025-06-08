<script setup>
import { ref, toRefs, onMounted, reactive, computed, nextTick } from 'vue';
import { getData } from '../plugins/global.js';
import DataTableItens from '../components/DataTableItens.vue';
import { useDisplay } from 'vuetify';
const { mdAndUp } = useDisplay();

const itens = reactive({
    armas: { armas: [] },
    armaduras_escudos: {},
    itens_gerais: {},
    itens_superiores: {},
    itens_magicos: {},
});
const {
    armas,
    armaduras_escudos,
    itens_gerais,
    itens_superiores,
    itens_magicos
} = toRefs(itens);

const search = reactive({
    armas: '',
    armaduras_escudos: '',
    itens_gerais: '',
});
const headers_armas = [
    { title: 'Arma', key: 'nome', align: 'center', },
    { title: 'Proposito', key: 'proposito', align: 'center', },
    { title: 'Empunhadura', key: 'empunhadura', align: 'center', },
    { title: 'Preço', key: 'preco', align: 'center', },
    { title: 'Dano', key: 'dano', align: 'center', },
    { title: 'Crítico', key: 'critico', align: 'center', },
    { title: 'Alcance', key: 'alcance', align: 'center', },
    { title: 'Tipo', key: 'tipo', align: 'center', },
    { title: 'Espaços', key: 'espacos', align: 'center', },
    { title: 'Referência', key: 'referencia', align: 'center', }
];

const headers_armaduras = [
    { title: 'Nome', key: 'nome', align: 'center', },
    { title: 'Preço', key: 'preco', align: 'center', },
    { title: 'Bônus', key: 'bonus', align: 'center', },
    { title: 'Penalidade', key: 'penalidade', align: 'center', },
    { title: 'Espaços', key: 'espacos', align: 'center', },
    { title: 'Referência', key: 'referencia', align: 'center', }
]

const filteredArmas = computed(() => {
    const data = armas.value.data || [];
    const searchTerm = search.armas.toUpperCase();
    return data
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .filter(item => {
            if (!searchTerm) return true;
            return [
                item.nome,
                item.proposito,
                item.empunhadura,
                item.preco,
                item.dano,
                item.critico,
                item.alcance,
                item.tipo,
                item.espacos,
                item.referencia
            ].some(value =>
                value && String(value).toUpperCase().includes(searchTerm));
        });
});

const filteredArmaduras = computed(() => {
    const data = armaduras_escudos.value.data || [];
    const searchTerm = search.armaduras_escudos.toUpperCase();
    return data
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .filter(item => {
            if (!searchTerm) return true;
            return [
                item.nome,
                item.proposito,
                item.empunhadura,
                item.preco,
                item.espacos,
                item.referencia
            ].some(value =>
                value && String(value).toUpperCase().includes(searchTerm));
        });
});

onMounted(async () => {
    const data = await getData(import.meta.env.VITE_ITENS_API_URL);
    Object.assign(itens, data);
})
</script>

<template>
    <v-container fluid :width="mdAndUp ? '1300' : '100%'">
        <DataTableItens :titulo="'Tabela de Armas'" :headers="headers_armas" :items="filteredArmas" :search="search.armas"
            @update:search="search.armas = $event">
        </DataTableItens>
        <v-divider class="my-2"></v-divider>
        <DataTableItens :titulo="'Tabela de Armaduras'" :headers="headers_armaduras" :items="filteredArmaduras" :search="search.armaduras_escudos"
            @update:search="search.armaduras_escudos = $event">
        </DataTableItens>
    </v-container>
</template>