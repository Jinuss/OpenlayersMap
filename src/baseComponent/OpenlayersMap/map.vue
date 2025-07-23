<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import Map from "ol/Map";
import View from "ol/View";
import * as olProj from "ol/proj";
import OSM from "ol/source/OSM.js";
import TileLayer from "ol/layer/Tile";
import SwipeControl from "../../Control/Swiper";
import {
  ZoomSlider,
  FullScreen,
  ScaleLine,
  ZoomToExtent,
  OverviewMap,
} from "ol/control";
import {
  KeyboardPan,
} from "ol/interaction";
import PrintDialog from "ol-ext/control/PrintDialog";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { v4 as uuidv4 } from "uuid";
import { VECTOR_LAYER, AMAP_LAYER, GOOGLE_LAYER } from "./layers.ts";
import { EXTENT, ZOOM, CENTER } from "./const.map.ts";

const emit = defineEmits(["setMap"]);

const loading = ref(false);

const initMap = () => {
  const overviewMapControl = new OverviewMap({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
  });

  const a = new KeyboardPan({
    pixelDelta: 100,
    duration: 200,
  });
  const amapLayer = AMAP_LAYER();
  const googleLayer = GOOGLE_LAYER;
  const vectorLayer = VECTOR_LAYER();
  const map = new Map({
    layers: [amapLayer, googleLayer, vectorLayer],
    target: "map",
    view: new View({
      center: olProj.fromLonLat(CENTER),
      zoom: ZOOM.INIT,
      minZoom: ZOOM.MIN,
      maxZoom: ZOOM.MAX,
    }),
    /* interactions: interactionDefault().extend([a, new KeyboardZoom()]),*/
  });

  document.addEventListener("keydown", function (event) {
    console.log("Key pressed: ", event.key);
  });
  console.log("🚀 ~ initMap ~ map:", map, a, a.getActive());
  /*  
  map.addInteraction(
    new KeyboardPan({
      pixelDelta: 100,
      duration: 200,
    })
  );
*/
  map.addControl(overviewMapControl);

  map.addControl(new ZoomSlider());

  map.addControl(new FullScreen());

  map.addControl(new ScaleLine());

  map.addControl(new ZoomToExtent({ extent: EXTENT }));
  const swiperControl = new SwipeControl();
  map.addControl(swiperControl);
  try {
    emit("setMap", map);
  } catch {}

  /** 
  map.on("loadstart", () => {
    loading.value = true;
  });

  map.on("loadend", () => {
    loading.value = false;
  });
  */

  const printControl = new PrintDialog({
    lang: "zh",
  });
  printControl.setSize("A4");
  map.addControl(printControl);

  printControl.on(["print", "error"], function (e) {
    // Print success
    if (e.image) {
      const uuid = uuidv4().replace(/-/g, "");
      if (e.pdf) {
        var pdf = new jsPDF({
          orientation: e.print.orientation,
          unit: e.print.unit,
          format: e.print.size,
        });
        pdf.addImage(
          e.image,
          "JPEG",
          e.print.position[0],
          e.print.position[0],
          e.print.imageWidth,
          e.print.imageHeight
        );
        pdf.save(e.print.legend ? "legend.pdf" : `openlayers_${uuid}.pdf`);
      } else {
        // Save image as file
        e.canvas.toBlob(
          function (blob) {
            var name =
              (e.print.legend ? "legend." : `map_${uuid}.`) +
              e.imageType.replace("image/", "");
            saveAs(blob, name);
          },
          e.imageType,
          e.quality
        );
      }
    } else {
      console.warn("No canvas to export");
    }
  });
};

onMounted(() => {
  nextTick(() => {
    initMap();
  });
});
</script>
<template>
  <div id="map" v-loading="loading" tabindex="2"></div>
</template>
<style scoped>
#map {
  height: 100%;
  width: 100%;
}
</style>
