import Control from "ol/control/Control";
import Map from "ol/Map";
import "./Swiper.css";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";

/**
 * 地图卷帘控件，支持左右滑动比较不同图层
 */
class SwipeControl extends Control {
  private swipePosition: number = 0.5; // 默认位置为50%
  private layers: any[] = [];
  private dragging: boolean = false;
  private map: Map | null = null;
  private originalExtents: { [layerId: string]: any } = {};
  private viewChangeListenerKey: null | EventsKey = null;

  constructor(options: { target?: any } = {}) {
    super({
      element: SwipeControl.createControlElement(),
      target: options.target,
    });

    // 绑定事件处理函数
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.updateCursor_ = this.updateCursor_.bind(this);
    this.onViewChange = this.onViewChange.bind(this);

    // 添加拖拽事件监听
    this.element.addEventListener("mousedown", this.handleDragStart);
    this.element.addEventListener("touchstart", this.handleDragStart);
  }

  /** 创建控件DOM元素 */
  private static createControlElement(): HTMLElement {
    const element = document.createElement("div");
    element.className = "swipe-control";
    element.style.left = "50%";

    // 顶部装饰
    const topDecoration = document.createElement("div");
    topDecoration.className = "top-decoration";
    element.appendChild(topDecoration);

    // 底部装饰
    const bottomDecoration = document.createElement("div");
    bottomDecoration.className = "bottom-decoration";
    element.appendChild(bottomDecoration);

    // 中央滑块
    const handle = document.createElement("div");
    handle.className = "swipe-handle";
    handle.innerHTML = `
      <div class="handle-visual">
        <div class="handle-line"></div>
        <div class="handle-dots">
          <div class="handle-dot"></div>
          <div class="handle-dot"></div>
          <div class="handle-dot"></div>
        </div>
      </div>
    `;
    element.appendChild(handle);

    return element;
  }

  /** 设置地图并初始化 */
  setMap(map: Map | null) {
    const oldMap = this.getMap();
    if (oldMap) {
      this.cleanupMapListeners(oldMap);
      this.restoreLayersExtent();
    }

    super.setMap(map);
    this.map = map;

    if (map) {
      this.initializeMap(map);
    }
  }

  /** 初始化地图相关设置 */
  private initializeMap(map: Map) {
    // 保存原始图层范围
    this.saveOriginalLayerExtents();

    // 获取所有图层
    this.layers = map.getLayers().getArray();

    // 初始化图层分割
    this.updateLayers_();

    // 添加指针移动事件监听，用于更新光标样式
    map.on("pointermove", this.updateCursor_);

    // 添加视图变化监听
    this.viewChangeListenerKey = map
      .getView()
      .on("change:center", this.onViewChange);

    this.viewChangeListenerKey = map
      .getView()
      .on("change:resolution", this.onViewChange);

    // 添加窗口大小变化监听
    window.addEventListener("resize", this.onViewChange);
  }

  /** 清理地图相关监听器 */
  private cleanupMapListeners(map: Map) {
    // 移除指针移动事件监听
    map.un("pointermove", this.updateCursor_);

    // 移除视图变化监听
    if (this.viewChangeListenerKey) {
      unByKey(this.viewChangeListenerKey);
      this.viewChangeListenerKey = null;
    }

    // 移除窗口大小变化监听
    window.removeEventListener("resize", this.onViewChange);
  }

  /** 保存图层原始范围 */
  private saveOriginalLayerExtents() {
    this.layers.forEach((layer) => {
      const id = layer.get("id") || layer.get("title") || String(Math.random());
      this.originalExtents[id] = layer.getExtent() || null;
    });
  }

  /** 恢复图层原始范围 */
  private restoreLayersExtent() {
    this.layers.forEach((layer) => {
      const id = layer.get("id") || layer.get("title") || String(Math.random());
      if (this.originalExtents[id]) {
        layer.setExtent(this.originalExtents[id]);
      } else {
        layer.setExtent(null); // 移除自定义范围
      }
    });
  }

  /** 更新光标样式 */
  private updateCursor_(event: any) {
    if (this.dragging) {
      document.body.style.cursor = "ew-resize";
      return;
    }

    const pixel = this.map?.getEventPixel(event.originalEvent);
    const hit = pixel && this.isOverControl(pixel);
    document.body.style.cursor = hit ? "ew-resize" : "";
  }

  /** 判断像素是否在控件上 */
  private isOverControl(pixel: number[]): boolean {
    const mapElement = this.map?.getTargetElement();
    if (!(mapElement instanceof HTMLElement)) return false;

    const controlRect = this.element.getBoundingClientRect();
    const mapRect = mapElement.getBoundingClientRect();

    const pixelX = mapRect.left + pixel[0];
    const pixelY = mapRect.top + pixel[1];

    return (
      pixelX >= controlRect.left &&
      pixelX <= controlRect.right &&
      pixelY >= controlRect.top &&
      pixelY <= controlRect.bottom
    );
  }

  /** 视图变化时更新图层显示 */
  private onViewChange() {
    this.updateLayers_();
  }

  /** 开始拖拽处理 */
  private handleDragStart(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    this.dragging = true;

    // 添加拖拽和释放事件监听
    document.addEventListener("mousemove", this.handleDrag);
    document.addEventListener("touchmove", this.handleDrag, { passive: false });
    document.addEventListener("mouseup", this.handleDragEnd);
    document.addEventListener("touchend", this.handleDragEnd);

    // 阻止地图交互
    this.disableMapInteractions();

    // 更新样式
    this.element.classList.add("dragging");
    document.body.style.cursor = "ew-resize";
  }

  /** 拖拽处理 */
  private handleDrag(e: MouseEvent | TouchEvent) {
    if (!this.dragging || !this.map) return;
    e.preventDefault();

    // 获取鼠标/触摸位置
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const mapRect = this.map.getTargetElement()?.getBoundingClientRect();

    // 计算滑动位置百分比
    if (mapRect) {
      this.swipePosition = Math.max(
        0,
        Math.min(1, (clientX - mapRect.left) / mapRect.width)
      );
      this.element.style.left = `${this.swipePosition * 100}%`;
      this.updateLayers_();
    }
  }

  /** 结束拖拽处理 */
  private handleDragEnd() {
    this.dragging = false;

    // 移除事件监听
    document.removeEventListener("mousemove", this.handleDrag);
    document.removeEventListener("touchmove", this.handleDrag);
    document.removeEventListener("mouseup", this.handleDragEnd);
    document.removeEventListener("touchend", this.handleDragEnd);

    // 恢复地图交互
    this.enableMapInteractions();

    // 恢复样式
    this.element.classList.remove("dragging");
    document.body.style.cursor = "";
  }

  /** 禁用地图交互 */
  private disableMapInteractions() {
    this.map?.getInteractions().forEach((interaction) => {
      interaction.setActive(false);
    });
    document.body.style.userSelect = "none";
  }

  /** 启用地图交互 */
  private enableMapInteractions() {
    this.map?.getInteractions().forEach((interaction) => {
      interaction.setActive(true);
    });
    document.body.style.userSelect = "";
  }

  /** 更新图层显示 */
  private updateLayers_() {
    if (!this.map) return;

    const mapSize = this.map.getSize();
    if (!mapSize) return;

    // 计算分割线位置
    const splitPosition = Math.round(mapSize[0] * this.swipePosition);
    console.log("🚀 ~ SwipeControl ~ updateLayers_ ~ splitPosition:", splitPosition)

    // 获取投影范围
    const projectionExtent = this.map.getView().getProjection().getExtent();
    const splitCoordinate = this.map.getCoordinateFromPixel([splitPosition, 0]);
    const splitCoordinateX = splitCoordinate?.[0] || 0;

    // 更新每个图层的裁剪区域
    this.layers.forEach((layer, index) => {
      // 偶数图层显示在左侧，奇数图层显示在右侧
      if (index % 2 === 0) {
        layer.setExtent([
          projectionExtent?.[0] || 0,
          projectionExtent?.[1] || 0,
          splitCoordinateX,
          projectionExtent?.[3] || 0,
        ]);
      } else {
        layer.setExtent([
          splitCoordinateX,
          projectionExtent?.[1] || 0,
          projectionExtent?.[2] || 0,
          projectionExtent?.[3] || 0,
        ]);
      }
    });
  }

  /** 重置卷帘位置到中间 */
  reset() {
    this.swipePosition = 0.5;
    this.element.style.left = `${this.swipePosition * 100}%`;
    this.updateLayers_();
  }

  /** 销毁卷帘控件，恢复地图状态 */
  destroy() {
    this.restoreLayersExtent();
    this.setMap(null);
    super.dispose();
  }
}

export default SwipeControl;
