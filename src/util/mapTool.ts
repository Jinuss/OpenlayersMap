import * as sphere from "ol/sphere";
import { Style, Stroke, Icon } from "ol/style";
import { Geometry, Point } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { Map, Tile } from "ol";
import { StyleLike } from "ol/style/Style";

export const formatDistance = (dis: number) => {
  if (dis > 100) {
    return Math.round((dis / 1000) * 100) / 100 + " " + "km";
  } else {
    return Math.round(dis * 100) / 100 + " " + "m";
  }
};

export const formatLength = (line: Geometry) => {
  const length = sphere.getLength(line);
  return formatDistance(length);
};

export const formatArea = (area: number) => {
  if (area > 1000000) {
    return Math.round((area / 1000000) * 100) / 100 + " " + "km²";
  } else {
    return Math.round(area * 100) / 100 + " " + "m²";
  }
};

export const getArea = (geometry: Geometry, format = true) => {
  const area = sphere.getArea(geometry);
  return format ? formatArea(area) : area;
};

/**
 *  颜色值添加透明度
 * @param {*} opacity 透明度
 * @param {*} color 旧颜色值
 * @returns
 */
export const convertToRGBA = (opacity: number, color: string) => {
  let rgbaColor = "";

  if (color.includes("rgba")) {
    rgbaColor = color.replace(/[\d\.]+\)$/g, opacity.toString() + ")");
  } else if (color.includes("rgb")) {
    const rgbValues = color.match(/\d+/g);
    const [r = 255, g = 255, b = 255] = rgbValues?.map(Number) || [];
    rgbaColor = `rgba(${r},${g},${b},${opacity})`;
  } else {
    const tempDiv = document.createElement("div");
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    if (computedColor.startsWith("rgb")) {
      const rgbValues = computedColor.match(/\d+/g);
      const [r = 255, g = 255, b = 255] = rgbValues?.map(Number) || [];
      rgbaColor = `rgba(${r},${g},${b},${opacity})`;
    } else {
      throw new Error("Invalid color value");
    }
  }

  return rgbaColor;
};

/**
 * 获取图像模板
 * @param {*} imgUrl  图像源
 * @param {*} opacity 透明度
 * @returns
 */
export const getImagePattern = (imgUrl: string, opacity = 1) => {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.src = imgUrl;
    img.onload = function () {
      var cnv = document.createElement("canvas");
      var ctx = cnv.getContext("2d");
      cnv.width = img.width;
      cnv.height = img.height;
      ctx.drawImage(img, 0, 0);

      var imageData = ctx.getImageData(0, 0, cnv.width, cnv.height);
      var data = imageData.data;

      for (var i = 3; i < data.length; i += 4) {
        data[i] = opacity * 255;
      }
      ctx.putImageData(imageData, 0, 0);
      var pattern = ctx.createPattern(cnv, "repeat");
      resolve(pattern);
    };
    img.onerror = function (error) {
      reject(error);
    };
  });
};

export const getStyleFunction = ({
  steps,
  color,
  width,
  imgsrc,
  scale,
  wrapperRotation = (p) => p,
}: {
  steps?: number;
  color?: string;
  width?: number;
  imgsrc?: string;
  scale?: number;
  wrapperRotation?: (p: number) => number;
}): StyleLike => {
  steps = steps || 40;
  scale = scale || 0.5;
  return (feature: { getGeometry: () => any }, resolution: number) => {
    const geometry = feature.getGeometry();
    console.log("🚀 ~ return ~ resolution:", resolution);
    var styles = [
      new Style({
        stroke: new Stroke({
          color: color,
          width: width,
        }),
      }),
    ];
    let length = geometry.getLength();
    let geo_steps = steps * resolution;
    let num = parseInt(length / geo_steps);
    for (let i = 1; i <= num; i++) {
      let fraction = i / (num + 1);
      let arraw_coor = geometry.getCoordinateAt(fraction);
      let previousCoordinate = geometry.getCoordinateAt(fraction - 0.001);
      let nextCoordinate = geometry.getCoordinateAt(fraction + 0.001);
      let rotation = Math.atan2(
        nextCoordinate[1] - previousCoordinate[1],
        nextCoordinate[0] - previousCoordinate[0]
      );
      styles.push(
        new Style({
          geometry: new Point(arraw_coor),
          image: new Icon({
            src: imgsrc,
            scale: scale,
            anchor: [0.5, 0.5],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            rotation: wrapperRotation(rotation),
          }),
        })
      );
    }
    return styles;
  };
};

export const calculateAngle = ({
  points,
  azimuth = false,
}: {
  points: Coordinate[];
  azimuth?: Boolean;
}) => {
  // 提取坐标点 A, B, C
  const [A, B, C] = points;

  // 计算向量 AB 和 BC
  const AB = { x: B[0] - A[0], y: B[1] - A[1] };
  const BC = { x: C[0] - B[0], y: C[1] - B[1] };

  // 计算点积
  const dotProduct = AB.x * BC.x + AB.y * BC.y;

  // 计算向量的模
  const magnitudeAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
  const magnitudeBC = Math.sqrt(BC.x ** 2 + BC.y ** 2);

  // 计算余弦值
  const cosTheta = dotProduct / (magnitudeAB * magnitudeBC);

  // 确保 cosTheta 在 -1 和 1 之间
  const clippedCosTheta = Math.max(-1, Math.min(1, cosTheta));

  // 计算夹角（弧度转换为度）
  const angleInRadians = Math.acos(clippedCosTheta);
  const angleInDegrees = angleInRadians * (180 / Math.PI);

  // 计算方向（使用叉积）
  const crossProduct = AB.x * BC.y - AB.y * BC.x;

  // 如果叉积为负
  let angle = crossProduct < 0 ? angleInDegrees - 180 : 180 - angleInDegrees;

  //计算的夹角是方位角
  if (azimuth) {
    angle = angle < 0 ? angle + 360 : angle;
  }

  const { angleBA, angleBC } = calculateAnglePoint(points);

  let rotate = 0;
  if (angleBA < 0 && angleBC < 0) {
    rotate = -Math.max(Math.abs(angleBA), Math.abs(angleBC));
  }
  if (angleBA > 0 && angleBC > 0) {
    rotate = Math.min(Math.abs(angleBA), Math.abs(angleBC));
  }

  //第一二三象限 不同象限

  if (angleBA >= 135 && angleBA <= 180 && angleBC <= -45 && angleBC >= -90) {
    rotate = angleBA;
  }
  if (angleBC >= 135 && angleBC <= 180 && angleBA <= -45 && angleBA >= -90) {
    rotate = angleBC;
  }

  if (angleBA >= 135 && angleBA <= 180 && angleBC <= 0 && angleBC >= -45) {
    rotate = angleBC;
  }
  if (angleBC >= 135 && angleBC <= 180 && angleBA <= 0 && angleBA >= -45) {
    rotate = angleBA;
  }

  if (angleBA >= 90 && angleBA <= 135 && angleBC <= 0 && angleBC >= -45) {
    rotate = angleBC;
  }
  if (angleBC >= 90 && angleBC <= 135 && angleBA <= 0 && angleBA >= -45) {
    rotate = angleBA;
  }
  if (angleBA >= 90 && angleBA <= 135 && angleBC >= -90 && angleBC <= -45) {
    rotate = angleBA;
  }

  if (angleBC >= 90 && angleBC <= 135 && angleBA >= -90 && angleBA <= -45) {
    rotate = angleBC;
  }

  if (angleBA >= 0 && angleBA <= 90 && angleBC <= 0 && angleBC >= -90) {
    rotate = angleBC;
  }

  if (angleBC >= 0 && angleBC <= 90 && angleBA <= 0 && angleBA >= -90) {
    rotate = angleBA;
  }

  //第一二四象限不同象限
  if (angleBC >= -180 && angleBC <= -90 && angleBA <= 180 && angleBA >= 90) {
    rotate = angleBA;
  }

  if (angleBA >= -180 && angleBA <= -90 && angleBC <= 180 && angleBC >= 90) {
    rotate = angleBC;
  }

  if (angleBC >= -135 && angleBC <= -90 && angleBA >= 0 && angleBA <= 45) {
    rotate = angleBC;
  }

  if (angleBC >= -135 && angleBC <= -90 && angleBA >= 45 && angleBA <= 90) {
    rotate = angleBA;
  }

  if (angleBA >= -135 && angleBA <= -90 && angleBC >= 0 && angleBC <= 45) {
    rotate = angleBA;
  }

  if (angleBA >= -135 && angleBA <= -90 && angleBC >= 45 && angleBC <= 90) {
    rotate = angleBC;
  }

  if (angleBC >= -180 && angleBC <= -135 && angleBA >= 0 && angleBA <= 45) {
    rotate = angleBC;
  }

  if (angleBC >= -180 && angleBC <= -135 && angleBA >= 45 && angleBA <= 90) {
    rotate = angleBA;
  }

  if (angleBA >= -180 && angleBA <= -135 && angleBC >= 0 && angleBC <= 45) {
    rotate = angleBA;
  }
  if (angleBA >= -180 && angleBA <= -135 && angleBC >= 45 && angleBC <= 90) {
    rotate = angleBC;
  }

  return {
    Angle: Number(Math.abs(angle.toFixed(0))),
    rotate: rotate,
    rotation: (angle * Math.PI) / 180,
  };
};

function calculateAnglePoint(points) {
  const [A, B, C] = points;
  const [Ax, Ay] = A;
  const [Bx, By] = B;
  const [Cx, Cy] = C;

  // 计算向量 BA 和 BC
  const BA = { x: Ax - Bx, y: Ay - By }; // BA 向量（从 B 到 A）
  const BC = { x: Cx - Bx, y: Cy - By }; // BC 向量（从 B 到 C）

  // 计算 BA 和 BC 向量与 X 轴的夹角（单位：度）
  let angleBA = Math.atan2(BA.y, BA.x) * (180 / Math.PI); // [-180, 180] 范围
  let angleBC = Math.atan2(BC.y, BC.x) * (180 / Math.PI); // [-180, 180] 范围

  // 计算 BA 向量与 X 轴负半轴的夹角
  if (angleBA >= 0 && angleBA < 90) {
    // 第一象限，夹角为正钝角
    angleBA = 180 - angleBA;
  } else if (angleBA >= 90 && angleBA <= 180) {
    // 第二象限，夹角为正锐角
    angleBA = 180 - angleBA;
  } else if (angleBA < 0 && angleBA >= -90) {
    // 第四象限，夹角为负钝角
    angleBA = Math.abs(angleBA) - 180;
  } else {
    // 第三象限，夹角为负锐角
    angleBA = Math.abs(angleBA) - 180;
  }

  // 计算 BC 向量与 X 轴负半轴的夹角
  if (angleBC >= 0 && angleBC < 90) {
    // 第一象限，夹角为正钝角
    angleBC = 180 - angleBC;
  } else if (angleBC >= 90 && angleBC <= 180) {
    // 第二象限，夹角为正锐角
    angleBC = 180 - angleBC;
  } else if (angleBC < 0 && angleBC >= -90) {
    // 第四象限，夹角为负钝角
    angleBC = Math.abs(angleBC) - 180;
  } else {
    // 第三象限，夹角为负锐角
    angleBC = Math.abs(angleBC) - 180;
  }

  return {
    angleBA: angleBA, // BA 向量与 X 轴负半轴的夹角
    angleBC: angleBC, // BC 向量与 X 轴负半轴的夹角
  };
}

//暗色地图底图
export const tileLoadFunction = (imageTile: Tile) => {
  const img = new Image();
  img.setAttribute("crossOrigin", "anonymous");
  img.onload = function () {
    const canvas = document.createElement("canvas");
    const w = img.width;
    const h = img.height;
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext("2d");
    if (context) {
      context.filter =
        "grayscale(98%) invert(100%) sepia(20%) hue-rotate(180deg) saturate(1600%) brightness(80%) contrast(90%)";
      context.drawImage(img, 0, 0, w, h, 0, 0, w, h);
      imageTile.getImage().src = canvas.toDataURL("image/png");
    }
  };
  img.src = src;
};

// 根据图层名获取图层
export const getLayerByClassName = (map: Map, classname: any) => {
  return map
    .getLayers()
    .getArray()
    .find((i) => i.getClassName() == classname);
};
