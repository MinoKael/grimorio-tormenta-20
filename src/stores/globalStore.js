import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGlobalStore = defineStore('globalStore', () => {
    const currentTab = ref(1);
    
    function setCurrentTab(tab) {
        currentTab.value = tab;
    };

    return {
        currentTab,
        setCurrentTab
    }
})