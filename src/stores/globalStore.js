import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGlobalStore = defineStore('globalStore', () => {
    const currentTab = ref(1);
    
    function setCurrentTab(tab) {
        currentTab.value = tab;
    };

    function normalizeString(string) {
        if (string == null) return '';
        if (Number.isInteger(string)) return string.toString();
        return string
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s/g, '')
            .toLowerCase();
    }

    return {
        currentTab,
        setCurrentTab,
        normalizeString
    }
})