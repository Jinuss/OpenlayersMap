<script setup lang="ts">
import { toRaw } from "vue";
import { storeToRefs } from "pinia";
import tlp from "./compass.vue";
import trp from "./trp.vue";
import card from "./card.vue";
import clear from "./clear.vue";
import brp from "./brp.vue";
import topicLayerCard from "./component/topicLayerCard.vue";
import dragPanel from "./dragPanel/index.vue";
import routePlan from "./component/routePlan.vue";
import {
  useMapStore,
  usePanelStore,
  useCommonStore,
} from "../../store/index.ts";
import { PANEL_TYPES } from "../../const/const.panel.ts";
import bigPanel from "./component/bigPanel.vue";
import OpenlayersMap from "../../baseComponent/OpenlayersMap/map.vue";
import {
  AMAP_LAYER,
  LAYER_NAMES,
} from "../../baseComponent/OpenlayersMap/layers.ts";
import { THEME_COLOR } from "../../const/const.common.ts";
import { tileLoadFunction } from "../../util/mapTool.ts";
import keyboardNote from "../../baseComponent/keyboardNote.vue";
import GithubIcon from "../../baseComponent/GithubIcon.vue";

const MapStore = useMapStore();
const PanelStore = usePanelStore();
const commonStore = useCommonStore();

const { type } = storeToRefs(PanelStore);

const { map } = storeToRefs(MapStore);

const getMap = (map: Object) => {
  MapStore.setMap(map);
};

commonStore.$onAction(({ name, after }) => {
  if (name == "setThemeColor") {
    after(({ color }) => {
      const mapInstance = toRaw(map.value);
      if(!mapInstance){
          return
      }
      const baseLayer = mapInstance
        .getLayers()
        .getArray()
        .find(
          (i: { getClassName: () => string }) =>
            i.getClassName() == LAYER_NAMES.AMAP_LAYER
        );

      if (baseLayer) {
        let source = AMAP_LAYER().getSource();
        if (color == THEME_COLOR.NIGHT && source) {
          source.setTileLoadFunction(tileLoadFunction);
        }
        baseLayer.setSource(source);
      }
    });
  }
});
</script>
<template>
  <!-- 地图及其控件-->
  <OpenlayersMap @setMap="getMap" />

  <!-- 指南针 -->
  <tlp />

  <!-- 鼠标hover经纬度 -->
  <brp />

  <!-- 顶部panel -->
  <dragPanel />

  <!-- 右侧操作栏 -->
  <trp />

  <!-- 路径规划 -->
  <routePlan v-if="type == PANEL_TYPES.ROUTE_PLAN" />

  <!-- 专题图 -->
  <topicLayerCard />

  <!-- 清除 -->
  <clear />

  <!-- 卡片内容 -->
  <card />

  <!-- 大卡片 -->
  <bigPanel />

  <!--鼠标按键交互卡片-->
  <keyboardNote />

  <!--github图标-->
  <GithubIcon />
</template>
<style scoped></style>
