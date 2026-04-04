<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { getData } from '../plugins/global.js';

const itens = reactive({
  armas: { data: [] },
  armaduras_escudos: { data: [] },
  itens_gerais: { data: [] },
  itens_superiores: { melhorias: [], material_especial: [] },
  itens_magicos: { 
    armas: { encantos: [] }, 
    armaduras_escudos: { encantos: [] },
    acessorios: { encantos: [] },
    esotericos: { encantos: [] }
  },
});

const itensBase = computed(() => {
  const listaArmas = itens.armas.data || [];
  const listaArmaduras = itens.armaduras_escudos.data || [];
  const listaGerais = (itens.itens_gerais.data || []).filter(d => 
    ['Esotéricos', 'Instrumentos Musicais', 'Vestuário', 'Ferramentas'].includes(d.grupo)
  );
  return [...listaArmas, ...listaArmaduras, ...listaGerais];
});

const listaMelhorias = computed(() =>  itens.itens_superiores?.melhorias || []);

const listaMateriasEspeciais = computed(() => itens.itens_superiores.material_especial || []);

const listaEncantos = computed(() => {
  const m = itens.itens_magicos;
  return [
    ...(m.armas?.encantos || []),
    ...(m.armaduras_escudos?.encantos || []),
    ...(m.acessorios?.encantos || []),
    ...(m.esotericos?.encantos || [])
  ];
});

const selecionadoBase = ref(null)
const selecionadasMelhorias = ref([])
const selecionadoMaterialEspecial = ref(null)
const selecionadosEncantos = ref([])

watch(selecionadasMelhorias, (newVal) => {
  if (!newVal.some(m => m.nome === 'Material Especial')) {
    selecionadoMaterialEspecial.value = null;
  }
});

const nomeDinamico = computed(() => {
  if (!selecionadoBase.value) return '';
  let partes = [selecionadoBase.value.nome.toLowerCase()];
  
  if (selecionadoMaterialEspecial.value) {
    partes.push(`de ${selecionadoMaterialEspecial.value.nome.toLowerCase()}`);
  }

  selecionadasMelhorias.value.forEach(m => {
    if (m.nome !== 'Material Especial') partes.push(m.nome.toLowerCase());
  });

  selecionadosEncantos.value.forEach(e => {
    partes.push(e.nome.toLowerCase());
  });

  return partes.join(' ');
});

const extrairPrecoMaterial = (material, itemBase) => {
  if (!material || !itemBase) return 0;
  let textoBusca = "";
  const grupo = itemBase.grupo || "";

  if (grupo.includes("Armas")) textoBusca = material.arma;
  else if (grupo.includes("Armaduras") || grupo.includes("Escudos")) textoBusca = material.armadura_escudo;
  else if (grupo.includes("Esotéricos")) textoBusca = material.esoterico;

  if (!textoBusca) return 0;

  if (grupo === "Armaduras Pesadas") {
    const matchPesada = textoBusca.match(/Armadura pesada \+ T\$ ([\d.]+)/);
    if (matchPesada) return parseInt(matchPesada[1].replace(/\./g, ''));
  } 
  if (grupo === "Armaduras Leves" || grupo === "Escudos") {
    const matchLeve = textoBusca.match(/(?:Armadura leve|Escudo) \+ T\$ ([\d.]+)/);
    if (matchLeve) return parseInt(matchLeve[1].replace(/\./g, ''));
  }

  const matchGenerico = textoBusca.match(/\+ T\$ ([\d.]+)/);
  return matchGenerico ? parseInt(matchGenerico[1].replace(/\./g, '')) : 0;
};

const calcularFinanceiro = computed(() => {
  if (!selecionadoBase.value) return null;
  const precoBase = parseInt(selecionadoBase.value.preco.replace(/\D/g, '')) || 0;
  const tabelaM = [0, 300, 3000, 9000, 18000];
  const nMelhorias = selecionadasMelhorias.value.length;
  const custoM = nMelhorias <= 4 ? (tabelaM[nMelhorias] || 0) : 18000 + ((nMelhorias - 4) * 9000);
  const cdM = nMelhorias * 5;
  const custoMat = extrairPrecoMaterial(selecionadoMaterialEspecial.value, selecionadoBase.value);
  const tabelaE = [0, 18000, 36000, 72000];
  const nEncantos = selecionadosEncantos.value.length;
  const custoE = nEncantos <= 3 ? (tabelaE[nEncantos] || 0) : 72000 + ((nEncantos - 3) * 36000);
  const cdE = nEncantos > 0 ? (10 + (nEncantos - 1) * 5) : 0;
  const total = precoBase + custoM + custoE + custoMat;
  
  return {
    total: `T$ ${total.toLocaleString('pt-BR')}`,
    fabricacao: `T$ ${Math.floor(total / 3).toLocaleString('pt-BR')}`,
    cd: 15 + cdM + cdE,
    valorMaterial: custoMat > 0 ? `+ T$ ${custoMat.toLocaleString('pt-BR')}` : null
  }
});

onMounted(async () => {
  try {
    const data = await getData(import.meta.env.VITE_ITENS_API_URL);
    Object.assign(itens, data);
  } catch (e) {
    console.error("Erro ao carregar itens:", e);
  }
});
</script>

<template>
  <v-container class="builder-container py-10">
    <v-row>
      <v-col cols="12" md="5">
        <v-card variant="outlined" class="pa-4 mb-4 border-red">
          <div class="text-h6 mb-4 font-weight-black text-uppercase text-red-darken-4">Configuração</div>
          <v-autocomplete v-model="selecionadoBase" :items="itensBase" item-title="nome" return-object label="Item Base" variant="filled" class="mb-2" />
          <v-autocomplete v-model="selecionadasMelhorias" :items="listaMelhorias" :item-title="(e)=>e.nome + ' | ' + '(' + e.grupo + ')'" :item-value="(e)=>e.nome+e.grupo" return-object label="Melhorias (Superiores)" multiple chips closable-chips variant="outlined" class="mb-2" />
          <v-expand-transition>
            <v-autocomplete v-if="selecionadasMelhorias.some(m => m.nome === 'Material Especial')" v-model="selecionadoMaterialEspecial" :items="listaMateriasEspeciais" item-title="nome" return-object label="Material Especial" variant="outlined" color="amber-darken-4" class="mb-2" />
          </v-expand-transition>
          <v-autocomplete v-model="selecionadosEncantos" :items="listaEncantos" :item-title="(e)=>e.nome + ' | ' + '(' + e.grupo + ')'"return-object label="Encantos (Mágicos)" multiple chips closable-chips variant="outlined" />
        </v-card>
        <v-card v-if="calcularFinanceiro" color="grey-darken-4" theme="dark">
          <v-card-text>
            <v-row no-gutters align="center">
              <v-col cols="7">
                <div class="text-caption text-grey">PREÇO TOTAL</div>
                <div class="text-h5 font-weight-bold text-amber">{{ calcularFinanceiro.total }}</div>
                <div v-if="calcularFinanceiro.valorMaterial" class="text-caption text-amber-lighten-3">Material: {{ calcularFinanceiro.valorMaterial }}</div>
              </v-col>
              <v-col cols="5" class="text-right">
                <div class="text-caption text-grey">CD OFÍCIO</div>
                <v-chip color="red-darken-4" size="large" label class="text-h6 font-weight-black">{{ calcularFinanceiro.cd }}</v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card v-if="selecionadoBase" elevation="8" class="item-sheet">
          <v-toolbar color="red-darken-4" density="compact">
            <v-toolbar-title class="text-uppercase font-weight-black">{{ nomeDinamico }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div class="mb-4">
              <div class="d-flex justify-space-between border-bottom pb-1 mb-2">
                <span class="text-button text-red-darken-4 font-weight-bold">Descrição</span>
                <span class="text-caption grey--text">{{ selecionadoBase.grupo }}</span>
              </div>
              <p class="text-body-2 font-italic">{{ selecionadoBase.descricao }}</p>
            </div>
            <div v-if="selecionadoMaterialEspecial" class="mb-4 pa-3 bg-amber-lighten-5 rounded border-amber">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="font-weight-black text-amber-darken-4 text-uppercase">Material: {{ selecionadoMaterialEspecial.nome }}</span>
                <v-spacer />
                <v-chip size="x-small" color="amber-darken-4" variant="flat">Material Especial</v-chip>
              </div>
              <p class="text-caption text-grey-darken-3 mb-2">{{ selecionadoMaterialEspecial.descricao }}</p>
              <v-divider class="mb-2" />
              <div class="text-body-2 font-weight-medium">
                <v-icon size="small" color="amber-darken-4">mdi-sparkles</v-icon>
                <span v-if="selecionadoBase.grupo.includes('Armas')"> {{ selecionadoMaterialEspecial.arma }}</span>
                <span v-else-if="selecionadoBase.grupo.includes('Armaduras') || selecionadoBase.grupo.includes('Escudos')"> {{ selecionadoMaterialEspecial.armadura_escudo }}</span>
                <span v-else-if="selecionadoBase.grupo.includes('Esotéricos')"> {{ selecionadoMaterialEspecial.esoterico }}</span>
              </div>
            </div>
            <div v-if="selecionadasMelhorias.length" class="mt-4">
              <div class="text-button text-amber-darken-4 border-bottom mb-2 d-block font-weight-bold">Melhorias</div>
              <v-expansion-panels variant="accordion" multiple>
                <v-expansion-panel v-for="m in selecionadasMelhorias" :key="m.nome">
                  <v-expansion-panel-title class="font-weight-bold">
                    {{ m.nome }} <v-spacer />
                    <v-chip size="x-small" color="grey-lighten-1" class="mr-1" variant="outlined">{{ m.grupo }}</v-chip>
                    <v-chip size="x-small" color="amber-darken-4" variant="flat">{{ m.efeito }}</v-chip>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="text-body-2 grey-text">{{ m.descricao }}</v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
            <div v-if="selecionadosEncantos.length" class="mt-6">
              <div class="text-button text-purple-darken-1 border-bottom mb-2 d-block font-weight-bold">Encantos</div>
              <v-expansion-panels variant="accordion" multiple>
                <v-expansion-panel v-for="e in selecionadosEncantos" :key="e.nome">
                  <v-expansion-panel-title class="font-weight-bold text-purple-darken-1">
                    {{ e.nome }} <v-spacer />
                    <v-chip size="x-small" color="grey-lighten-1" class="mr-1" variant="outlined">{{ e.grupo }}</v-chip>
                    <v-chip v-if="e.efeito" size="x-small" color="purple-darken-1" variant="outlined">{{ e.efeito }}</v-chip>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text class="text-body-2"><div v-html="e.descricao"></div></v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </v-card-text>
        </v-card>
        <v-alert v-else type="info" variant="tonal" icon="mdi-anvil" class="mt-4">O ferreiro aguarda suas instruções. Selecione um item base para começar.</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.border-bottom { border-bottom: 2px solid #e0e0e0; }
.item-sheet { border: 2px solid #b71c1c; border-radius: 8px; }
.border-red { border-color: #b71c1c !important; }
.border-amber { border: 1px solid #ffb300; }
</style>