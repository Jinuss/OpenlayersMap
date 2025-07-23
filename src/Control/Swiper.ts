import Control from "ol/control/Control";
import "./Swiper.css";

class SwipeControl extends Control {
  private swipePosition: number = 0.5; // 默认位置为50%
  private layers: any[] = [];
  private dragging: boolean = false;
  constructor(options: { target?: any }) {
    options = options || {};

    const element = document.createElement("div");
    element.className = "swipe-control";
    element.style.left = "50%";

    super({
      element: element,
      target: options.target,
    });

    // 绑定事件处理函数
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);

    // 添加拖拽事件监听
    element.addEventListener(
      "mousedown",
      this.handleDragStart as EventListener
    );
    element.addEventListener(
      "touchstart",
      this.handleDragStart as EventListener
    );

    // 动态基准线装饰
    this.createDecorations(element);
  }

  // 创建动态基准线装饰
  createDecorations(element: HTMLElement) {
    // 顶部装饰
    const topDecoration = document.createElement("div");
    topDecoration.style.position = "absolute";
    topDecoration.style.top = "-48px";
    topDecoration.style.left = "50%";
    topDecoration.style.transform = "translateX(-50%)";
    topDecoration.style.width = "96px";
    topDecoration.style.height = "96px";
    topDecoration.style.display = "flex";
    topDecoration.style.alignItems = "center";
    topDecoration.style.justifyContent = "center";

    topDecoration.innerHTML = `
                    <svg viewBox="0 0 24 24" width="48" height="48" style="color: #3b82f6;">
                        <path d="M12 2L4 7l8 5 8-5-8-5zM4 15l8 5 8-5M4 11l8 5 8-5"></path>
                    </svg>
                `;
    element.appendChild(topDecoration);

    // 底部装饰
    const bottomDecoration = document.createElement("div");
    bottomDecoration.style.position = "absolute";
    bottomDecoration.style.bottom = "-48px";
    bottomDecoration.style.left = "50%";
    bottomDecoration.style.transform = "translateX(-50%)";
    bottomDecoration.style.width = "96px";
    bottomDecoration.style.height = "96px";
    bottomDecoration.style.display = "flex";
    bottomDecoration.style.alignItems = "center";
    bottomDecoration.style.justifyContent = "center";

    bottomDecoration.innerHTML = `
                    <svg viewBox="0 0 24 24" width="48" height="48" style="color: #3b82f6;">
                        <path d="M4 7l8 5 8-5M4 11l8 5 8-5M4 15l8 5 8-5"></path>
                    </svg>
                `;
    element.appendChild(bottomDecoration);

    // 中央滑块
    const handle = document.createElement("div");
    handle.style.position = "absolute";
    handle.style.left = "50%";
    handle.style.top = "50%";
    handle.style.transform = "translate(-50%, -50%)";
    handle.style.width = "32px";
    handle.style.height = "96px";
    handle.style.backgroundColor = "white";
    handle.style.borderRadius = "4px";
    handle.style.display = "flex";
    handle.style.alignItems = "center";
    handle.style.justifyContent = "center";
    handle.style.border = "2px solid #3b82f6";
    handle.classList.add("swipe-handle-shadow");

    handle.innerHTML = `
                    <div style="width: 4px; height: 64px; background-color: #e2e8f0; border-radius: 2px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div style="width: 12px; height: 4px; background-color: #3b82f6; border-radius: 2px; transform: translateX(-4px);"></div>
                        <div style="width: 12px; height: 4px; background-color: #3b82f6; border-radius: 2px; transform: translateX(-4px);"></div>
                        <div style="width: 12px; height: 4px; background-color: #3b82f6; border-radius: 2px; transform: translateX(-4px);"></div>
                    </div>
                `;
    element.appendChild(handle);
  }

  setMap(map: any) {
    const oldMap = this.getMap();
    if (oldMap) {
      // 清除旧地图的监听
      oldMap.un("pointermove", this.updateCursor_);
    }

    super.setMap(map);

    if (map) {
      // 获取所有图层
      this.layers = map.getLayers().getArray();

      // 初始化图层分割
      this.updateLayers_();

      // 添加指针移动事件监听，用于更新光标样式
      map.on("pointermove", this.updateCursor_, this);

      // 添加窗口大小变化监听
      window.addEventListener("resize", () => this.updateLayers_());
    }
  }

  updateCursor_(event: any) {
    if (this.dragging) {
      document.body.style.cursor = "ew-resize";
      return;
    }

    const pixel = this.getMap()?.getEventPixel(event.originalEvent);
    const mapElement = this.getMap()?.getTargetElement();
    const hitElement =
      mapElement instanceof HTMLElement && pixel
        ? mapElement.ownerDocument.elementFromPoint(pixel[0], pixel[1])
        : undefined;
    const hit = hitElement ? this.element.contains(hitElement) : false;

    document.body.style.cursor = hit ? "ew-resize" : "";
  }

  private handleDragStart(e: DragEvent) {
    e.preventDefault();

    // 添加拖拽样式
    this.element.style.border = "2px solid #3b82f6";
    this.element.style.backgroundColor = "rgba(59, 130, 246, 0.2)";

    // 设置拖拽状态
    this.dragging = true;

    // 添加拖拽和释放事件监听
    document.addEventListener("mousemove", this.handleDrag as EventListener);
    document.addEventListener(
      "touchmove",
      (e: TouchEvent) => {
        this.handleDrag(e as unknown as DragEvent);
      },
      {
        passive: false,
      }
    );
    document.addEventListener("mouseup", this.handleDragEnd);
    document.addEventListener("touchend", this.handleDragEnd);

    // 阻止地图交互
    this.getMap()
      ?.getInteractions()
      .forEach((interaction) => {
        interaction.setActive(false);
      });

    // 阻止默认行为
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ew-resize";
  }

  private handleDrag(e: DragEvent) {
    if (!this.dragging) return;

    e.preventDefault();

    // 获取鼠标/触摸位置
    const mapRect = this.getMap()?.getTargetElement()?.getBoundingClientRect();
    let clientX;

    if (e.type === "mousemove") {
      clientX = e.clientX;
    } else {
      // touchmove
      clientX = (e as unknown as TouchEvent).touches[0].clientX;
    }

    // 计算滑动位置百分比
    this.swipePosition = mapRect
      ? (clientX - mapRect.left) / mapRect.width
      : this.swipePosition;
    this.swipePosition = Math.max(0, Math.min(1, this.swipePosition));

    // 更新控件位置
    this.element.style.left = `${this.swipePosition * 100}%`;

    // 更新图层
    this.updateLayers_();
  }

  private handleDragEnd() {
    // 移除拖拽样式
    this.element.style.border = "none";
    this.element.style.backgroundColor = "white";

    // 重置拖拽状态
    this.dragging = false;

    // 移除拖拽和释放事件监听
    document.removeEventListener("mousemove", this.handleDrag as EventListener);
    document.removeEventListener("touchmove", this.handleDrag as EventListener);
    document.removeEventListener("mouseup", this.handleDragEnd);
    document.removeEventListener("touchend", this.handleDragEnd);

    // 恢复地图交互
    this.getMap()
      ?.getInteractions()
      .forEach((interaction: { setActive: (arg0: boolean) => void }) => {
        interaction.setActive(true);
      });

    // 恢复默认行为
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }

  updateLayers_() {
    if (!this.getMap()) return;

    const mapSize = this.getMap()?.getSize();
    if (!mapSize) return;

    // 计算分割线位置
    const splitPosition = Math.round(mapSize[0] * this.swipePosition);

    // 获取投影范围
    const projectionExtent = this.getMap()
      ?.getView()
      .getProjection()
      .getExtent();

    // 更新每个图层的裁剪区域
    this.layers.forEach((layer, index) => {
      // 偶数图层显示在左侧，奇数图层显示在右侧
      if (index % 2 === 0) {
        layer.setExtent([
          projectionExtent ? projectionExtent[0] : 0,
          projectionExtent ? projectionExtent[1] : 0,
          this.getMap()?.getCoordinateFromPixel([splitPosition, 0])[0],
          projectionExtent ? projectionExtent[3] : 0,
        ]);
      } else {
        layer.setExtent([
          this.getMap()?.getCoordinateFromPixel([splitPosition, 0])[0],
          projectionExtent ? projectionExtent[1] : 0,
          projectionExtent ? projectionExtent[2] : 0,
          projectionExtent ? projectionExtent[3] : 0,
        ]);
      }
    });
  }

  // 重置卷帘位置
  reset() {
    this.swipePosition = 0.5;
    this.element.style.left = `${this.swipePosition * 100}%`;
    this.updateLayers_();
  }
}

export default SwipeControl;
