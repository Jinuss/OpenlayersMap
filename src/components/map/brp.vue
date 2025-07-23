<script setup lang="ts">
import { onMounted, nextTick, toRaw, ref } from "vue";
import { storeToRefs } from "pinia";
import { transform } from "ol/proj";
import { useMapStore } from "../../store";
import { Coordinate } from "ol/coordinate";

const mapStore = useMapStore();
const { map } = storeToRefs(mapStore);

const coordinate = ref("");

const initEvent = () => {
  const mapInstance = toRaw(map.value);
  if(Object.keys(mapInstance).length==0){
      return
  }
  mapInstance?.on("pointermove", (evt: { coordinate: Coordinate; }) => {
    var lonLat = transform(evt.coordinate, "EPSG:3857", "EPSG:4326");
    if (lonLat && lonLat.length) {
      var lon = ((((lonLat[0] + 180) % 360) + 360) % 360) - 180;
      coordinate.value = `经度：${lon.toFixed(3)}°, 纬度: ${lonLat[1].toFixed(
        3
      )}°`;
    }
  });
};
onMounted(() => {
  nextTick(() => {
    initEvent();
  });
});
</script>

<template>
  <div class="brp">{{ coordinate }}</div>
</template>

<style scoped>
.brp {
  display: block;
  position: absolute;
  background: #ffffffb3;
  bottom: 8px;
  right: 8px;
  color: #000000bf;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 12px;
  line-height: 20px;
  z-index: 5;
}
</style>
