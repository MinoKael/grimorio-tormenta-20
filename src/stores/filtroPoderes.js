import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { getData } from '../plugins/global';

const base = {
    nome: '',
    texto: '',
    tags: [],
    referencia: [],
};

const PREDEFINED_TAGS = [
    { name: "Poder Geral", value: "poder_geral" },
    { name: "Poder de Classe", value: "poder_classe" },
    { name: "Poder de Combate", value: "poder_combate" },
    { name: "Poder de Destino", value: "poder_destino" },
    { name: "Poder de Magia", value: "poder_magia" },
    { name: "Poder Concedido", value: "poder_concedido" },
    { name: "Poder de Aprimoramento", value: "poder_aprimoramento" },
    { name: "Poder da Tormenta", value: "poder_tormenta" },
    { name: "Poder de Origem", value: "poder_origem" },
    { name: "Habilidade de Raça", value: "habilidade_raca" },
    { name: "Habilidade de Classe", value: "habilidade_classe" },
    { name: "Efeito Mágico", value: "efeito_magico" },
    { name: "Efeito de Medo", value: "efeito_medo" },
    { name: "Efeito Mental", value: "efeito_mental" },
    { name: "Efeito de Veneno", value: "efeito_veneno" },
    { name: "Aharadak", value: "aharadak" },
    { name: "Allihanna", value: "allihanna" },
    { name: "Arsenal", value: "arsenal" },
    { name: "Azgher", value: "azgher" },
    { name: "Hyninn", value: "hyninn" },
    { name: "Kallyadranoch", value: "kallyadranoch" },
    { name: "Khalmyr", value: "khalmyr" },
    { name: "Lena", value: "lena" },
    { name: "Lin-Wu", value: "lin_wu" },
    { name: "Marah", value: "marah" },
    { name: "Megalokk", value: "megalokk" },
    { name: "Nimb", value: "nimb" },
    { name: "Oceano", value: "oceano" },
    { name: "Sszzaas", value: "sszzaas" },
    { name: "Tanna-Toh", value: "tanna_toh" },
    { name: "Tenebra", value: "tenebra" },
    { name: "Thwor", value: "thwor" },
    { name: "Thyatis", value: "thyatis" },
    { name: "Valkaria", value: "valkaria" },
    { name: "Wynna", value: "wynna" },
    { name: "Humano", value: "humano" },
    { name: "Anão", value: "anao" },
    { name: "Dahllan", value: "dahllan" },
    { name: "Elfo", value: "elfo" },
    { name: "Goblin", value: "goblin" },
    { name: "Lefou", value: "lefou" },
    { name: "Minotauro", value: "minotauro" },
    { name: "Qareen", value: "qareen" },
    { name: "Golem", value: "golem" },
    { name: "Hynne", value: "hynne" },
    { name: "Kliren", value: "kliren" },
    { name: "Medusa", value: "medusa" },
    { name: "Osteon", value: "osteon" },
    { name: "Sereia/Tritão", value: "sereia_tritao" },
    { name: "Sílfide", value: "silfide" },
    { name: "Suraggel", value: "suraggel" },
    { name: "Aggelus", value: "aggelus" },
    { name: "Sulfure", value: "sulfure" },
    { name: "Trog", value: "trog" },
    { name: "Arcanista", value: "arcanista" }, 
    { name: "Bárbaro", value: "barbaro" }, 
    { name: "Bardo", value: "bardo" }, 
    { name: "Bucaneiro", value: "bucaneiro" }, 
    { name: "Caçador", value: "cacador" }, 
    { name: "Cavaleiro", value: "cavaleiro" }, 
    { name: "Clérigo", value: "clerigo" },
    { name: "Druida", value: "druida" }, 
    { name: "Guerreiro", value: "guerreiro" }, 
    { name: "Inventor", value: "inventor" }, 
    { name: "Ladino", value: "ladino" }, 
    { name: "Lutador", value: "lutador" }, 
    { name: "Nobre", value: "nobre" }, 
    { name: "Paladino", value: "paladino" },
    { name: "Bugbear", value: "bugbear" },
    { name: "Centauro", value: "centauro" },
    { name: "Ceratops", value: "ceratops" },
    { name: "Elfo-do-mar", value: "elfo_mar" },
    { name: "Finntroll", value: "finntroll" },
    { name: "Gnoll", value: "gnoll" },
    { name: "Golem", value: "golem" },
    { name: "Harpia", value: "harpia" },
    { name: "Hobgoblin", value: "hobgoblin" },
    { name: "Kallyanach", value: "kallyanach" },
    { name: "Kaijin", value: "kaijin" },
    { name: "Kappa", value: "kappa" },
    { name: "Kobolds", value: "kobolds" },
    { name: "Mashin", value: "mashin" },
    { name: "Meio-orc", value: "meio_orc" },
    { name: "Minauro", value: "minauro" },
    { name: "Moreau", value: "moreau" },
    { name: "Nagah", value: "nagah" },
    { name: "Nezumi", value: "nezumi" },
    { name: "Ogro", value: "ogro" },
    { name: "Orc", value: "orc" },
    { name: "Pteros", value: "pteros" },
    { name: "Soterrado", value: "soterrado" },
    { name: "Tabrachi", value: "tabrachi" },
    { name: "Tengu", value: "tengu" },
    { name: "Trog Anão", value: "trog_anao" },
    { name: "Velocis", value: "velocis" },
    { name: "Voracis", value: "voracis" },
    { name: "Yidishan", value: "yidishan" },
    { name: "Herança Coruja", value: "heranca_coruja" },
    { name: "Herança Hiena", value: "heranca_hiena" },
    { name: "Herança Raposa", value: "heranca_raposa" },
    { name: "Herança Serpente", value: "heranca_serpente" },
    { name: "Herança Búfalo", value: "heranca_bufalo" },
    { name: "Herança Coelho", value: "heranca_coelho" },
    { name: "Herança Crocodilo", value: "heranca_crocodilo" },
    { name: "Herança Gato", value: "heranca_gato" },
    { name: "Herança Leão", value: "heranca_leao" },
    { name: "Herança Lobo", value: "heranca_lobo" },
    { name: "Herança Morcego", value: "heranca_morcego" },
    { name: "Herança Urso", value: "heranca_urso" },
    { name: "Benthos, Dragão Rei dos Mares", value: "benthos" },
    { name: "Gwendolynn Libertadora", value: "gwendolynn" },
    { name: "Hippion, Deus Menor dos Cavalos", value: "hippion" },
    { name: "Inghlblhpholstgt, Grande Deus Sapo", value: "deus_sapo" },
];

export const useFiltroPoderesStore = defineStore('filtroPoderes', () => {
    const filtroPesquisa = reactive({ ...base });
    const jsonPoderes = ref([]);
    const filteredJson = ref([]);
    const loading = ref(true);

    async function loadPoderes() {
        loading.value = true;
        const rawJson = await getData(import.meta.env.VITE_PODERES_API_URL) || [];
        jsonPoderes.value = rawJson.sort((a,b) => {
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
        filteredJson.value = jsonPoderes.value;
        loading.value = false;
    }

    function resetFiltro() {
        Object.keys(base).forEach((key) => {
            filtroPesquisa[key] = base[key];
        });
        filterPoderes();
    }

    const filtroOpcoes = reactive({
        Tags: PREDEFINED_TAGS,
        Referência: ['Tormenta 20', 'Dragão Brasil', 'Guia de NPCs','Atlas de Arton', 'Ameaças de Arton', 'Deuses de Arton', 'Heróis de Arton', 'Guia de Deuses Menores']
    });

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
    function filterPoderes() {
        filteredJson.value = jsonPoderes.value.filter((poder) => {
          return (
            stringSearch(poder.nome, filtroPesquisa.nome) &&
            new RegExp(normalizeString(filtroPesquisa.texto), 'i').test(poder.texto) &&
            applyFilterArray(filtroPesquisa.tags, poder.tags) &&
            applyFilter(filtroPesquisa.referencia, poder.referencia)
          );
        });
    };

    function applyFilter(filterValues, poderProperty) {
        if (filterValues.length === 0) return true;
        return filterValues.some((x) => normalizeString(poderProperty).includes(normalizeString(x)))
    }
    function applyFilterArray(filterValues, poderProperty) {
        if (filterValues.length === 0) return true;

        if (!Array.isArray(poderProperty)) return false;

        return filterValues.some((x) => poderProperty.includes(x));
    }
    function convertTag(tag) {
        const predefinedTag = PREDEFINED_TAGS.find(t => t.value === tag);
        return predefinedTag ? predefinedTag.name : tag;
    }

    return {
        loadPoderes,
        loading,
        filterPoderes,
        filteredJson,
        jsonPoderes,
        resetFiltro,
        normalizeString,
        filtroPesquisa,
        filtroOpcoes,
        convertTag
    };
})