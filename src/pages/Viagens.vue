<script setup>
import { ref, computed } from 'vue'

const distancia = ref(100)
const deslocamentoCustom = ref(9)

const calcularDias = (deslocamento, forçada = false) => {
  if (!distancia.value || distancia.value <= 0) return '0'
  
  let kmDia = deslocamento * 4
  
  if (forçada) kmDia *= 2

  const dias = distancia.value / kmDia
  return dias.toFixed(1).replace('.', ',')
}

const resultados = computed(() => {
  let lista = [
    { label: 'A pé (Normal)', icon: 'mdi-walk', desc: 'Deslocamento 9m (36km/dia)', tempo: calcularDias(9) },
    { label: 'Carroça / Carga', icon: 'mdi-horse-variant', desc: 'Deslocamento 7,5m (30km/dia)', tempo: calcularDias(7.5) },
    { label: 'Cavalo (Trote)', icon: 'mdi-horse', desc: 'Deslocamento 12m (48km/dia)', tempo: calcularDias(12) },
    { label: 'Marcha Forçada', icon: 'mdi-lightning-bolt', desc: 'Ritmo Dobrado (9m -> 72km/dia)', tempo: calcularDias(9, true) },
    { label: 'Customizado', icon: 'mdi-shoe-print', desc: `Baseado em ${deslocamentoCustom.value}m`, tempo: calcularDias(deslocamentoCustom.value) },
    { label: 'Custom. (Marcha Forçada)', icon: 'mdi-run-fast', desc: 'Ritmo acelerado', tempo: calcularDias(deslocamentoCustom.value, true) }
  ];
  return lista;
})
</script>

<template>
  <v-container class="travel-calculator py-8">
    <v-card class="mx-auto" max-width="600">
      <v-card-text class="pt-6">
        <v-row>
          <v-col cols="12">
            <v-number-input
              v-model.number="distancia"
              :reverse="false"
              controlVariant="default"
              label="Distância Total (km)"
              :hideInput="false"
              inset
              variant="outlined"
              control-variant="split"
              hint="Insira a distância total da jornada"
              persistent-hint
            ></v-number-input>
          </v-col>

          <v-col cols="12">
            <v-slider
              v-model="deslocamentoCustom"
              :min="1.5"
              :max="90"
              :step="1.5"
              label="Deslocamento  Customizado(m)"
              color="tormentaText"
              thumb-label="always"
            ></v-slider>
          </v-col>
        </v-row>

        <v-list>
          <v-list-subheader class="text-uppercase font-weight-black font-tormenta" color="tormentaText">Estimativas de Tempo</v-list-subheader>
          
          <template v-for="item in resultados" :key="item.label">
            <v-list-item :prepend-icon="item.icon">
              <v-list-item-title class="font-weight-bold font-tormenta">{{ item.label }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.desc }}</v-list-item-subtitle>
              <template v-slot:append>
                <div class="text-right">
                  <span class="text-h6 font-weight-black font-tormenta" >{{ item.tempo }}</span>
                  <div class="text-caption">Dias de viagem</div>
                </div>
              </template>
            </v-list-item>
            <v-divider inset></v-divider>
          </template>
        </v-list>
      </v-card-text>

      <v-footer class="text-caption pa-4">
        *Cálculos baseados em 8 horas de marcha por dia. Em caso de marcha forçada, a distância por hora dobra, mas a cada hora o personagem deve passar em um teste de Fortitude (CD 15 +1 por teste anterior) ou perde 1d6 pontos de vida.
      </v-footer>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>