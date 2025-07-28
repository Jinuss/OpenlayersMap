<script setup>
import { toRaw } from "vue";
import { storeToRefs } from "pinia";
import { Graticule } from "ol/layer";
import { useMapStore } from "../../../store/index";
import {
  GRID_LAYER,
  LAYER_NAMES,
} from "../../../baseComponent/OpenlayersMap/layers";
import SwipeControl from "../../../Control/Swiper";

const mapStore = useMapStore();

const { showSwipe, map } = storeToRefs(mapStore);

let swipeLayer;

const getLayer = () => {
  const mapInstance = toRaw(map.value);
  const layer = mapInstance
    .getLayers()
    .getArray()
    .find((i) => i.getClassName() == LAYER_NAMES.GOOGLE_LAYER);
  if (!layer) {
    new Error("未找到卷帘图层");
  }
  return layer;
};
const swiperControl = new SwipeControl();
const changeHandle = (visible) => {
  const mapInstance = toRaw(map.value);
  if (!swipeLayer) {
    swipeLayer = getLayer();
  }
  swipeLayer.setVisible(visible);
  if (visible) {
    mapInstance.addControl(swiperControl);
  } else {
    mapInstance.removeControl(swiperControl);
  }
};
</script>

<template>
  <div>
    <el-checkbox label="卷帘" v-model="showSwipe" @change="changeHandle" />
  </div>
</template>

<style scoped></style>
