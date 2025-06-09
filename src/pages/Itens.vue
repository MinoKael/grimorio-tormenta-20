<script setup>
import { ref, toRefs, onMounted, reactive, computed, nextTick } from 'vue';
import { getData } from '../plugins/global.js';
import DataTableItens from '../components/DataTableItens.vue';
import { useDisplay } from 'vuetify';
import { useGlobalStore } from '../stores/globalStore.js';
const { mdAndUp, mobile } = useDisplay();
const globalStore = useGlobalStore();

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
const currentTable = ref(null);
const drawer = ref(true);

const tabelas = reactive([
    {
        nome: 'armas',
        title: 'Armas',
        icon: 'mdi-sword',
        headers: [
            { title: 'Arma', key: 'nome', align: 'start' },
            { title: 'Proposito', key: 'proposito', align: 'start' },
            { title: 'Empunhadura', key: 'empunhadura', align: 'start' },
            { title: 'Preço', key: 'preco', align: 'start' },
            { title: 'Dano', key: 'dano', align: 'start' },
            { title: 'Crítico', key: 'critico', align: 'start' },
            { title: 'Alcance', key: 'alcance', align: 'start' },
            { title: 'Tipo', key: 'tipo', align: 'start' },
            { title: 'Espaços', key: 'espacos', align: 'start' },
            { title: 'Referência', key: 'referencia', align: 'start' }
        ],
        items: computed(() => {
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
        })
    },
    {
        nome: 'armaduras_escudos',
        title: 'Armaduras e Escudos',
        icon: 'mdi-shield-half-full',
        headers: [
            { title: 'Nome', key: 'nome', align: 'start' },
            { title: 'Preço', key: 'preco', align: 'start' },
            { title: 'Bônus', key: 'bonus', align: 'start' },
            { title: 'Penalidade', key: 'penalidade', align: 'start' },
            { title: 'Espaços', key: 'espacos', align: 'start' },
            { title: 'Referência', key: 'referencia', align: 'start' }
        ],
        items: computed(() => {
            const data = armaduras_escudos.value.data || [];
            const searchTerm = search.armaduras_escudos.toUpperCase();
            return data
                .slice()
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .filter(item => {
                    if (!searchTerm) return true;
                    return [
                        item.nome,
                        item.preco,
                        item.bonus,
                        item.penalidade,
                        item.espacos,
                        item.referencia
                    ].some(value =>
                        value && String(value).toUpperCase().includes(searchTerm));
                });
        })
    },
    {
        nome: 'itens_gerais',
        title: 'Itens Gerais',
        icon: 'mdi-sack',
        headers: [
            { title: 'Nome', key: 'nome', align: 'start' },
            { title: 'Preço', key: 'preco', align: 'start' },
            { title: 'Espaços', key: 'espacos', align: 'start' },
            { title: 'Referência', key: 'referencia', align: 'start' }
        ],
        items: computed(() => {
            const data = itens_gerais.value.data || [];
            const searchTerm = search.itens_gerais.toUpperCase();
            return data
                .slice()
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .filter(item => {
                    if (!searchTerm) return true;
                    return [
                        item.nome,
                        item.preco,
                        item.espacos,
                        item.referencia
                    ].some(value =>
                        value && String(value).toUpperCase().includes(searchTerm));
                });
        })
    }
]);

onMounted(async () => {
    const data = await getData(import.meta.env.VITE_ITENS_API_URL);
    Object.assign(itens, data);
    currentTable.value = tabelas[0]
})
</script>

<template>
    <v-navigation-drawer 
        v-if="globalStore.currentTab == 4" 
        v-model="drawer" 
        floating 
        :mobile="mobile" 
        :location="mobile ? 'bottom' : undefined" 
        :temporary="mobile"
    >
        <v-list>
            <v-list-item
                v-for="tabela in tabelas"
                :key="tabela.nome"
                :title="tabela.title"
                :prepend-icon="tabela.icon"
                @click="currentTable = tabela; drawer = false"
                class="font-tormenta" 
                style="color: #ce2a28;"
            ></v-list-item>
        </v-list>
    </v-navigation-drawer>
    <v-container fluid :width="mdAndUp ? '90%' : '100%'" class="d-flex flex-column justify-center">
            <v-btn class="mb-2 font-tormenta" @click="drawer = true" style="text-align: center; color: #ce2a28;">Tabelas</v-btn>
            <template v-if="currentTable">
                <DataTableItens 
                    :titulo="currentTable.title" 
                    :headers="currentTable.headers" 
                    :items="currentTable.items" 
                    :search="search[currentTable.nome]" 
                    @update:search="search[currentTable.nome] = $event" />
            </template>
    </v-container>
</template>