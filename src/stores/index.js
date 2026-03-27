// Pinia
import useSetDataStore from "@/stores/setData";
import useSiteDataStore from "@/stores/siteData";
import useStatusDataStore from "@/stores/statusData";

export const setStore = (pinia) => useSetDataStore(pinia);
export const siteStore = (pinia) => useSiteDataStore(pinia);
export const statusStore = (pinia) => useStatusDataStore(pinia);
