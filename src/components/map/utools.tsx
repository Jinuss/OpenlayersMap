import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import * as olStyle from "ol/style";
import { Point } from "ol/geom";
import Overlay from "ol/Overlay";
import locImgSrc from "../../assets/loc.png";
import { EventBus } from "../../util/index.js";

// 创建 overlay 内容的函数
function createOverlayElement(content: string) {
  var element = document.createElement("div");
  element.className = "popMarker";
  element.innerHTML = content;
  return element;
}

export class MapTools {
  map: any = null;
  layers: any = null;
  type: string = "";
  handle: any = () => {};
  callback: Function = () => {};
  mapEl = document.querySelector(".ol-viewport");

  constructor(
    map: any,
    layers: any,
    type: string,
    callback: Function = () => {}
  ) {
    this.map = map;
    this.layers = layers;
    this.type = type;
    this.handle = (event: { coordinate: any }) => {
      // 获取点击位置的坐标
      const coord = event.coordinate;
      console.log("🚀 ~ MapTools ~ constructor ~ coord:", coord);
      this.addMarker(coord);
    };
    this.callback = callback;
  }
  addListener(type: any) {
    const that = this;
    that.mapEl?.classList.add("draw");
    // 创建一个点击事件监听器
    switch (type) {
      case "point":
        that.map.on("click", that.handle);
        break;
    }
  }
  addMarker(coordinate: Coordinate) {
    const that = this;
    let marker = new Feature({
      geometry: new Point(coordinate),
    });
    // 创建一个标记的图标样式
    var markerStyle = new olStyle.Style({
      image: new olStyle.Icon({
        anchor: [0.5, 1], // 图标中心点在底部中心
        src: locImgSrc, // 图标的 URL
      }),
      zIndex: 6,
    });
    marker.setStyle(markerStyle);

    that.layers.vectorLayer.getSource().addFeature(marker);
    // 创建一个 overlay
    var overlay = new Overlay({
      element: createOverlayElement("Your text content"), // 创建 overlay 的内容
      positioning: "bottom-center",
      offset: [15, -30], // 调整文本位置
      position: coordinate,
    });

    // 将 overlay 添加到地图中
    that.map.addOverlay(overlay);
    that.removeListener();
    EventBus.emit("cancel");

    that.callback();
    that.map.on("click", (event: { pixel: any }) => {
      that.map.forEachFeatureAtPixel(event.pixel, (feature: any) => {
        if (feature instanceof Feature) {
          // 这是点击的标记 feature
          that.callback();
          // 处理点击事件的逻辑
        }
      });
    });
  }
  removeListener() {
    this.mapEl?.classList.remove("draw");
    this.map.un("click", this.handle);
  }
}
