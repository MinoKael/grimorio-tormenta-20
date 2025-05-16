import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { getData } from '../plugins/global';

const base = {
    nome: '',
    tipo: [],
    circulo: [],
    escola: [],
    execucao: [],
    alcance: [],
    alvo: [],
    area: [],
    efeito: [],
    duracao: [],
    resistencia: [],
    referencia: [],
};

export const useFiltrosStore = defineStore('filtros', () => {
    const filtroPesquisa = reactive({ ...base });
    const filtroOpcoes = reactive({
        Tipo: ['Arcana', 'Divina', 'Universal'],
        Círculo: [1, 2, 3, 4, 5],
        Escola: [
            'Abjuração',
            'Adivinhação',
            'Convocação',
            'Encantamento',
            'Evocação',
            'Ilusão',
            'Necromancia',
            'Transmutação',
        ],
        Execução: [
            'Livre',
            'Reação',
            'Padrão',
            'Movimento',
            'Completa',
            'Outros',
        ],
        Alcance: [
            'Pessoal',
            'Toque',
            'Curto',
            'Médio',
            'Longo',
            'Ilimitado',
            'Outros',
        ],
        Alvo: ['Criatura', 'Objeto', 'Você', 'Outros'],
        Área: [
            'Cilindro',
            'Cone',
            'Cubo',
            'Esfera',
            'Linha',
            'Quadrado',
            'Outros',
        ],
        Efeito: ['Efeitos'],
        Duração: [
            'Instantânea',
            'Cena',
            'Sustentada',
            'Descarregada',
            'Outros',
        ],
        Resistência: ['Fortitude', 'Reflexos', 'Vontade', 'Outros'],
        Referência: ['Tormenta 20', 'Dragão Brasil', 'Guia de NPCs','Atlas de Arton', 'Ameaças de Arton', 'Deuses de Arton', 'Heróis de Arton']
    });

    const jsonMagias = ref([]);
    const filteredJson = ref([]);
    const loading = ref(true);

    async function loadMagias() {
        loading.value = true;
        const rawJson = await getData(import.meta.env.VITE_MAGIAS_API_URL) || [];
        jsonMagias.value = rawJson.sort((a,b) => {
            const nomeA = a.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
            const nomeB = b.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
            if(nomeA < nomeB){
                return -1;
            }
            if(nomeA > nomeB){
                return 1;
            }
            return 0;
        });
        filteredJson.value = jsonMagias.value;
        loading.value = false;
    }

    function resetFiltro() {
        Object.keys(base).forEach((key) => {
            filtroPesquisa[key] = base[key];
        });
        filterMagias();
    }

    function stringSearch(input, filter) {
        if (!filter || filter.trim() === '') {
            return true;
        }
        return normalizeString(input).includes(normalizeString(filter));
    }

    function normalizeString(string) {
        if (string == null) return '';
        if (Number.isInteger(string)) return string.toString();
        return string
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s/g, '')
            .toLowerCase();
    }

    function filterMagias() {
        filteredJson.value = jsonMagias.value.filter((magia) => {
          return (
            stringSearch(magia.nome, filtroPesquisa.nome) &&
            applyFilter(
              filtroPesquisa.alcance,
              magia.alcance,
              filtroOpcoes.Alcance
            ) &&
            applyFilter(
              filtroPesquisa.alvo,
              magia.alvo,
              filtroOpcoes.Alvo
            ) &&
            applyFilter(
              filtroPesquisa.area,
              magia.area,
              filtroOpcoes.Área
            ) &&
            applyFilter(filtroPesquisa.circulo, magia.circulo) &&
            applyFilter(
              filtroPesquisa.duracao,
              magia.duracao,
              filtroOpcoes.Duração
            ) &&
            applyFilter(
              filtroPesquisa.efeito,
              magia.efeito,
              filtroOpcoes.Efeito,
              true
            ) &&
            applyFilter(filtroPesquisa.escola, magia.escola) &&
            applyFilter(
              filtroPesquisa.execucao,
              magia.execucao,
              filtroOpcoes.Execução
            ) &&
            applyFilter(
              filtroPesquisa.resistencia,
              magia.resistencia,
              filtroOpcoes.Resistência
            ) &&
            applyFilter(filtroPesquisa.tipo, magia.tipo)
            &&
            applyFilter(
              filtroPesquisa.referencia,
              magia.referencia,
              filtroOpcoes.Referencia)
          );
        });
    }

    function applyFilter(
        filterValues,
        magiaProperty,
        filterOptions,
        isTipoEfeito
    ) {
        if (isTipoEfeito) {
            return (
                filterValues.length === 0 ||
                (filterValues.length === 1 &&
                    filterValues[0] === 'Efeitos' &&
                    magiaProperty !== null)
            );
        }
        return (
            filterValues.length === 0 ||
            filterValues.some((x) =>
                normalizeString(magiaProperty).includes(normalizeString(x))
            ) ||
            (filterValues.includes('Outros') &&
                magiaProperty !== null &&
                !filterOptions.some((x) =>
                    normalizeString(magiaProperty).includes(normalizeString(x))
                ))
        );
    }

    return {
        loadMagias,
        loading,
        filterMagias,
        filteredJson,
        jsonMagias,
        resetFiltro,
        normalizeString,
        filtroPesquisa,
        filtroOpcoes,
    };
});
