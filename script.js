const timeline = [
  {
    label: "2023 早春 · 校外租房",
    place: "郑州周边",
    desc: ["用外卖赶论文的凌晨", "空调声盖过心跳"],
    progress: 0.04,
    duration: 4,
    offset: { x: -80, y: -40 },
  },
  {
    label: "2023 7 月 · 郑州",
    place: "毕业论文阶段",
    desc: ["散热风扇呼啦响", "桌上堆满草稿"],
    progress: 0.12,
    duration: 5,
    offset: { x: 70, y: -60 },
  },
  {
    label: "2023 秋 · 荷兰交换",
    place: "小城宿舍",
    desc: ["第一次长途飞行", "自行车成了日常"],
    progress: 0.2,
    duration: 5,
    offset: { x: -100, y: -30 },
  },
  {
    label: "2023 冬 · 欧洲旅行",
    place: "列车与背包",
    desc: ["车窗外换了好几个国家", "在陌生街道迷路又找到方向"],
    progress: 0.28,
    duration: 5,
    offset: { x: 80, y: -70 },
  },
  {
    label: "2024 1 月 · 回国",
    place: "返校",
    desc: ["下飞机雾气扑面", "重新习惯熟悉的键盘声"],
    progress: 0.36,
    duration: 4,
    offset: { x: -90, y: -40 },
  },
  {
    label: "2024 4 月 · 郑州租房",
    place: "赶作业",
    desc: ["房东家的猫总来蹭脚", "屋子里铺满便利贴"],
    progress: 0.46,
    duration: 4,
    offset: { x: 90, y: -60 },
  },
  {
    label: "2024 5 月 · 答辩",
    place: "校园",
    desc: ["门外蝉鸣很吵", "仍想把故事讲圆"],
    progress: 0.52,
    duration: 3,
    offset: { x: 70, y: -50 },
  },
  {
    label: "2024 6 月 · 杭州工作",
    place: "短租 → 宿舍",
    desc: ["行李箱成了常驻家具", "傍晚走回宿舍吹江风"],
    progress: 0.62,
    duration: 6,
    offset: { x: -120, y: -50 },
  },
  {
    label: "2025 春 · 杭州双职",
    place: "交错通勤",
    desc: ["备份电脑与文件夹", "疲惫是常态但还想做好"],
    progress: 0.7,
    duration: 5,
    offset: { x: 80, y: -80 },
  },
  {
    label: "2025 夏 · 深圳西丽",
    place: "实习租房",
    desc: ["潮湿天气晾不干衣服", "夜班后和同事吃宵夜"],
    progress: 0.78,
    duration: 5,
    offset: { x: 80, y: -40 },
  },
  {
    label: "2025 秋 · 香港求学",
    place: "亲戚宿舍",
    desc: ["天星小轮的夜风", "课表与签证日期反复确认"],
    progress: 0.86,
    duration: 5,
    offset: { x: -80, y: -70 },
  },
  {
    label: "2025 冬 · 深圳 ↔ 佛山",
    place: "往返实习",
    desc: ["高铁站成了第二个客厅", "行李箱始终半开"],
    progress: 0.94,
    duration: 5,
    offset: { x: 110, y: -40 },
  },
  {
    label: "2026 初 · 芜湖",
    place: "奇瑞实习",
    desc: ["换了一批工牌", "仍旧在路上"],
    progress: 0.995,
    duration: 6,
    offset: { x: -90, y: -50 },
  },
];

const svg = document.getElementById("doodle-map");
const world = document.getElementById("world");
const hero = document.getElementById("hero");
const routePath = document.getElementById("trace");
const notesLayer = document.getElementById("notes-layer");
const progressFill = document.querySelector(".progress-fill");

const mapSize = { width: 2400, height: 1400 };
let pathLength;
let currentIndex = 0;
let segmentStart = 0;
let looping = false;

function createNotes() {
  const fragment = document.createDocumentFragment();
  timeline.forEach((item) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.classList.add("note");

    const dist = item.progress;
    const len = dist * pathLength;
    const point = routePath.getPointAtLength(len);

    const posX = point.x + (item.offset?.x || 0);
    const posY = point.y + (item.offset?.y || 0);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", posX - 130);
    rect.setAttribute("y", posY - 80);
    rect.setAttribute("width", 220);
    rect.setAttribute("height", 110);
    group.appendChild(rect);

    const lines = [item.label, item.place, ...item.desc];
    lines.forEach((text, idx) => {
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.textContent = text;
      t.setAttribute("x", posX - 118);
      t.setAttribute("y", posY - 50 + idx * 22);
      if (idx === 0) t.classList.add("title");
      if (idx === 1) t.classList.add("place");
      if (idx > 1) t.classList.add("desc");
      group.appendChild(t);
    });

    group.dataset.progress = item.progress;
    fragment.appendChild(group);
  });

  notesLayer.appendChild(fragment);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function ease(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function updateScene(progress) {
  if (!pathLength || Number.isNaN(progress)) return;

  const dist = pathLength * progress;
  const point = routePath.getPointAtLength(dist);

  // draw trace
  routePath.style.strokeDasharray = pathLength;
  routePath.style.strokeDashoffset = pathLength - dist;

  // move hero
  hero.setAttribute("transform", `translate(${point.x} ${point.y})`);

  // pan map (keep hero near center)
  const viewportWidth = document.getElementById("map-stage").clientWidth;
  const viewportHeight = document.getElementById("map-stage").clientHeight;
  const targetX = viewportWidth / 2 - point.x;
  const targetY = viewportHeight / 2 - point.y;
  const minX = viewportWidth - mapSize.width + 80;
  const maxX = -80;
  const minY = viewportHeight - mapSize.height + 80;
  const maxY = -80;
  const panX = clamp(targetX, minX, maxX);
  const panY = clamp(targetY, minY, maxY);
  svg.style.transform = `translate(${panX}px, ${panY}px)`;

  // activate notes
  document.querySelectorAll(".note").forEach((note) => {
    const show = progress + 0.0001 >= Number(note.dataset.progress) - 0.01;
    note.classList.toggle("visible", show);
  });

  // update footer progress
  progressFill.style.width = `${Math.min(progress, 1) * 100}%`;
}

function animate(timestamp) {
  if (!segmentStart) segmentStart = timestamp;
  const segment = timeline[currentIndex];
  const previousProgress = currentIndex === 0 ? 0 : timeline[currentIndex - 1].progress;
  const elapsed = (timestamp - segmentStart) / 1000;
  const t = clamp(elapsed / segment.duration, 0, 1);
  const eased = ease(t);
  const currentProgress = previousProgress + (segment.progress - previousProgress) * eased;

  updateScene(currentProgress);

  if (elapsed >= segment.duration && !looping) {
    currentIndex += 1;
    segmentStart = timestamp;
    if (currentIndex >= timeline.length) {
      looping = true;
      setTimeout(() => {
        currentIndex = 0;
        looping = false;
        segmentStart = performance.now();
        requestAnimationFrame(animate);
      }, 2000);
      return;
    }
  }

  if (!looping) requestAnimationFrame(animate);
}

function init() {
  pathLength = routePath.getTotalLength();
  createNotes();
  updateScene(0);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  if (!pathLength) return;
  const dist = pathLength * (currentIndex === 0 ? 0 : timeline[currentIndex - 1].progress);
  updateScene(dist / pathLength);
});

document.addEventListener("DOMContentLoaded", init);
