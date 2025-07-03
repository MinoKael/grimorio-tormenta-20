<script setup>
import { ref, toRefs, onMounted, reactive, computed } from 'vue';
import { getData } from '../plugins/global.js';
import DataTableItens from '../components/DataTableItens.vue';
import { useDisplay } from 'vuetify';
import { useGlobalStore } from '../stores/globalStore.js';
const globalStore = useGlobalStore();
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
    encantos: '',
    itens_magicos: ''
});
const currentTable = ref(null);
const radio = ref('armas');

const tabelas = reactive([
    {
        nome: 'armas',
        title: 'Armas',
        icon: 'mdi-sword',
        headers: [
            { title: '', key: 'data-table-expand'},
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
                        item.referencia,
                        item.descricao
                    ].some(value =>
                        globalStore.normalizeString(value).includes(globalStore.normalizeString(searchTerm)));
                });
        })
    },
    {
        nome: 'armaduras_escudos',
        title: 'Armaduras e Escudos',
        icon: 'mdi-shield-half-full',
        headers: [
            { title: '', key: 'data-table-expand'},
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
                        item.referencia,
                        item.descricao
                    ].some(value =>
                        globalStore.normalizeString(value).includes(globalStore.normalizeString(searchTerm)));
                });
        })
    },
    {
        nome: 'itens_gerais',
        title: 'Itens Gerais',
        icon: 'mdi-sack',
        headers: [
            { title: '', key: 'data-table-expand'},
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
                        item.referencia,
                        item.descricao
                    ].some(value =>
                        globalStore.normalizeString(value).includes(globalStore.normalizeString(searchTerm)));
                });
        })
    }
]);

const headersMelhorias = [
    { title: '', key: 'data-table-expand'},
    { title: 'Nome', key: 'nome', align: 'start' },
    { title: 'Efeito', key: 'efeito', align: 'start' },
    { title: 'Referência', key: 'referencia', align: 'start' }
];

const headersMaterialEspecial = [
    { title: '', key: 'data-table-expand'},
    { title: 'Nome', key: 'nome', align: 'start' },
    { title: 'Arma', key: 'arma', align: 'start' },
    { title: 'Armadura e Escudo', key: 'armadura_escudo', align: 'start' },
    { title: 'Esotérico', key: 'esoterico', align: 'start' },
    { title: 'Referência', key: 'referencia', align: 'start' }
];

const encantosMagicos = computed(() => {
    const categorias = ['armas', 'armaduras_escudos', 'acessorios', 'esotericos'];
    let todos = [];
    categorias.forEach(cat => {
        const encantos = itens_magicos.value[cat]?.encantos || [];
        todos.push(...encantos);
    });
    return todos;
});

const especificosMagicos = computed(() => {
    const categorias = ['armas', 'armaduras_escudos', 'acessorios', 'esotericos'];
    let todos = [];
    categorias.forEach(cat => {
        const especificos = itens_magicos.value[cat]?.especificos || itens_magicos.value[cat]?.especificas || [];
        todos.push(...especificos);
    });
    return todos;
});


function criarTabela(nome, titulo, icone, headers, dataSourceRef, searchKey) {
    return {
        nome,
        title: titulo,
        icon: icone,
        headers,
        items: computed(() => {
            const data = dataSourceRef || [];
            const searchTerm = search[searchKey]?.toUpperCase() || '';
            return data
                .slice()
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .filter(item => {
                    if (!searchTerm) return true;
                    return Object.values(item).some(value =>
                        globalStore.normalizeString(value).includes(globalStore.normalizeString(searchTerm))
                    );
                });
        })
    };
}

onMounted(async () => {
    const data = await getData(import.meta.env.VITE_ITENS_API_URL);
    Object.assign(itens, data);

    tabelas.push(
        criarTabela('melhorias', 'Melhorias', 'mdi-hammer-screwdriver', headersMelhorias, itens_superiores.value.melhorias, 'melhorias'),
        criarTabela('material_especial', 'Materiais Especiais', 'mdi-diamond-stone', headersMaterialEspecial, itens_superiores.value.material_especial, 'material_especial'),
        {
            nome: 'encantos',
            title: 'Encantos',
            icon: 'mdi-star-four-points',
            headers: [
                { title: '', key: 'data-table-expand' },
                { title: 'Nome', key: 'nome', align: 'start' },
                { title: 'Referência', key: 'referencia', align: 'start' }
            ],
            items: computed(() => {
                const searchTerm = search.encantos?.toUpperCase() || '';
                return encantosMagicos.value.filter(item =>
                    !searchTerm ||
                    [item.nome, item.tipo, item.efeito, item.preco, item.referencia]
                        .some(value => globalStore.normalizeString(value).includes(globalStore.normalizeString(searchTerm)))
                );
            })
        },
        {
            nome: 'itens_magicos',
            title: 'Itens Mágicos',
            icon: 'mdi-crystal-ball',
            headers: [
                { title: '', key: 'data-table-expand' },
                { title: 'Nome', key: 'nome', align: 'start' },
                { title: 'Categoria', key: 'categoria', align: 'start' },
                { title: 'Preço', key: 'preco', align: 'start' },
                { title: 'Referência', key: 'referencia', align: 'start' }
            ],
            items: computed(() => {
                const searchTerm = search.itens_magicos?.toUpperCase() || '';
                return especificosMagicos.value.filter(item =>
                    !searchTerm ||
                    [item.nome, item.tipo, item.descricao, item.preco, item.referencia]
                        .some(value => globalStore.normalizeString(value).includes(globalStore.normalizeString(searchTerm)))
                );
            })
        }
    );

    currentTable.value = tabelas[0]
})
</script>

<template>
    <v-container fluid :width="mdAndUp ? '90%' : '100%'" class="d-flex flex-column justify-center align-center">
            <v-radio-group inline v-model="radio" class="center">
                <v-radio v-for="tabela in tabelas" 
                    :key="tabela.nome"
                    :label="tabela.title"
                    :value="tabela.nome"                
                    :prepend-icon="tabela.icon"
                    class="font-tormenta" 
                    style="color: #ce2a28;"
                    @click="currentTable = tabela"
                ></v-radio>
            </v-radio-group>
            <template v-if="currentTable">
                <DataTableItens 
                    :titulo="currentTable.title" 
                    :headers="currentTable.headers" 
                    :items="currentTable.items" 
                    :search="search[currentTable.nome]" 
                    @update:search="search[currentTable.nome] = $event" />
            </template>
            <div v-if="currentTable?.title == 'Armas'" style="width: 100%;">
                <v-row no-gutters style="width: 100%;">
                    <v-card class="mt-4" width="100%" flat>
                        <v-expansion-panels multiple>
                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-tormenta text-h5" style="text-align: center; color: #ce2a28;">
                                    Tabela Dano de Armas
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <div v-html="armas?.tabela_dano_armas"></div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                            <v-expansion-panel>
                                <v-expansion-panel-title class="font-tormenta text-h5" style="text-align: center; color: #ce2a28;">
                                    Habilidades de Armas
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-data-table :items="armas?.habilidades" :headers="[
                                        { title: 'Nome', key: 'nome', align: 'start' },
                                        { title: 'Descrição', key: 'descricao', align: 'start' },
                                        { title: 'Referência', key: 'referencia', align: 'start' }
                                    ]" item-value="nome" :items-per-page="-1" hide-default-footer fixed-header
                                    >
                                        <template v-slot:item.descricao="{ item }">
                                            <span v-html="item.descricao"></span>
                                        </template>
                                    </v-data-table>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-card>
                </v-row>
            </div>
    </v-container>
</template>
<style scoped>
.center >>> .v-selection-control-group--inline {
    justify-content: center;
}
</style>