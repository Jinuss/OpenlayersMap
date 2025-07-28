import { defineStore } from "pinia";
import { Map } from "ol";

export interface MapState {
  map: Map | Object | null;
  mode: string;
  showGrid: boolean;
  showWaterMarker: boolean;
  showSwipe: boolean;
}

export const useMapStore = defineStore("mapStore", {
  state: (): MapState => {
    return {
      map: {},
      mode: "2D",
      showGrid: false,
      showWaterMarker: false,
      showSwipe: false,
    };
  },
  actions: {
    setMap(map: Object) {
      this.map = map;
    },
    setMapMode(mode: string) {
      this.mode = mode;
      return { mode };
    },
    setShowGrid(visible: boolean) {
      this.showGrid = visible;
    },
  },
});
