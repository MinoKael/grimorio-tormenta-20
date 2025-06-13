<script setup>
import { reactive, defineProps, onMounted } from 'vue';
const {
    headers,
    items,
    titulo,
    search
} = defineProps({
    headers: {
        type: Array,
        required: true,
        default: () => ([])
    },
    items: {
        type: Array,
        required: true,
        default: () => ([])
    },
    titulo: {
        type: String,
        default: 'Tabela de Itens'
    },
    search: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:search']);

const groupControls = reactive({})

function expandAll() {
    Object.values(groupControls).forEach((header) => {
        header.toggleGroup(header.item)
    });
}
</script>
<template>
    <v-data-table :headers="headers" :items="items" :items-per-page="-1" hide-default-footer
        item-value="nome" fixed-header hover show-expand expand-on-click density="compact" :group-by="[{ key: 'grupo' }]"
        style="max-height: 800px;"
    >
        <template v-slot:top>
            <v-toolbar flat color="transparent">
                <v-toolbar-title class="font-tormenta text-h4" style="text-align: center; color: #ce2a28;">
                    {{ titulo }}
                </v-toolbar-title>
            </v-toolbar>
            <v-text-field :model-value="search" @update:model-value="(val) => emit('update:search', val)"
                density="compact" variant="outlined" placeholder="Buscar em todas as colunas..." class="mt-1 px-2" clearable
                @click:clear="emit('update:search', '')"></v-text-field>
        </template>

        <template v-slot:header.data-table-group>
            <div @click="expandAll" style="cursor: pointer;" class="d-flex align-center">Grupos<v-icon class="ml-1" size="x-small">mdi-expand-all-outline</v-icon></div>
        </template>

        <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
            <template :ref="() => { groupControls[item.value] = { item, toggleGroup, isGroupOpen } }" />
            <tr>
                <td :colspan="columns.length">
                    <div class="d-flex align-center" @click="toggleGroup(item)" style="cursor: pointer;">
                        <v-btn :icon="isGroupOpen(item) ? '$expand' : '$next'" color="medium-emphasis"
                            density="comfortable" size="small" variant="outlined"></v-btn>
                        <span class="ms-4">{{ item.value }}</span>
                    </div>
                </td>
            </tr>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
            <tr>
                <td :colspan="columns.length" class="py-2">
                    <v-sheet class="d-flex align-center justify-center text-center pa-2">
                        <p class="text-body-1 text-wrap" v-html="item.descricao"></p>
                    </v-sheet>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>
<style scoped>
.v-toolbar-title {
    margin-inline-start: 0 !important;
}
</style>