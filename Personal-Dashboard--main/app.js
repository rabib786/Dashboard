// --- GLOBAL KEYBOARD SHORTCUTS ---
document.addEventListener("keydown", (e) => {
  const targetTag = e.target.tagName.toLowerCase();
  const isInput =
    targetTag === "input" ||
    targetTag === "textarea" ||
    targetTag === "select" ||
    e.target.isContentEditable;

  // Alt + S = Search
  if (e.altKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    const sb = document.getElementById("universal-search");
    if (sb) sb.focus({ preventScroll: true });
  }
  // Alt + T = Add Task
  if (e.altKey && e.key.toLowerCase() === "t") {
    e.preventDefault();
    const ti = document.getElementById("todo-input");
    if (ti) ti.focus({ preventScroll: true });
  }
  // Alt + N = New Note
  if (e.altKey && e.key.toLowerCase() === "n") {
    e.preventDefault();
    createNewNote();
  }
  // Escape = Close Settings Modal
  if (e.key === "Escape") {
    const modal = document.getElementById("settings-modal");
    if (modal && modal.classList.contains("active")) {
      closeSettings();
    }
    const shortcutsModal = document.getElementById("shortcuts-modal");
    if (shortcutsModal && shortcutsModal.classList.contains("active")) {
      closeShortcuts();
    }
    closeContextMenu();
  }

  // ? = Open keyboard shortcuts help (when not typing into fields)
  if (!isInput && (e.key === "?" || (e.shiftKey && e.key === "/"))) {
    e.preventDefault();
    openShortcuts();
  }

  // Calculator Numpad Support
  const calcCard = document.getElementById("mod-calculator");
  if (!isInput && calcCard && calcCard.style.display !== "none") {
    const key = e.key;
    if (/^[0-9.]$/.test(key)) {
      e.preventDefault();
      calcAction("num", key);
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      e.preventDefault();
      calcAction("op", key);
    } else if (key === "Enter" || key === "=") {
      e.preventDefault();
      calcAction("equals");
    } else if (key === "Backspace") {
      e.preventDefault();
      calcAction("delete");
    } else if (key === "Escape") {
      e.preventDefault();
      calcAction("clear");
    }
  }
});

// --- UNIVERSAL SEARCH ---
function executeSearch(e) {
  if (e.key === "Enter") {
    const query = document.getElementById("universal-search").value;
    const engine = document.getElementById("search-engine").value;
    if (!query.trim()) return;

    let url = "";
    if (engine === "google")
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    else if (engine === "duckduckgo")
      url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    else if (engine === "bing")
      url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    document.getElementById("universal-search").value = "";
  }
}

// --- SETTINGS & THEME ENGINE ---
function safeParseStorageItem(key, fallbackValue) {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return fallbackValue;
    const parsed = JSON.parse(rawValue);
    return parsed ?? fallbackValue;
  } catch (err) {
    console.warn(
      `Failed to parse localStorage key "${key}". Resetting to fallback.`,
      err,
    );
    return fallbackValue;
  }
}

function safeParseJson(rawValue, fallbackValue, label = "json payload") {
  try {
    if (!rawValue) return fallbackValue;
    const parsed = JSON.parse(rawValue);
    return parsed ?? fallbackValue;
  } catch (err) {
    console.warn(
      `Failed to parse ${label}. Falling back to default value.`,
      err,
    );
    return fallbackValue;
  }
}

let customRssSources = safeParseStorageItem("dashboardCustomRssSources", []);
if (!Array.isArray(customRssSources)) customRssSources = [];
const defaultVis = {
  search: true,
  time: true,
  tasks: true,
  torn: true,
  bank: true,
  weather: true,
  calendar: true,
  shortcuts: true,
  notepad: true,
  news: true,
  calculator: true,
  story: true,
};
let rawSettings = safeParseStorageItem("dashSettings", {});
// Handle null case explicitly if storage is empty/mocked
if (!rawSettings) rawSettings = {};

const PROFILE_PRESETS = {
  work: {
    themeStyle: "glass",
    accentColor: "#0066cc",
    compactMode: true,
    calcCompactMode: true,
    visibility: {
      search: true,
      time: true,
      tasks: true,
      torn: false,
      bank: true,
      weather: true,
      calendar: true,
      shortcuts: true,
      notepad: false,
      news: false,
      calculator: false,
      story: false,
    },
  },
  weekend: {
    themeStyle: "material",
    accentColor: "#8e44ad",
    compactMode: false,
    calcCompactMode: false,
    visibility: {
      search: true,
      time: true,
      tasks: true,
      torn: false,
      bank: false,
      weather: true,
      calendar: true,
      shortcuts: true,
      notepad: true,
      news: true,
      calculator: true,
      story: true,
    },
  },
  gaming: {
    themeStyle: "cyberpunk",
    accentColor: "#00ff9c",
    compactMode: true,
    calcCompactMode: true,
    visibility: {
      search: true,
      time: true,
      tasks: true,
      torn: true,
      bank: false,
      weather: false,
      calendar: false,
      shortcuts: true,
      notepad: false,
      news: true,
      calculator: true,
      story: false,
    },
  },
};

const PROFILE_SWITCH_ORDER = ["custom", "work", "weekend", "gaming"];
const CUSTOM_PROFILE_STATE_KEY = "dashCustomProfileState";

// Merged Settings state
let dashSettings = {
  name: rawSettings.name || "",
  clock24: rawSettings.clock24 || false,
  weatherCity: rawSettings.weatherCity || "",
  bgType: rawSettings.bgType || "animated",
  bgValue: rawSettings.bgValue || "",
  customRssName: rawSettings.customRssName || "",
  customRssUrl: rawSettings.customRssUrl || "",
  compactMode: rawSettings.compactMode || false,
  calcCompactMode: rawSettings.calcCompactMode || false,
  visibility: { ...defaultVis, ...(rawSettings.visibility || {}) },
  activeProfile: PROFILE_SWITCH_ORDER.includes(rawSettings.activeProfile)
    ? rawSettings.activeProfile
    : "custom",
  // NEW THEME STATE
  themeStyle: rawSettings.themeStyle || "glass",
  accentColor: rawSettings.accentColor || "#0066cc",
  layoutMode: rawSettings.layoutMode === "freeform" ? "freeform" : "grid",
  widgetPositions:
    rawSettings.widgetPositions &&
    typeof rawSettings.widgetPositions === "object"
      ? rawSettings.widgetPositions
      : {},
  minimizedIconPositions:
    rawSettings.minimizedIconPositions &&
    typeof rawSettings.minimizedIconPositions === "object"
      ? rawSettings.minimizedIconPositions
      : {},

  // OS THEME STATE

  minimizedModules: Array.isArray(rawSettings.minimizedModules)
    ? rawSettings.minimizedModules
    : [],

  // ADVANCED WORKSPACES & SCHEDULES
  workspaces: (rawSettings.workspaces && typeof rawSettings.workspaces === 'object') ? rawSettings.workspaces : {},
  workspaceSchedules: Array.isArray(rawSettings.workspaceSchedules) ? rawSettings.workspaceSchedules : [],
};





const moduleCache = {};
const layoutModules = [
  ["search", "mod-search"],
  ["time", "mod-time"],
  ["tasks", "mod-tasks"],
  ["torn", "mod-torn"],
  ["bank", "mod-bank-apps"],
  ["weather", "mod-weather"],
  ["calendar", "mod-calendar"],
  ["shortcuts", "mod-shortcuts"],
  ["notepad", "mod-notepad"],
  ["news", "mod-news"],
  ["calculator", "mod-calculator"],
  ["story", "mod-story"],
];
const DESKTOP_WIDGET_MIN_WIDTH = 980;
const DESKTOP_WIDGET_MARGIN = 16;
const COLUMN_MODE_MAX_COLUMNS = 4;
const COLUMN_MODE_GAP = 20;
const WIDGET_MIN_WIDTH = 240;
const WIDGET_MIN_HEIGHT = 180;
const WIDGET_DEFAULT_WIDTH = 360;
const WIDGET_DEFAULT_HEIGHT = 250;
const WIDGET_MAX_WIDTH_RATIO = 0.78;
const WIDGET_MAX_HEIGHT = 820;
const MODULE_ICON_MARGIN = 16;
const MODULE_ICON_SIZE = 52;
let widgetLayerCounter = 20;
const MODULE_TYPE_ICONS = {
  search: "ph-magnifying-glass",
  time: "ph-clock",
  tasks: "ph-check-square-offset",
  torn: "ph-crosshair",
  bank: "ph-briefcase",
  weather: "ph-cloud-sun",
  calendar: "ph-calendar-blank",
  shortcuts: "ph-link",
  notepad: "ph-notepad",
  news: "ph-newspaper",
  calculator: "ph-calculator",
  story: "ph-book-open",
};

function getModuleKeyByCardId(cardId) {
  const match = layoutModules.find(([, id]) => id === cardId);
  return match ? match[0] : null;
}

function getCardIdByModuleKey(moduleKey) {
  const match = layoutModules.find(([key]) => key === moduleKey);
  return match ? match[1] : null;
}

function isWidgetLayoutEnabled() {
  return (
    dashSettings.layoutMode === "freeform" &&
    window.innerWidth >= DESKTOP_WIDGET_MIN_WIDTH
  );
}

function clampWidgetPosition(position, maxX, maxY) {
  return {
    left: Math.max(
      0,
      Math.min(Math.round(position.left || 0), Math.max(0, maxX)),
    ),
    top: Math.max(
      0,
      Math.min(Math.round(position.top || 0), Math.max(0, maxY)),
    ),
  };
}

function getWidgetSizeBounds(dashboard) {
  const dashboardWidth =
    dashboard?.clientWidth || Math.max(900, window.innerWidth - 40);
  const maxWidth = Math.max(
    WIDGET_MIN_WIDTH,
    Math.floor(dashboardWidth * WIDGET_MAX_WIDTH_RATIO),
  );
  return {
    minWidth: WIDGET_MIN_WIDTH,
    minHeight: WIDGET_MIN_HEIGHT,
    maxWidth,
    maxHeight: WIDGET_MAX_HEIGHT,
  };
}

function normalizeWidgetMetrics(
  card,
  dashboard,
  fallbackWidth = WIDGET_DEFAULT_WIDTH,
  fallbackHeight = WIDGET_DEFAULT_HEIGHT,
) {
  const bounds = getWidgetSizeBounds(dashboard);
  const saved = dashSettings.widgetPositions[card.id] || {};
  const width = Math.max(
    bounds.minWidth,
    Math.min(bounds.maxWidth, Number(saved.width) || fallbackWidth),
  );
  const height = Math.max(
    bounds.minHeight,
    Math.min(bounds.maxHeight, Number(saved.height) || fallbackHeight),
  );
  const left = Math.round(Number(saved.left) || 0);
  const top = Math.round(Number(saved.top) || 0);
  return { left, top, width, height };
}

function applyWidgetScale(card, width, height) {
  const widthRatio = width / WIDGET_DEFAULT_WIDTH;
  const heightRatio = height / WIDGET_DEFAULT_HEIGHT;
  const scale = Math.max(
    0.72,
    Math.min(1.08, Math.min(widthRatio, heightRatio)),
  );
  card.style.setProperty("--widget-scale", scale.toFixed(3));
  card.classList.toggle("widget-compact", scale <= 0.88);
  card.classList.toggle("widget-icon-mode", scale <= 0.76);
}

function persistLayoutMode() {
  saveSettingsToStorage();
}

function getWidgetMaxY(cardHeight, dashboard) {
  const canvasHeight = Math.max(
    dashboard.clientHeight,
    dashboard.scrollHeight,
    640,
  );
  return Math.max(0, canvasHeight - cardHeight - DESKTOP_WIDGET_MARGIN);
}

function bringWidgetToFront(card) {
  widgetLayerCounter += 1;
  card.style.zIndex = String(widgetLayerCounter);
}

function getDefaultWidgetPosition(index, widgetWidth) {
  const dashboard = document.getElementById("dashboard-grid");
  const boundsWidth = dashboard
    ? dashboard.clientWidth
    : Math.max(1240, window.innerWidth - 40);
  const usableWidth = Math.max(320, boundsWidth - DESKTOP_WIDGET_MARGIN * 2);
  const columnWidth = Math.min(
    widgetWidth || 360,
    Math.floor(
      (usableWidth - (COLUMN_MODE_MAX_COLUMNS - 1) * COLUMN_MODE_GAP) /
        COLUMN_MODE_MAX_COLUMNS,
    ),
  );
  const rowHeight = 250;
  const col = index % COLUMN_MODE_MAX_COLUMNS;
  const row = Math.floor(index / COLUMN_MODE_MAX_COLUMNS);
  return {
    left: DESKTOP_WIDGET_MARGIN + col * (columnWidth + COLUMN_MODE_GAP),
    top: DESKTOP_WIDGET_MARGIN + row * rowHeight,
  };
}

function getColumnModeMetrics(dashboard, preferredWidth) {
  const boundsWidth = dashboard
    ? dashboard.clientWidth
    : Math.max(1240, window.innerWidth - 40);
  const usableWidth = Math.max(320, boundsWidth - DESKTOP_WIDGET_MARGIN * 2);
  const computedWidth = Math.floor(
    (usableWidth - (COLUMN_MODE_MAX_COLUMNS - 1) * COLUMN_MODE_GAP) /
      COLUMN_MODE_MAX_COLUMNS,
  );
  const widgetWidth = Math.min(
    360,
    Math.max(220, preferredWidth || computedWidth),
  );
  const maxLeft = Math.max(
    DESKTOP_WIDGET_MARGIN,
    boundsWidth - widgetWidth - DESKTOP_WIDGET_MARGIN,
  );
  const columnAnchors = Array.from(
    { length: COLUMN_MODE_MAX_COLUMNS },
    (_, index) =>
      Math.min(
        DESKTOP_WIDGET_MARGIN + index * (widgetWidth + COLUMN_MODE_GAP),
        maxLeft,
      ),
  );
  return { widgetWidth, columnAnchors };
}

function snapWidgetPositionToColumn(position, dashboard, cardWidth) {
  const { columnAnchors } = getColumnModeMetrics(dashboard, cardWidth);
  if (columnAnchors.length === 0) return position;
  const currentLeft = Number(position?.left) || 0;
  const snappedLeft = columnAnchors.reduce(
    (closest, candidate) =>
      Math.abs(candidate - currentLeft) < Math.abs(closest - currentLeft)
        ? candidate
        : closest,
    columnAnchors[0],
  );
  return {
    left: snappedLeft,
    top: Math.round(Number(position?.top) || 0),
  };
}

function resetDashboardGridOrder() {
  const dashboard = document.getElementById("dashboard-grid");
  if (!dashboard) return;
  layoutModules.forEach(([, id]) => {
    const card = document.getElementById(id);
    if (card) dashboard.appendChild(card);
  });
  localStorage.removeItem("dashboardLayout");
}

function applyWidgetLayoutMode() {
  const dashboard = document.getElementById("dashboard-grid");
  if (!dashboard) return;

  const cards = dashboard.querySelectorAll(".card");
  const enableWidgetLayout = isWidgetLayoutEnabled();
  dashboard.classList.toggle("widget-layout", enableWidgetLayout);

  if (!enableWidgetLayout) {
    cards.forEach((card) => {
      card.style.position = "";
      card.style.left = "";
      card.style.top = "";
      card.style.width = "";
      card.style.height = "";
      card.style.gridRowEnd = "";
      card.style.removeProperty("--widget-scale");
      card.classList.remove("widget-compact", "widget-icon-mode");
    });
    triggerMasonryUpdate();
    return;
  }

  const dashboardWidth = dashboard.clientWidth;
  const { widgetWidth } = getColumnModeMetrics(dashboard);
  const sizeBounds = getWidgetSizeBounds(dashboard);
  let maxBottom = 0;

  cards.forEach((card, index) => {
    if (card.style.display === "none") return;
    const defaultWidth = Math.max(
      sizeBounds.minWidth,
      Math.min(sizeBounds.maxWidth, widgetWidth || WIDGET_DEFAULT_WIDTH),
    );
    const defaultHeight = Math.max(
      sizeBounds.minHeight,
      card.offsetHeight || WIDGET_DEFAULT_HEIGHT,
    );
    const defaultPos = getDefaultWidgetPosition(index, widgetWidth);
    const metrics = normalizeWidgetMetrics(
      card,
      dashboard,
      defaultWidth,
      defaultHeight,
    );
    const maxX = dashboardWidth - metrics.width - DESKTOP_WIDGET_MARGIN;
    const maxY = getWidgetMaxY(metrics.height, dashboard);
    const storedMetrics = dashSettings.widgetPositions[card.id] || {};
    const savedPos = {
      left: Object.prototype.hasOwnProperty.call(storedMetrics, "left")
        ? metrics.left
        : defaultPos.left,
      top: Object.prototype.hasOwnProperty.call(storedMetrics, "top")
        ? metrics.top
        : defaultPos.top,
    };
    const clampedPos = clampWidgetPosition(savedPos, maxX, maxY);
    const clamped = {
      ...clampedPos,
      width: metrics.width,
      height: metrics.height,
    };
    card.style.width = `${metrics.width}px`;
    card.style.height = `${metrics.height}px`;
    applyWidgetScale(card, metrics.width, metrics.height);
    dashSettings.widgetPositions[card.id] = clamped;
    card.style.left = `${clamped.left}px`;
    card.style.top = `${clamped.top}px`;
    maxBottom = Math.max(maxBottom, clamped.top + metrics.height);
  });

  dashboard.style.minHeight = `${Math.max(640, maxBottom + 80)}px`;
  persistLayoutMode();
}

function initTheme() {
  let savedTheme = localStorage.getItem("dashboardTheme");
  if (!savedTheme) savedTheme = "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
  applyBackground();
  applyVisuals();
}

function toggleTheme() {
  let current = document.documentElement.getAttribute("data-theme");
  let next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("dashboardTheme", next);
  updateThemeIcon(next);
  applyBackground();
  applyVisuals();
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (icon) icon.className = theme === "dark" ? "ph ph-sun" : "ph ph-moon";
}

async function applyBackground() {
  // If a theme explicitly overrides the background in CSS (Terminal/Pixel/Cyberpunk),
  // setting inline background to '' lets the CSS take over.
  // If user explicitly chose 'solid' or 'image', we override the theme's background.
  if (dashSettings.bgType === "solid") {
    document.body.style.background = getSafeSolidBackgroundColor(
      dashSettings.bgValue,
    );
  } else if (dashSettings.bgType === "image") {
    document.body.style.background = `url('${dashSettings.bgValue}') center/cover no-repeat fixed`;
  } else {
    document.body.style.background = "";
  }
}

function isValidHexColor(value) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((value || "").trim());
}

function getSafeSolidBackgroundColor(value) {
  if (isValidHexColor(value)) return value.trim();
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "#141e30"
    : "#fdfbfb";
}

function adjustColorHover(color, amount) {
  let hex = color.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  let r = parseInt(hex.substring(0, 2), 16) + amount;
  let g = parseInt(hex.substring(2, 4), 16) + amount;
  let b = parseInt(hex.substring(4, 6), 16) + amount;
  r = Math.max(0, Math.min(255, r)).toString(16).padStart(2, "0");
  g = Math.max(0, Math.min(255, g)).toString(16).padStart(2, "0");
  b = Math.max(0, Math.min(255, b)).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

let cachedCardsForVisuals = null;
function applyVisuals() {
  const root = document.documentElement;

  // Inject Theme Style Class
  root.setAttribute("data-theme-style", dashSettings.themeStyle);

  // Revert free-floating styles only when we are in grid mode
  if (!isWidgetLayoutEnabled()) {
    if (!cachedCardsForVisuals) {
      cachedCardsForVisuals = Array.from(document.querySelectorAll(".card"));
    }
    for (let i = 0; i < cachedCardsForVisuals.length; i++) {
      const card = cachedCardsForVisuals[i];
      card.style.position = "";
      card.style.left = "";
      card.style.top = "";
      card.style.zIndex = "";
      card.style.margin = "";
      card.style.width = "";
      card.style.height = "";
    }
    const dashboard = document.getElementById("dashboard-grid");
    if (dashboard) dashboard.style.display = ""; // Reset back to grid display via CSS class
    setTimeout(triggerMasonryUpdate, 100);
  } else {
    applyWidgetLayoutMode();
  }

  // Inject Custom Accent Color
  if (dashSettings.accentColor) {
    root.style.setProperty("--accent", dashSettings.accentColor);
    root.style.setProperty(
      "--accent-hover",
      adjustColorHover(dashSettings.accentColor, -20),
    );
  }

  // Dynamic Iconography Weight
  const iconWeight = getThemeIconWeight();

  // ⚡ Bolt Performance: Combine duplicate DOM queries into a single iteration to eliminate redundant traversal
  document.querySelectorAll('i[class*="ph-"]').forEach((icon) => {
    // Ensure all icons have aria-hidden="true" for accessibility
    if (!icon.hasAttribute("aria-hidden")) {
      icon.setAttribute("aria-hidden", "true");
    }

    // Skip explicitly filled icons if they are structural, but if material we want mostly filled
    if (
      icon.classList.contains("ph-fill") &&
      dashSettings.themeStyle !== "material"
    )
      return;

    // Remove existing weight classes
    icon.classList.remove(
      "ph-thin",
      "ph-light",
      "ph-regular",
      "ph-bold",
      "ph-fill",
      "ph-duotone",
    );

    // Add the new weight class
    icon.classList.add(iconWeight);
  });
}

function getThemeIconWeight() {
  let iconWeight = "ph-regular";
  if (dashSettings.themeStyle === "glass") iconWeight = "ph-thin";
  else if (dashSettings.themeStyle === "brutalism") iconWeight = "ph-bold";
  else if (dashSettings.themeStyle === "terminal") iconWeight = "ph-bold";
  else if (dashSettings.themeStyle === "pixel") iconWeight = "ph-bold";
  else if (dashSettings.themeStyle === "material") iconWeight = "ph-fill";
  else if (dashSettings.themeStyle === "cyberpunk") iconWeight = "ph-light";
  else if (dashSettings.themeStyle === "e-ink") iconWeight = "ph-bold";
  return iconWeight;
}



// --- SMART WORKSPACES ENGINE ---

// Convert legacy profiles to the new custom workspace format
function migrateLegacyProfilesToWorkspaces() {
  if (Object.keys(dashSettings.workspaces).length === 0) {
    for (const [key, preset] of Object.entries(PROFILE_PRESETS)) {
      dashSettings.workspaces[key] = {
        name: key.charAt(0).toUpperCase() + key.slice(1),
        themeStyle: preset.themeStyle,
        accentColor: preset.accentColor,
        compactMode: preset.compactMode,
        calcCompactMode: preset.calcCompactMode,
        visibility: { ...preset.visibility },
        layoutMode: "grid", // default to grid for legacy presets
        widgetPositions: {},
      };
    }
    // Set custom as empty
    dashSettings.workspaces["custom"] = {
      name: "Custom",
      themeStyle: "glass",
      accentColor: "#0066cc",
      compactMode: false,
      calcCompactMode: false,
      visibility: { ...defaultVis },
      layoutMode: "grid",
      widgetPositions: {},
    };
    saveSettingsToStorage();
  }
}

function saveSettingsToStorage() {
  localStorage.setItem("dashSettings", JSON.stringify(dashSettings));
}

function applyWorkspace(workspaceId) {
  const workspace = dashSettings.workspaces[workspaceId] || PROFILE_PRESETS[workspaceId];
  if (!workspace) return;

  dashSettings.activeProfile = workspaceId;
  dashSettings.themeStyle = workspace.themeStyle || "glass";
  dashSettings.accentColor = workspace.accentColor || "#0066cc";
  dashSettings.compactMode = !!workspace.compactMode;
  dashSettings.calcCompactMode = !!workspace.calcCompactMode;
  dashSettings.visibility = { ...defaultVis, ...(workspace.visibility || {}) };
  dashSettings.layoutMode = workspace.layoutMode || "grid";
  dashSettings.widgetPositions = workspace.widgetPositions ? JSON.parse(JSON.stringify(workspace.widgetPositions)) : {};

  saveSettingsToStorage();

  // Apply UI changes
  applyBackground();
  applyVisuals();
  applyLayoutVisibility();

  if (dashSettings.compactMode) document.body.classList.add("compact-mode");
  else document.body.classList.remove("compact-mode");

  if (dashSettings.calcCompactMode)
    document.body.classList.add("calc-compact-mode");
  else document.body.classList.remove("calc-compact-mode");

  triggerMasonryUpdate();
}

function saveCurrentWorkspace(name) {
  const id = name.trim().toLowerCase().replace(/\s+/g, '-');
  if (!id) return;

  dashSettings.workspaces[id] = {
    name: name.trim(),
    themeStyle: dashSettings.themeStyle,
    accentColor: dashSettings.accentColor,
    compactMode: dashSettings.compactMode,
    calcCompactMode: dashSettings.calcCompactMode,
    visibility: { ...dashSettings.visibility },
    layoutMode: dashSettings.layoutMode,
    widgetPositions: JSON.parse(JSON.stringify(dashSettings.widgetPositions)),
  };

  dashSettings.activeProfile = id;
  saveSettingsToStorage();
  renderWorkspacesList();
}

function deleteWorkspace(id) {
  if (dashSettings.workspaces[id]) {
    delete dashSettings.workspaces[id];

    // Remove any schedules for this workspace
    dashSettings.workspaceSchedules = dashSettings.workspaceSchedules.filter(s => s.workspaceId !== id);

    if (dashSettings.activeProfile === id) {
       dashSettings.activeProfile = "custom";
    }
    saveSettingsToStorage();
    renderWorkspacesList();
  }
}

function addWorkspaceSchedule(timeStr, workspaceId) {
   if (!timeStr || !workspaceId) return;

   // Check if schedule for this time already exists
   const existingIdx = dashSettings.workspaceSchedules.findIndex(s => s.time === timeStr);
   if (existingIdx !== -1) {
      dashSettings.workspaceSchedules[existingIdx].workspaceId = workspaceId;
   } else {
      dashSettings.workspaceSchedules.push({ time: timeStr, workspaceId });
   }

   dashSettings.workspaceSchedules.sort((a,b) => a.time.localeCompare(b.time));
   saveSettingsToStorage();
   renderWorkspacesList();
}

function removeWorkspaceSchedule(timeStr) {
   dashSettings.workspaceSchedules = dashSettings.workspaceSchedules.filter(s => s.time !== timeStr);
   saveSettingsToStorage();
   renderWorkspacesList();
}



function renderWorkspacesList() {
   const select = document.getElementById("set-workspace");
   const scheduleSelect = document.getElementById("schedule-workspace-select");
   if (!select || !scheduleSelect) return;

   let optionsHtml = '';
   for (const [id, ws] of Object.entries(dashSettings.workspaces)) {
       optionsHtml += `<option value="${id}">${escapeHtml(ws.name)}</option>`;
   }

   select.innerHTML = optionsHtml;
   scheduleSelect.innerHTML = optionsHtml;

   select.value = dashSettings.activeProfile || "custom";

   // Render schedules
   const list = document.getElementById("workspace-schedules-list");
   if (!list) return;

   if (!dashSettings.workspaceSchedules || dashSettings.workspaceSchedules.length === 0) {
      list.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic;">No schedules set.</div>`;
      return;
   }

   let schedulesHtml = '';
   dashSettings.workspaceSchedules.forEach(schedule => {
      const wsName = dashSettings.workspaces[schedule.workspaceId]?.name || schedule.workspaceId;
      schedulesHtml += `
         <div style="display: flex; justify-content: space-between; align-items: center; background: var(--inner-bg); padding: 8px 12px; border-radius: 8px; font-size: 0.85rem; border: 1px solid var(--glass-border);">
            <span><strong style="color: var(--accent);">${schedule.time}</strong> &rarr; ${escapeHtml(wsName)}</span>
            <button type="button" class="icon-btn" onclick="removeWorkspaceSchedule('${schedule.time}')" style="color: var(--danger); width: 24px; height: 24px; min-height: 0;">
               <i class="ph ph-x" aria-hidden="true"></i>
            </button>
         </div>
      `;
   });
   list.innerHTML = schedulesHtml;
}


// --- OS THEME LOGIC ---

function applyLayoutVisibility() {
  for (let i = 0; i < layoutModules.length; i++) {
    const [key, id] = layoutModules[i];

    // ⚡ Bolt Performance: Lazy-cache DOM elements to avoid repeated getElementById lookups
    if (!moduleCache[key]) {
      moduleCache[key] = document.getElementById(id);
    }
    const el = moduleCache[key];

    if (el) {
      // Check if hidden by user settings OR if it's minimized in OS theme
      const isHidden = dashSettings.visibility[key] === false;
      const isMinimized =
        isWidgetLayoutEnabled() && dashSettings.minimizedModules.includes(key);

      if (isHidden || isMinimized) {
        el.style.display = "none";
      } else {
        el.style.display = "flex";
      }
    }
  }

  if (dashSettings.compactMode) document.body.classList.add("compact-mode");
  else document.body.classList.remove("compact-mode");

  if (dashSettings.calcCompactMode)
    document.body.classList.add("calc-compact-mode");
  else document.body.classList.remove("calc-compact-mode");

  updateModuleWindowControlsVisibility();
  renderMinimizedModuleIcons();
}

function getMinimizedIconsContainer() {
  let container = document.getElementById("minimized-icons-layer");
  if (container) return container;

  const dashboard = document.getElementById("dashboard-grid");
  if (!dashboard) return null;

  container = document.createElement("div");
  container.id = "minimized-icons-layer";
  container.className = "minimized-icons-layer";
  dashboard.appendChild(container);
  return container;
}

function getDefaultMinimizedIconPosition(moduleKey, dashboard) {
  const moduleIndex = Math.max(
    0,
    layoutModules.findIndex(([key]) => key === moduleKey),
  );
  const iconsPerRow = Math.max(
    1,
    Math.floor(
      (dashboard.clientWidth - MODULE_ICON_MARGIN * 2) /
        (MODULE_ICON_SIZE + 10),
    ),
  );
  const row = Math.floor(moduleIndex / iconsPerRow);
  const col = moduleIndex % iconsPerRow;
  return {
    left: MODULE_ICON_MARGIN + col * (MODULE_ICON_SIZE + 10),
    top: MODULE_ICON_MARGIN + row * (MODULE_ICON_SIZE + 10),
  };
}

function clampMinimizedIconPosition(position, dashboard) {
  const maxX = Math.max(
    0,
    dashboard.clientWidth - MODULE_ICON_SIZE - MODULE_ICON_MARGIN,
  );
  const maxY = Math.max(
    0,
    dashboard.scrollHeight - MODULE_ICON_SIZE - MODULE_ICON_MARGIN,
  );
  return {
    left: Math.max(0, Math.min(Math.round(position.left || 0), maxX)),
    top: Math.max(0, Math.min(Math.round(position.top || 0), maxY)),
  };
}

function minimizeModule(moduleKey) {
  if (!moduleKey || !isWidgetLayoutEnabled()) return;
  if (!dashSettings.minimizedModules.includes(moduleKey)) {
    dashSettings.minimizedModules.push(moduleKey);
  }
  persistLayoutMode();
  applyLayoutVisibility();
  triggerMasonryUpdate();
}

function restoreModuleFromIcon(moduleKey) {
  if (!moduleKey) return;
  dashSettings.minimizedModules = dashSettings.minimizedModules.filter(
    (key) => key !== moduleKey,
  );
  persistLayoutMode();
  applyLayoutVisibility();
  const card = document.getElementById(getCardIdByModuleKey(moduleKey));
  if (card) {
    bringWidgetToFront(card);
    card.classList.add("focus-glow");
    setTimeout(() => card.classList.remove("focus-glow"), 950);
  }
  triggerMasonryUpdate();
}

function closeModule(moduleKey) {
  if (!moduleKey) return;
  dashSettings.visibility[moduleKey] = false;
  dashSettings.minimizedModules = dashSettings.minimizedModules.filter(
    (key) => key !== moduleKey,
  );
  persistLayoutMode();
  applyLayoutVisibility();
  triggerMasonryUpdate();
}

function renderMinimizedModuleIcons() {
  const container = getMinimizedIconsContainer();
  const dashboard = document.getElementById("dashboard-grid");
  if (!container || !dashboard) return;

  const showIcons =
    isWidgetLayoutEnabled() && dashSettings.minimizedModules.length > 0;
  container.classList.toggle("active", showIcons);
  container.innerHTML = "";

  if (!showIcons) return;

  dashSettings.minimizedModules.forEach((moduleKey) => {
    if (dashSettings.visibility[moduleKey] === false) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "minimized-module-icon";
    btn.dataset.moduleKey = moduleKey;
    btn.setAttribute("aria-label", `Restore ${moduleKey} module`);
    btn.title = `Restore ${moduleKey}`;
    btn.innerHTML = `<i class="ph ${MODULE_TYPE_ICONS[moduleKey] || "ph-app-window"}" aria-hidden="true"></i>`;

    const defaultPos = getDefaultMinimizedIconPosition(moduleKey, dashboard);
    const savedPos =
      dashSettings.minimizedIconPositions[moduleKey] || defaultPos;
    const clamped = clampMinimizedIconPosition(savedPos, dashboard);
    dashSettings.minimizedIconPositions[moduleKey] = clamped;
    btn.style.left = `${clamped.left}px`;
    btn.style.top = `${clamped.top}px`;

    btn.addEventListener("click", () => restoreModuleFromIcon(moduleKey));
    bindMinimizedIconDragging(btn, moduleKey);
    container.appendChild(btn);
  });
}

function bindMinimizedIconDragging(iconBtn, moduleKey) {
  if (iconBtn.dataset.dragBound === "true") return;
  iconBtn.dataset.dragBound = "true";

  const dashboard = document.getElementById("dashboard-grid");
  if (!dashboard) return;

  iconBtn.addEventListener("pointerdown", (event) => {
    if (!isWidgetLayoutEnabled()) return;
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const iconRect = iconBtn.getBoundingClientRect();
    const dashboardRect = dashboard.getBoundingClientRect();
    const pointerOffsetX = event.clientX - iconRect.left;
    const pointerOffsetY = event.clientY - iconRect.top;
    let hasMoved = false;

    iconBtn.classList.add("dragging");
    iconBtn.setPointerCapture(event.pointerId);

    const onPointerMove = (moveEvent) => {
      hasMoved = true;
      const unclampedPos = {
        left: moveEvent.clientX - dashboardRect.left - pointerOffsetX,
        top: moveEvent.clientY - dashboardRect.top - pointerOffsetY,
      };
      const nextPos = clampMinimizedIconPosition(unclampedPos, dashboard);
      iconBtn.style.left = `${nextPos.left}px`;
      iconBtn.style.top = `${nextPos.top}px`;
      dashSettings.minimizedIconPositions[moduleKey] = nextPos;
    };

    const onPointerUp = () => {
      iconBtn.classList.remove("dragging");
      iconBtn.releasePointerCapture(event.pointerId);
      iconBtn.removeEventListener("pointermove", onPointerMove);
      iconBtn.removeEventListener("pointerup", onPointerUp);
      iconBtn.removeEventListener("pointercancel", onPointerUp);
      if (hasMoved) persistLayoutMode();
    };

    iconBtn.addEventListener("pointermove", onPointerMove);
    iconBtn.addEventListener("pointerup", onPointerUp);
    iconBtn.addEventListener("pointercancel", onPointerUp);
  });
}

function initModuleWindowControls() {
  const cards = document.querySelectorAll("#dashboard-grid .card");
  cards.forEach((card) => {
    const moduleKey = getModuleKeyByCardId(card.id);
    if (!moduleKey) return;

    let controls = card.querySelector(".module-window-controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "module-window-controls";
      controls.innerHTML = `
                <button type="button" class="icon-btn module-minimize-btn" aria-label="Minimize module" title="Minimize Module">
                    <i class="ph ph-minus" aria-hidden="true"></i>
                </button>
                <button type="button" class="icon-btn module-close-btn" aria-label="Close module" title="Close Module">
                    <i class="ph ph-x" aria-hidden="true"></i>
                </button>
            `;
    }

    const minimizeBtn = controls.querySelector(".module-minimize-btn");
    const closeBtn = controls.querySelector(".module-close-btn");
    if (minimizeBtn) minimizeBtn.onclick = () => minimizeModule(moduleKey);
    if (closeBtn) closeBtn.onclick = () => closeModule(moduleKey);

    const header = card.querySelector(".card-header");
    if (header) {
      header.appendChild(controls);
    } else {
      controls.classList.add("module-window-controls-floating");
      card.appendChild(controls);
    }
  });
  updateModuleWindowControlsVisibility();
}

function updateModuleWindowControlsVisibility() {
  const isFreeRoam = isWidgetLayoutEnabled();
  document.querySelectorAll(".module-window-controls").forEach((controls) => {
    controls.classList.toggle("free-roam", isFreeRoam);
    const minimizeBtn = controls.querySelector(".module-minimize-btn");
    if (minimizeBtn) {
      minimizeBtn.style.display = isFreeRoam ? "" : "none";
    }
  });
}

function initCustomRssTab() {
  const customTab = document.getElementById("tab-custom");
  if (customTab) {
    if (dashSettings.customRssUrl && dashSettings.customRssName) {
      customTab.style.display = "block";
      customTab.innerText = dashSettings.customRssName;
    } else {
      customTab.style.display = "none";

      if (currentNewsCategory === "custom") {
        currentNewsCategory = "top";
        renderNewsTabs(); // Reset active classes properly
        fetchNews("top"); // fallback
      }
    }
  }
}

function openSettings() {


  renderWorkspacesList();

  document.getElementById("set-name").value = dashSettings.name;
  document.getElementById("set-clock24").checked = dashSettings.clock24;
  document.getElementById("set-weather").value = dashSettings.weatherCity;

  // Visuals
  document.getElementById("set-theme").value =
    dashSettings.themeStyle || "glass";
  document.getElementById("set-accent").value =
    dashSettings.accentColor || "#0066cc";

  // Layout Toggles
  document.getElementById("set-compact").checked = dashSettings.compactMode;
  document.getElementById("set-calc-compact").checked =
    dashSettings.calcCompactMode;
  Object.keys(defaultVis).forEach((k) => {
    const chk = document.getElementById(`vis-${k}`);
    if (chk) chk.checked = dashSettings.visibility[k] !== false;
  });

  selectBgType(dashSettings.bgType);
  const bgColorInput = document.getElementById("set-bg-color");
  const bgImageInput = document.getElementById("set-bg-image");
  if (bgColorInput)
    bgColorInput.value = getSafeSolidBackgroundColor(dashSettings.bgValue);
  if (bgImageInput)
    bgImageInput.value =
      dashSettings.bgType === "image" ? dashSettings.bgValue : "";
  renderCustomRssSourceSelector();
  renderCustomRssSourcesList();
  document.getElementById("settings-modal").classList.add("active");
}

function closeSettings() {
  document.getElementById("settings-modal").classList.remove("active");
}
function closeSettingsOverlay(e) {
  if (e.target.id === "settings-modal") closeSettings();
}
function openShortcuts() {
  document.getElementById("shortcuts-modal").classList.add("active");
}
function closeShortcuts() {
  document.getElementById("shortcuts-modal").classList.remove("active");
}
function closeShortcutsOverlay(e) {
  if (e.target.id === "shortcuts-modal") closeShortcuts();
}

function persistDashboardSettingsFromContextMenu() {
  dashSettings.activeProfile = "custom";
  localStorage.setItem("dashSettings", JSON.stringify(dashSettings));
  applyBackground();
  applyVisuals();
  applyLayoutVisibility();
  triggerMasonryUpdate();
}

function closeContextMenu() {
  const contextMenu = document.getElementById("dashboard-context-menu");
  if (!contextMenu) return;
  contextMenu.classList.remove("active");
  contextMenu.style.left = "";
  contextMenu.style.top = "";
}

function openContextMenu(x, y) {
  const contextMenu = document.getElementById("dashboard-context-menu");
  if (!contextMenu) return;

  contextMenu.classList.add("active");
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;

  const menuRect = contextMenu.getBoundingClientRect();
  const maxX = window.innerWidth - menuRect.width - 8;
  const maxY = window.innerHeight - menuRect.height - 8;

  contextMenu.style.left = `${Math.max(8, Math.min(x, maxX))}px`;
  contextMenu.style.top = `${Math.max(8, Math.min(y, maxY))}px`;
}

function handleContextMenuAction(action) {
  if (!action) return;

  if (action === "open-settings") {
    openSettings();
    return;
  }
  if (action === "layout-freeform") {
    dashSettings.layoutMode = "freeform";
    applyLayoutVisibility();
    persistLayoutMode();
    return;
  }
  if (action === "layout-grid-reset") {
    dashSettings.layoutMode = "grid";
    applyLayoutVisibility();
    persistLayoutMode();
    triggerMasonryUpdate();
    return;
  }
  if (action === "set-bg-solid") {
    const contextBgColorInput = document.getElementById(
      "context-bg-color-picker",
    );
    if (contextBgColorInput) {
      contextBgColorInput.value = getSafeSolidBackgroundColor(
        dashSettings.bgValue,
      );
      contextBgColorInput.click();
      return;
    }
    const solidColor = prompt(
      "Enter a background color (hex, rgb, or named color):",
      dashSettings.bgValue || "#141e30",
    );
    if (!solidColor) return;
    dashSettings.bgType = "solid";
    dashSettings.bgValue = solidColor.trim();
    persistDashboardSettingsFromContextMenu();
    return;
  }
  if (action === "set-bg-wallpaper") {
    const wallpaperUrl = prompt(
      "Enter an image URL for wallpaper:",
      dashSettings.bgType === "image" ? dashSettings.bgValue : "",
    );
    if (!wallpaperUrl) return;
    dashSettings.bgType = "image";
    dashSettings.bgValue = wallpaperUrl.trim();
    persistDashboardSettingsFromContextMenu();
    return;
  }
  if (action === "set-bg-animated") {
    dashSettings.bgType = "animated";
    dashSettings.bgValue = "";
    persistDashboardSettingsFromContextMenu();
    return;
  }
  if (action === "toggle-theme") {
    toggleTheme();
    return;
  }
  if (action === "toggle-compact-mode") {
    dashSettings.compactMode = !dashSettings.compactMode;
    persistDashboardSettingsFromContextMenu();
  }
}

function initDesktopContextMenu() {
  const contextMenu = document.getElementById("dashboard-context-menu");
  if (!contextMenu) return;
  const contextBgColorInput = document.getElementById(
    "context-bg-color-picker",
  );

  document.addEventListener("contextmenu", (event) => {
    const isEditable = event.target.closest(
      'input, textarea, [contenteditable="true"]',
    );
    if (isEditable) return;
    event.preventDefault();
    openContextMenu(event.clientX, event.clientY);
  });

  document.addEventListener("click", () => closeContextMenu());
  window.addEventListener("resize", closeContextMenu);
  window.addEventListener("scroll", closeContextMenu, true);

  contextMenu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-context-action]");
    if (!button) return;
    handleContextMenuAction(button.dataset.contextAction);
    closeContextMenu();
  });

  if (contextBgColorInput) {
    contextBgColorInput.addEventListener("input", () => {
      dashSettings.bgType = "solid";
      dashSettings.bgValue = contextBgColorInput.value;
      persistDashboardSettingsFromContextMenu();
    });
  }
}

function bindCoreUiEvents() {
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  const openSettingsBtn = document.getElementById("open-settings-btn");
  if (openSettingsBtn) openSettingsBtn.addEventListener("click", openSettings);

  const openShortcutsBtn = document.getElementById("open-shortcuts-btn");
  if (openShortcutsBtn)
    openShortcutsBtn.addEventListener("click", openShortcuts);

  const settingsModal = document.getElementById("settings-modal");
  if (settingsModal)
    settingsModal.addEventListener("click", closeSettingsOverlay);

  const shortcutsModal = document.getElementById("shortcuts-modal");
  if (shortcutsModal)
    shortcutsModal.addEventListener("click", closeShortcutsOverlay);

  const settingsCloseBtn = document.getElementById("settings-close-btn");
  if (settingsCloseBtn)
    settingsCloseBtn.addEventListener("click", closeSettings);

  const shortcutsCloseBtn = document.getElementById("shortcuts-close-btn");
  if (shortcutsCloseBtn)
    shortcutsCloseBtn.addEventListener("click", closeShortcuts);

  const settingsCancelBtn = document.getElementById("settings-cancel-btn");
  if (settingsCancelBtn)
    settingsCancelBtn.addEventListener("click", closeSettings);

  const settingsSaveBtn = document.getElementById("settings-save-btn");
  if (settingsSaveBtn) settingsSaveBtn.addEventListener("click", saveSettings);


  const applyWsBtn = document.getElementById("apply-workspace-btn");
  if (applyWsBtn) applyWsBtn.addEventListener("click", () => {
     const id = document.getElementById("set-workspace").value;
     applyWorkspace(id);
     closeSettings();
  });

  const saveWsBtn = document.getElementById("save-workspace-btn");
  if (saveWsBtn) saveWsBtn.addEventListener("click", () => {
     const name = document.getElementById("save-workspace-name").value;
     if (name) {
        saveCurrentWorkspace(name);
        document.getElementById("save-workspace-name").value = "";
     }
  });

  const delWsBtn = document.getElementById("delete-workspace-btn");
  if (delWsBtn) delWsBtn.addEventListener("click", () => {
     const id = document.getElementById("set-workspace").value;
     if (confirm("Delete this workspace?")) {
        deleteWorkspace(id);
     }
  });

  const addSchedBtn = document.getElementById("add-schedule-btn");
  if (addSchedBtn) addSchedBtn.addEventListener("click", () => {
     const time = document.getElementById("schedule-time-input").value;
     const id = document.getElementById("schedule-workspace-select").value;
     if (time && id) {
        addWorkspaceSchedule(time, id);
     }
  });

  const rssAddBtn = document.getElementById("rss-add-btn");
  if (rssAddBtn) rssAddBtn.addEventListener("click", addCustomRssSource);

  document.querySelectorAll(".bg-btn[data-bg-type]").forEach((btn) => {
    btn.addEventListener("click", () => selectBgType(btn.dataset.bgType));
  });

}




function selectBgType(type) {
  document.querySelectorAll(".bg-btn").forEach((b) => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });
  const btn = document.getElementById(
    "bg-btn-" + (type === "animated" ? "anim" : type),
  );
  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
  }
  dashSettings.bgType = type;
  const colorInput = document.getElementById("set-bg-color");
  const imageInput = document.getElementById("set-bg-image");
  if (!colorInput || !imageInput) return;

  if (type === "solid") {
    colorInput.style.display = "block";
    imageInput.style.display = "none";
    colorInput.value = getSafeSolidBackgroundColor(dashSettings.bgValue);
  } else if (type === "image") {
    colorInput.style.display = "none";
    imageInput.style.display = "block";
    imageInput.value =
      dashSettings.bgType === "image" ? dashSettings.bgValue : "";
  } else {
    colorInput.style.display = "none";
    imageInput.style.display = "none";
  }
}

function saveSettings() {


  dashSettings.name = document.getElementById("set-name").value.trim();
  dashSettings.clock24 = document.getElementById("set-clock24").checked;

  // Visuals
  dashSettings.themeStyle = document.getElementById("set-theme").value;
  dashSettings.accentColor = document.getElementById("set-accent").value;
  // Layout Toggles
  dashSettings.compactMode = document.getElementById("set-compact").checked;
  dashSettings.calcCompactMode =
    document.getElementById("set-calc-compact").checked;
  Object.keys(defaultVis).forEach((k) => {
    const chk = document.getElementById(`vis-${k}`);
    if (chk) dashSettings.visibility[k] = chk.checked;
  });

  const oldCity = dashSettings.weatherCity;
  dashSettings.weatherCity = document
    .getElementById("set-weather")
    .value.trim();
  const bgColorInput = document.getElementById("set-bg-color");
  const bgImageInput = document.getElementById("set-bg-image");
  if (dashSettings.bgType === "solid") {
    dashSettings.bgValue = getSafeSolidBackgroundColor(bgColorInput?.value);
  } else if (dashSettings.bgType === "image") {
    dashSettings.bgValue = (bgImageInput?.value || "").trim();
  } else {
    dashSettings.bgValue = "";
  }

  localStorage.setItem("dashSettings", JSON.stringify(dashSettings));

  applyBackground();
  applyVisuals();
  applyLayoutVisibility();
  applyWidgetLayoutMode();
  initCustomRssTab();
  closeSettings();
  startClock();
  triggerMasonryUpdate();
  if (oldCity !== dashSettings.weatherCity) {
    const wc = document.getElementById("weather-container");
    if (wc) {
      wc.setAttribute("aria-busy", "true");
      const hasExisting = wc.querySelector(".current-weather-main");
      if (hasExisting) {
        wc.style.opacity = "0.5";
        wc.style.pointerEvents = "none";
        wc.style.transition = "opacity 0.2s ease";
      } else {
        wc.innerHTML =
          '<div class="loading"><i class="ph ph-spinner" aria-hidden="true"></i>Tracking atmospheric data...</div>';
      }
    }
    fetchWeatherForCity();
  }
}

const STORAGE_KEYS = {
  todos: "dashboardTodos",
  bookmarks: "dashboardBookmarks",
  notes: "dashboardNotes",
  layout: "dashboardLayout",
  settings: "dashSettings",
  theme: "dashboardTheme",
  holiday: "holidayState",
  weather: "weatherCardState",
  tornConfig: "dashboardTornTracker",
  bankApps: "dashboardBankApps",
  tornStats: "tornStatsState",
};

function exportData() {
  const data = Object.entries(STORAGE_KEYS).reduce((acc, [key, storageKey]) => {
    acc[key] = localStorage.getItem(storageKey);
    return acc;
  }, {});
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `dashboard_backup_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        if (data[key]) localStorage.setItem(storageKey, data[key]);
      });
      alert("Backup restored! Reloading...");
      location.reload();
    } catch (err) {
      alert("Invalid backup file.");
    }
  };
  reader.readAsText(file);
}

// --- SUB-ITEM DRAG & DROP ENGINE ---
let dragSrcEl = null;
let dragType = null;
function handleSubDragStart(e, type) {
  e.stopPropagation();
  dragSrcEl = e.target.closest("li, .shortcut-wrapper, .bank-app-wrapper");
  dragType = type;
  dragSrcEl.classList.add("dragging-item");

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragSrcEl.innerText || "dragging-item");
}
function handleSubDragOver(e) {
  e.preventDefault();
  return false;
}
function handleSubDrop(e, type, arrayObj, saveFunc, renderFunc) {
  e.stopPropagation();
  e.preventDefault();
  if (dragSrcEl && dragType === type) {
    const target = e.target.closest("li, .shortcut-wrapper, .bank-app-wrapper");
    if (target && target !== dragSrcEl) {
      const list = Array.from(target.parentNode.children);
      const srcIndex = list.indexOf(dragSrcEl);
      const targetIndex = list.indexOf(target);
      const movedItem = arrayObj.splice(srcIndex, 1)[0];
      arrayObj.splice(targetIndex, 0, movedItem);
      saveFunc();
      renderFunc();
    }
  }
  return false;
}
function handleSubDragEnd(e) {
  if (dragSrcEl) dragSrcEl.classList.remove("dragging-item");
  dragSrcEl = null;
  dragType = null;
}

// --- MASONRY ENGINE ---
let cachedMasonryCards = null;
let masonryTimeout = null;
const MASONRY_ROW_GAP = 20;

function triggerMasonryUpdate() {
  if (isWidgetLayoutEnabled()) {
    return;
  }
  clearTimeout(masonryTimeout);

  masonryTimeout = setTimeout(() => {
    if (!cachedMasonryCards) {
      cachedMasonryCards = document.getElementsByClassName("card");
    }

    const gridMasonryContainer = document.getElementById("dashboard-grid");
    if (gridMasonryContainer) {
      gridMasonryContainer.style.minHeight = gridMasonryContainer.offsetHeight + "px";
    }

    // ⚡ Bolt Performance: Reset gridRowEnd first in a separate write loop to allow shrinking without causing N+1 layout thrashing
    for (let i = 0; i < cachedMasonryCards.length; i++) {
      cachedMasonryCards[i].style.gridRowEnd = "auto";
    }

    // Batch DOM reads and writes to prevent layout thrashing
    const updates = [];
    for (let i = 0; i < cachedMasonryCards.length; i++) {
      const card = cachedMasonryCards[i];
      // ⚡ Bolt Performance: offsetHeight === 0 is significantly faster than getComputedStyle()
      const height = card.offsetHeight;
      if (height === 0) continue;
      updates.push({
        card,
        // ⚡ Bolt Performance: offsetHeight avoids the extra layout work from getBoundingClientRect()
        span: `span ${height + MASONRY_ROW_GAP}`,
      });
    }

    for (let i = 0; i < updates.length; i++) {
      updates[i].card.style.gridRowEnd = updates[i].span;
    }

    const gridMasonryContainerRef = document.getElementById("dashboard-grid");
    if (gridMasonryContainerRef) gridMasonryContainerRef.style.minHeight = "";
  }, 50);
}

function toggleSection(contentId, chevronId, storageKey) {
  const content = document.getElementById(contentId);
  const chevron = document.getElementById(chevronId);
  if (!content) return;
  if (content.style.display === "none") {
    content.style.display =
      contentId === "weather-details-view" ? "flex" : "block";
    chevron.classList.add("open");
    localStorage.setItem(storageKey, "open");
    const btn = document.querySelector(`[onclick*='${contentId}']`);
    if (btn) btn.setAttribute("aria-expanded", "true");
  } else {
    content.style.display = "none";
    chevron.classList.remove("open");
    localStorage.setItem(storageKey, "closed");
    const btn = document.querySelector(`[onclick*='${contentId}']`);
    if (btn) btn.setAttribute("aria-expanded", "false");
  }
  triggerMasonryUpdate();
}

// --- MAIN CARD DRAG AND DROP ENGINE ---
function initDragAndDrop(cards) {
  const dashboard = document.getElementById("dashboard-grid");
  let draggedItem = null;
  let dragArmedCard = null;
  let lastDropTarget = null;
  let lastInsertBefore = null;
  const savedOrder = safeParseJson(
    localStorage.getItem("dashboardLayout"),
    [],
    "dashboardLayout",
  );
  const searchEl = document.getElementById("mod-search");

  function clearDropIndicators() {
    dashboard
      .querySelectorAll(".card.drop-target-before, .card.drop-target-after")
      .forEach((el) => {
        el.classList.remove("drop-target-before", "drop-target-after");
      });
  }

  if (savedOrder && savedOrder.length > 0) {
    if (searchEl) dashboard.appendChild(searchEl); // Lock search to top
    savedOrder.forEach((id) => {
      const el = document.getElementById(id);
      if (el && id !== "mod-search") dashboard.appendChild(el);
    });
    cards.forEach((c) => {
      if (!savedOrder.includes(c.id) && c.id !== "mod-search")
        dashboard.appendChild(c);
    });
  }

  cards.forEach((card) => {
    const handle = card.querySelector(".drag-handle");
    if (handle) {
      const armDrag = () => {
        if (isWidgetLayoutEnabled()) return;
        dragArmedCard = card;
        card.setAttribute("draggable", "true");
        card.classList.add("drag-ready");
      };
      const disarmDrag = () => {
        if (draggedItem === card) return;
        if (dragArmedCard === card) dragArmedCard = null;
        card.setAttribute("draggable", "false");
        card.classList.remove("drag-ready");
      };

      handle.addEventListener("pointerdown", armDrag);
      handle.addEventListener("pointerup", disarmDrag);
      handle.addEventListener("pointercancel", disarmDrag);
      handle.addEventListener("mouseleave", disarmDrag);
      handle.addEventListener("blur", disarmDrag);
    }
    card.addEventListener("dragstart", function (e) {
      if (isWidgetLayoutEnabled()) {
        e.preventDefault();
        return;
      }
      if (e.target !== this) return;
      draggedItem = this;
      this.classList.remove("drag-ready");
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragend", function () {
      this.classList.remove("dragging", "drag-ready");
      this.setAttribute("draggable", "false");
      draggedItem = null;
      dragArmedCard = null;
      lastDropTarget = null;
      lastInsertBefore = null;
      clearDropIndicators();

      const currentLayout = [];
      const childNodes = dashboard.children;
      for (let i = 0; i < childNodes.length; i++) {
        const id = childNodes[i].id;
        if (id && id !== "mod-search") {
          currentLayout.push(id);
        }
      }

      localStorage.setItem("dashboardLayout", JSON.stringify(currentLayout));
      triggerMasonryUpdate();
    });
  });

  dashboard.addEventListener("dragover", (e) => {
    if (isWidgetLayoutEnabled()) return;
    e.preventDefault();
    if (
      !draggedItem ||
      draggedItem.classList.contains("todo-item") ||
      draggedItem.classList.contains("shortcut-wrapper") ||
      draggedItem.classList.contains("bank-app-wrapper")
    )
      return;
    const target = e.target.closest(".card");
    if (
      target &&
      target !== draggedItem &&
      !target.classList.contains("dragging") &&
      target.id !== "mod-search"
    ) {
      const rect = target.getBoundingClientRect();
      const insertBefore = e.clientY < rect.top + rect.height / 2;
      if (target === lastDropTarget && insertBefore === lastInsertBefore)
        return;

      lastDropTarget = target;
      lastInsertBefore = insertBefore;
      clearDropIndicators();
      target.classList.add(
        insertBefore ? "drop-target-before" : "drop-target-after",
      );
      if (insertBefore) {
        target.before(draggedItem);
      } else {
        target.after(draggedItem);
      }
    }
  });
  dashboard.addEventListener("dragleave", (e) => {
    if (!dashboard.contains(e.relatedTarget)) {
      clearDropIndicators();
      lastDropTarget = null;
      lastInsertBefore = null;
    }
  });
  dashboard.addEventListener("drop", () => {
    clearDropIndicators();
    lastDropTarget = null;
    lastInsertBefore = null;
  });
}

function initWidgetDragging(cards) {
  const dashboard = document.getElementById("dashboard-grid");
  if (!dashboard) return;

  cards.forEach((card) => {
    const handle = card.querySelector(".drag-handle");
    if (!handle || handle.dataset.widgetDragBound === "true") return;
    handle.dataset.widgetDragBound = "true";

    handle.addEventListener("pointerdown", (event) => {
      if (!isWidgetLayoutEnabled()) return;
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      const cardRect = card.getBoundingClientRect();
      const dashboardRect = dashboard.getBoundingClientRect();
      const pointerOffsetX = event.clientX - cardRect.left;
      const pointerOffsetY = event.clientY - cardRect.top;
      const dragStartX = event.clientX;
      const dragStartY = event.clientY;
      let hasMoved = false;
      let rafId = null;
      let lastPointer = { x: event.clientX, y: event.clientY };

      bringWidgetToFront(card);
      handle.setPointerCapture(event.pointerId);

      const applyDragPosition = () => {
        rafId = null;
        const maxX =
          dashboard.clientWidth - cardRect.width - DESKTOP_WIDGET_MARGIN;
        const unclampedPos = {
          left: lastPointer.x - dashboardRect.left - pointerOffsetX,
          top: lastPointer.y - dashboardRect.top - pointerOffsetY,
        };
        const desiredBottom =
          unclampedPos.top + cardRect.height + DESKTOP_WIDGET_MARGIN;
        if (desiredBottom > dashboard.scrollHeight) {
          dashboard.style.minHeight = `${Math.ceil(desiredBottom + 48)}px`;
        }

        const maxY = getWidgetMaxY(cardRect.height, dashboard);
        const nextPos = clampWidgetPosition(unclampedPos, maxX, maxY);
        card.style.left = `${nextPos.left}px`;
        card.style.top = `${nextPos.top}px`;
        dashSettings.widgetPositions[card.id] = nextPos;
      };

      const onPointerMove = (moveEvent) => {
        lastPointer = { x: moveEvent.clientX, y: moveEvent.clientY };
        if (!hasMoved) {
          const dragDistance = Math.hypot(
            moveEvent.clientX - dragStartX,
            moveEvent.clientY - dragStartY,
          );
          if (dragDistance < 2) return;
          hasMoved = true;
          card.classList.add("dragging");
        }
        if (rafId !== null) return;
        rafId = requestAnimationFrame(applyDragPosition);
      };

      const onPointerUp = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          applyDragPosition();
        }

        card.classList.remove("dragging");
        handle.releasePointerCapture(event.pointerId);
        handle.removeEventListener("pointermove", onPointerMove);
        handle.removeEventListener("pointerup", onPointerUp);
        handle.removeEventListener("pointercancel", onPointerUp);

        const currentPosition = dashSettings.widgetPositions[card.id] || {
          left: parseFloat(card.style.left) || 0,
          top: parseFloat(card.style.top) || 0,
        };
        const snappedPosition = snapWidgetPositionToColumn(
          currentPosition,
          dashboard,
          cardRect.width,
        );
        const maxX =
          dashboard.clientWidth - cardRect.width - DESKTOP_WIDGET_MARGIN;
        const maxY = getWidgetMaxY(cardRect.height, dashboard);
        const clampedSnap = clampWidgetPosition(snappedPosition, maxX, maxY);
        dashSettings.widgetPositions[card.id] = clampedSnap;
        card.style.left = `${clampedSnap.left}px`;
        card.style.top = `${clampedSnap.top}px`;

        persistLayoutMode();
        applyWidgetLayoutMode();
      };

      handle.addEventListener("pointermove", onPointerMove);
      handle.addEventListener("pointerup", onPointerUp);
      handle.addEventListener("pointercancel", onPointerUp);
    });
  });
}

function initResizableCards(cards) {
  const dashboard = document.getElementById("dashboard-grid");
  if (!dashboard) return;

  function persistCardMetrics(card, metrics) {
    dashSettings.widgetPositions[card.id] = {
      ...dashSettings.widgetPositions[card.id],
      ...metrics,
    };
    persistLayoutMode();
  }

  cards.forEach((card) => {
    if (card.id === "mod-calculator") return;
    let handle = card.querySelector(".card-resize-handle");
    if (!handle) {
      handle = document.createElement("button");
      handle.type = "button";
      handle.className = "card-resize-handle";
      handle.setAttribute("aria-label", "Resize widget");
      handle.setAttribute("role", "separator");
      handle.setAttribute("aria-orientation", "both");
      card.appendChild(handle);
    }

    const updateAriaValues = (width, height) => {
      const bounds = getWidgetSizeBounds(dashboard);
      handle.setAttribute(
        "aria-valuemin",
        `${bounds.minWidth} x ${bounds.minHeight}`,
      );
      handle.setAttribute(
        "aria-valuemax",
        `${bounds.maxWidth} x ${bounds.maxHeight}`,
      );
      handle.setAttribute(
        "aria-valuetext",
        `${Math.round(width)} by ${Math.round(height)} pixels`,
      );
    };

    handle.addEventListener("pointerdown", (e) => {
      if (!isWidgetLayoutEnabled()) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const bounds = getWidgetSizeBounds(dashboard);
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = card.offsetWidth;
      const startHeight = card.offsetHeight;
      const startRatio = startWidth / Math.max(1, startHeight);
      handle.classList.add("active");
      card.classList.add("resizing");
      bringWidgetToFront(card);
      handle.setPointerCapture(e.pointerId);

      const onMove = (moveEvt) => {
        moveEvt.preventDefault();
        const ratioLocked = moveEvt.shiftKey;
        let nextWidth = Math.max(
          bounds.minWidth,
          Math.min(bounds.maxWidth, startWidth + (moveEvt.clientX - startX)),
        );
        let nextHeight = Math.max(
          bounds.minHeight,
          Math.min(bounds.maxHeight, startHeight + (moveEvt.clientY - startY)),
        );
        if (ratioLocked) {
          const widthByHeight = nextHeight * startRatio;
          const heightByWidth = nextWidth / Math.max(0.01, startRatio);
          if (
            Math.abs(widthByHeight - nextWidth) <
            Math.abs(heightByWidth - nextHeight)
          ) {
            nextWidth = Math.max(
              bounds.minWidth,
              Math.min(bounds.maxWidth, widthByHeight),
            );
          } else {
            nextHeight = Math.max(
              bounds.minHeight,
              Math.min(bounds.maxHeight, heightByWidth),
            );
          }
        }

        const currentPos = dashSettings.widgetPositions[card.id] || {
          left: parseFloat(card.style.left) || 0,
          top: parseFloat(card.style.top) || 0,
        };
        const maxX = dashboard.clientWidth - nextWidth - DESKTOP_WIDGET_MARGIN;
        const maxY = getWidgetMaxY(nextHeight, dashboard);
        const clampedPos = clampWidgetPosition(currentPos, maxX, maxY);
        card.style.width = `${nextWidth}px`;
        card.style.height = `${nextHeight}px`;
        card.style.left = `${clampedPos.left}px`;
        card.style.top = `${clampedPos.top}px`;
        applyWidgetScale(card, nextWidth, nextHeight);
        updateAriaValues(nextWidth, nextHeight);

        dashSettings.widgetPositions[card.id] = {
          ...clampedPos,
          width: Math.round(nextWidth),
          height: Math.round(nextHeight),
        };
      };

      const onUp = () => {
        handle.classList.remove("active");
        card.classList.remove("resizing");
        handle.releasePointerCapture(e.pointerId);
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("pointercancel", onUp);
        const latest = dashSettings.widgetPositions[card.id] || {};
        persistCardMetrics(card, {
          left: Math.round(latest.left || parseFloat(card.style.left) || 0),
          top: Math.round(latest.top || parseFloat(card.style.top) || 0),
          width: Math.round(latest.width || card.offsetWidth),
          height: Math.round(latest.height || card.offsetHeight),
        });
        applyWidgetLayoutMode();
      };

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    });

    updateAriaValues(
      card.offsetWidth || WIDGET_DEFAULT_WIDTH,
      card.offsetHeight || WIDGET_DEFAULT_HEIGHT,
    );
  });
}

function updateDragHandleAccessibility() {
  document.querySelectorAll(".drag-handle").forEach((handle) => {
    handle.setAttribute("role", "button");
    handle.setAttribute("tabindex", "0");
    if (!handle.getAttribute("aria-label")) {
      const heading =
        handle
          .closest(".card")
          ?.querySelector(".card-header h2")
          ?.textContent?.trim() || "card";
      handle.setAttribute("aria-label", `Drag ${heading}`);
    }
  });
}

function updateButtonAccessibility() {
  document.querySelectorAll("button, .icon-btn, .action-btn").forEach((el) => {
    if (!el.getAttribute("aria-label")) {
      const text = el.textContent?.trim();
      const title = el.getAttribute("title");
      if (title) el.setAttribute("aria-label", title);
      else if (text) el.setAttribute("aria-label", text);
    }
  });
}

function runAccessibilityConsistencyPass() {
  updateDragHandleAccessibility();
  updateButtonAccessibility();
}

// ⚡ Bolt Performance: Extract expensive Intl.DateTimeFormat instantiation to module scope to avoid re-allocating inside hot render loops
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

// --- 1. CLOCK ---
let clockIntervalId = null;

function startClock() {
  let hijriFormatter = null;
  try {
    hijriFormatter = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {
    const hw = document.getElementById("hijri-wrapper");
    if (hw) hw.style.display = "none";
  }

  // ⚡ Bolt Performance: Cache DOM elements to prevent expensive getElementById lookups every second
  const clockEls = {
    greeting: document.getElementById("greeting"),
    icon: document.getElementById("clock-icon"),
    hr: document.getElementById("time-hr"),
    min: document.getElementById("time-min"),
    ampm: document.getElementById("time-ampm"),
    date: document.getElementById("date-main"),
    hijri: document.getElementById("hijri-main"),
    week: document.getElementById("week-display"),
    prog: document.getElementById("day-progress"),
  };

  // ⚡ Bolt Performance: Track changes to avoid redundant innerText/innerHTML updates
  let lastMinute = -1;
  let lastDay = -1;

  function updateTime() {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();

    // Progress bar updates every second
    if (clockEls.prog)
      clockEls.prog.style.width = `${((hour * 3600 + min * 60 + sec) / 86400) * 100}%`;

    // Only update time and greeting text if the minute has actually changed
    if (min !== lastMinute) {
      lastMinute = min;

      // Check Auto-Switch Scheduler
      if (dashSettings.workspaceSchedules && dashSettings.workspaceSchedules.length > 0) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const schedule = dashSettings.workspaceSchedules.find(s => s.time === timeStr);
        if (schedule && dashSettings.activeProfile !== schedule.workspaceId) {
           console.log(`[Workspace Engine] Auto-switching to workspace: ${schedule.workspaceId} at ${timeStr}`);
           applyWorkspace(schedule.workspaceId);
        }
      }

      let greeting = "Good Evening";
      let iconClass = "ph-moon-stars w-icon-moon";
      if (hour >= 5 && hour < 12) {
        greeting = "Good Morning";
        iconClass = "ph-sun-horizon w-icon-sun";
      } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon";
        iconClass = "ph-sun w-icon-sun";
      }

      if (clockEls.greeting)
        clockEls.greeting.innerText = dashSettings.name
          ? `${greeting}, ${dashSettings.name}`
          : greeting;
      if (clockEls.icon)
        clockEls.icon.className = `ph-fill ${iconClass} clock-greeting-icon`;

      let hrShow = hour;
      let ampm = "";
      if (!dashSettings.clock24) {
        hrShow = hour % 12;
        if (hrShow === 0) hrShow = 12;
        ampm = hour >= 12 ? "PM" : "AM";
      }

      if (clockEls.hr)
        clockEls.hr.innerText =
          hrShow < 10 && dashSettings.clock24 ? "0" + hrShow : hrShow;
      if (clockEls.min) clockEls.min.innerText = min < 10 ? "0" + min : min;
      if (clockEls.ampm) clockEls.ampm.innerText = ampm;

      const day = now.getDate();
      // Only update date strings if the day has changed
      if (day !== lastDay) {
        lastDay = day;
        if (clockEls.date)
          clockEls.date.innerHTML =
            `<i class="ph ph-calendar-blank" aria-hidden="true"></i> ` +
            now.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            });

        if (hijriFormatter && clockEls.hijri) {
          try {
            let hDate = hijriFormatter.format(now);
            if (!hDate.includes("AH")) hDate += " AH";
            clockEls.hijri.innerText = hDate;
          } catch (e) {}
        }

        const start = new Date(now.getFullYear(), 0, 0);
        const diff =
          now -
          start +
          (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        const weekOfYear = Math.ceil(dayOfYear / 7);
        if (clockEls.week)
          clockEls.week.innerText = `Week ${weekOfYear} | Day ${dayOfYear}`;
      }
    }
  }
  updateTime();
  if (clockIntervalId) clearInterval(clockIntervalId);
  clockIntervalId = setInterval(updateTime, 1000);
}

// --- INIT APP ---
function initDashboard() {
  migrateLegacyProfilesToWorkspaces();

  bindCoreUiEvents();
  initDesktopContextMenu();
  initTheme();
  initModuleWindowControls();
  applyLayoutVisibility();
  runAccessibilityConsistencyPass();

  // Safety check: ensure minified arrays are initialized
  if (!dashSettings.minimizedModules) dashSettings.minimizedModules = [];

  if (localStorage.getItem("holidayState") === "open") {
    document.getElementById("holiday-list").style.display = "block";
    document.getElementById("holiday-chevron").classList.add("open");
    const btn = document.querySelector(`[onclick*='holiday-list']`);
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  if (localStorage.getItem("tornStatsState") === "open") {
    const tsv = document.getElementById("torn-stats-view");
    const tsc = document.getElementById("torn-stats-chevron");
    if (tsv && tsc) {
      tsv.style.display = "grid";
      tsc.classList.add("open");
      const btn = document.querySelector(`[onclick*='torn-stats-view']`);
      if (btn) btn.setAttribute("aria-expanded", "true");
    }
  }

  initCustomRssTab();
  renderCustomRssSourceSelector();
  renderCustomRssSourcesList();
  applyNewsDensityMode();
  initNewsControls();
  triggerMasonryUpdate();
  startClock();
  fetchWeatherForCity();
  initTornTracker();
  renderTornDashboard();

  loadBDHolidays(new Date().getFullYear());
  fetchNews("top");
  renderTodos();
  initNotesEngine();
  initShortcutsEngine();
  const dashboardCards = document.querySelectorAll(".card");
  initDragAndDrop(dashboardCards);
  initWidgetDragging(dashboardCards);
  initResizableCards(dashboardCards);
  initBankApps();
  initCalculator();
  window.addEventListener("resize", applyWidgetLayoutMode);
  applyWidgetLayoutMode();
}

// --- CALCULATOR MODULE ---
let calcCurrent = "0";
let calcPrevious = "";
let calcOperation = undefined;
let calcHistory = []; // Stores strings: "a op b = result"
let calcLastOperand = null;
let calcLastOperation = null;
let calcResultShown = false;
let calcMasonryTicking = false;

function scheduleCalcMasonryUpdate() {
  if (calcMasonryTicking) return;
  calcMasonryTicking = true;
  requestAnimationFrame(() => {
    calcMasonryTicking = false;
    triggerMasonryUpdate();
  });
}

function formatCalcValue(rawValue) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return "Error";
  const absValue = Math.abs(value);
  if (absValue >= 1e12 || (absValue > 0 && absValue < 1e-6)) {
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 8 });
}

function sanitizeCalcString(value) {
  if (value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  const rounded = Math.round(number * 100000000) / 100000000;
  return rounded.toString();
}

function initCalculator() {
  updateCalcDisplay();
}

function updateCalcDisplay() {
  const historyContainer = document.getElementById("calc-history");
  const currTextElement = document.getElementById("calc-current");
  const currentExpressionElement = document.getElementById(
    "calc-current-expression",
  );

  if (historyContainer && currTextElement && currentExpressionElement) {
    // Render recent expression tape (latest 4 lines)
    const recentHistory = calcHistory.slice(-4);
    const historyHTML = recentHistory
      .map((item) => {
        if (typeof item === "string")
          return `<div class="calc-history-item">${escapeHtml(item)}</div>`;
        if (item && typeof item === "object" && item.equation) {
          const hasResult = item.result !== undefined && item.result !== null;
          return `<div class="calc-history-item">${escapeHtml(item.equation)}${hasResult ? ` = ${escapeHtml(formatCalcValue(item.result))}` : ""}</div>`;
        }
        return "";
      })
      .join("");
    historyContainer.innerHTML = historyHTML;

    // Render live expression line
    if (calcOperation != null && calcPrevious !== "") {
      const visualOp =
        calcOperation === "*"
          ? "×"
          : calcOperation === "/"
            ? "÷"
            : calcOperation;
      const rhs = calcCurrent === "" ? "" : ` ${formatCalcValue(calcCurrent)}`;
      currentExpressionElement.innerText = `${formatCalcValue(calcPrevious)} ${visualOp}${rhs}`;
    } else {
      currentExpressionElement.innerText = "";
    }

    // Render Current Input
    if (
      calcCurrent === "NaN" ||
      calcCurrent === "Infinity" ||
      calcCurrent === "-Infinity"
    ) {
      currTextElement.innerText = "Error";
      calcCurrent = "0";
    } else {
      currTextElement.innerText = formatCalcValue(calcCurrent);
    }

    // Must trigger masonry update because history tape height changes dynamically
    scheduleCalcMasonryUpdate();
  }
  updateCalcOperationButtons();
}

function updateCalcOperationButtons() {
  const opButtons = document.querySelectorAll(".calc-op-btn");
  opButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-op") === calcOperation;
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

window.calcAction = function (type, val) {
  if (type === "clear") {
    calcCurrent = "0";
    calcPrevious = "";
    calcOperation = undefined;
    calcHistory = [];
    calcLastOperand = null;
    calcLastOperation = null;
    calcResultShown = false;
  } else if (type === "clearEntry") {
    calcCurrent = "0";
  } else if (type === "delete") {
    calcResultShown = false;
    if (
      calcCurrent.length === 1 ||
      (calcCurrent.length === 2 && calcCurrent.startsWith("-"))
    ) {
      calcCurrent = "0";
    } else {
      calcCurrent = calcCurrent.toString().slice(0, -1);
    }
  } else if (type === "num") {
    if (calcResultShown && calcOperation == null) {
      calcCurrent = "0";
      calcResultShown = false;
    }
    if (val === "." && calcCurrent.includes(".")) return;
    if (calcCurrent === "0" && val !== ".") {
      calcCurrent = val.toString();
    } else {
      if (calcCurrent.length >= 16) return;
      calcCurrent = calcCurrent.toString() + val.toString();
    }
  } else if (type === "op") {
    if (calcCurrent === "") {
      if (calcPrevious !== "") {
        calcOperation = val;
      }
      return;
    } else {
      if (calcPrevious !== "") {
        calcCompute(false);
      }
      calcOperation = val;
      calcPrevious = calcCurrent;
      calcCurrent = "";
      calcResultShown = false;
    }
  } else if (type === "percent") {
    const current = parseFloat(calcCurrent);
    if (!isNaN(current)) {
      calcCurrent = sanitizeCalcString(current / 100);
    }
  } else if (type === "negate") {
    if (calcCurrent !== "0" && calcCurrent !== "") {
      calcCurrent = sanitizeCalcString(parseFloat(calcCurrent) * -1);
    }
  } else if (type === "equals") {
    if (calcOperation && calcPrevious !== "" && calcCurrent !== "") {
      calcLastOperand = calcCurrent;
      calcLastOperation = calcOperation;
      calcCompute(true);
      calcResultShown = true;
    } else if (calcLastOperation && calcLastOperand != null) {
      calcPrevious = calcCurrent;
      calcOperation = calcLastOperation;
      calcCurrent = calcLastOperand;
      calcCompute(true);
      calcResultShown = true;
    }
  }
  updateCalcDisplay();
};

window.clearCalcHistory = function () {
  calcHistory = [];
  updateCalcDisplay();
};

function calcCompute(isFinalEquals = false) {
  let computation;
  const prev = parseFloat(calcPrevious);
  const current = parseFloat(calcCurrent);

  if (isNaN(prev) || isNaN(current)) return;

  const visualOp =
    calcOperation === "*" ? "×" : calcOperation === "/" ? "÷" : calcOperation;
  const equationStr = `${formatCalcValue(prev)} ${visualOp} ${formatCalcValue(current)}`;

  switch (calcOperation) {
    case "+":
      computation = prev + current;
      break;
    case "-":
      computation = prev - current;
      break;
    case "*":
      computation = prev * current;
      break;
    case "/":
      if (current === 0) {
        computation = NaN;
      } else {
        computation = prev / current;
      }
      break;
    default:
      return;
  }

  if (!isNaN(computation) && isFinite(computation)) {
    computation = Math.round(computation * 100000000) / 100000000;
  }

  if (isFinalEquals && !isNaN(computation) && isFinite(computation)) {
    calcHistory.push(`${equationStr} = ${formatCalcValue(computation)}`);
    if (calcHistory.length > 10) {
      calcHistory.shift();
    }
  }

  calcCurrent = sanitizeCalcString(computation);
  calcOperation = undefined;
  calcPrevious = "";
}

// --- CUSTOM BANK APPS MODULE ---
let bankAppsArr = JSON.parse(localStorage.getItem("dashboardBankApps")) || [
  { name: "Calculators", icon: "ph-calculator", path: "calculator.html" },
  { name: "Form Gen", icon: "ph-file-text", path: "form_generator.html" },
  { name: "Prepaid Card", icon: "ph-credit-card", path: "prepaid_card.html" },
  { name: "RTGS Gen", icon: "ph-bank", path: "rtgs_generator.html" },
];

function initBankApps() {
  renderBankApps();
}
function saveBankApps() {
  localStorage.setItem("dashboardBankApps", JSON.stringify(bankAppsArr));
}

function toggleBankAppInputs() {
  const container = document.getElementById("bank-app-inputs-container");
  if (container.style.display === "none") {
    container.style.display = "flex";
    document.getElementById("ba-name").focus({ preventScroll: true });
  } else {
    container.style.display = "none";
  }
  triggerMasonryUpdate();
}

function renderBankApps() {
  const grid = document.getElementById("bank-apps-grid");
  if (!grid) return;
  grid.innerHTML = "";

  if (bankAppsArr.length === 0) {
    grid.innerHTML =
      '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px; grid-column: span 2; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-briefcase" aria-hidden="true"></i> No tools added. Click the + button above to add a local web app or tool.</div>';
    triggerMasonryUpdate();
    return;
  }

  let html = bankAppsArr.map((app, i) => `
            <div class="bank-app-wrapper" draggable="true" ondragstart="handleSubDragStart(event, 'bank')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'bank', bankAppsArr, saveBankApps, renderBankApps)" ondragend="handleSubDragEnd(event)">
                <a href="${safeUrl(app.path)}" target="_blank" rel="noopener noreferrer" class="app-tile">
                    <i class="ph-fill ${escapeHtml(app.icon)}" aria-hidden="true"></i>
                    <span>${escapeHtml(app.name)}</span>
                </a>
                <button type="button" class="edit-btn bank-edit-btn" aria-label="Edit Tool Name: ${escapeHtml(app.name)}" onclick="editBankApp(${i}, event)" title="Edit Tool Name"><i class="ph ph-pencil-simple" aria-hidden="true"></i></button>
                <button type="button" class="delete-btn bank-del-btn" aria-label="Remove Tool: ${escapeHtml(app.name)}" onclick="deleteBankApp(${i}, event)" title="Remove Tool">&times;</button>
            </div>`
  ).join("");
  grid.innerHTML = html;
  triggerMasonryUpdate();
}

function addBankApp() {
  const n = document.getElementById("ba-name"),
    ic = document.getElementById("ba-icon"),
    p = document.getElementById("ba-path");
  if (n.value.trim() && p.value.trim()) {
    let iconClass = ic.value.trim() || "ph-app-window";
    bankAppsArr.push({
      name: n.value.trim(),
      icon: iconClass,
      path: p.value.trim(),
    });
    saveBankApps();
    renderBankApps();
    n.value = "";
    ic.value = "";
    p.value = "";
    toggleBankAppInputs();
  }
}
function handleBankAppKeyPress(e) {
  if (e.key === "Enter") addBankApp();
}
function deleteBankApp(i, event) {
  event.preventDefault();
  event.stopPropagation();
  if (confirm("Remove this tool from the dashboard?")) {
    bankAppsArr.splice(i, 1);
    saveBankApps();
    renderBankApps();
  }
}
function editBankApp(i, event) {
  event.preventDefault();
  event.stopPropagation();
  const newName = prompt("Edit tool name:", bankAppsArr[i].name);
  if (newName !== null && newName.trim() !== "") {
    bankAppsArr[i].name = newName.trim();
    saveBankApps();
    renderBankApps();
  }
}

// --- 3. TORN CITY TRACKER MODULE ---
var tornConfig = safeParseJson(
  localStorage.getItem("dashboardTornTracker"),
  { key: "" },
  "dashboardTornTracker",
);
if (!tornConfig || typeof tornConfig !== 'object') tornConfig = { key: '' };
let tornInterval;
let tornTimers = {};
let tornTickInterval;
let tornLastSyncMs = 0;
let tornStatsTab = localStorage.getItem("tornStatsTab") || "overview";
let tornPrevSnapshot = safeParseJson(
  localStorage.getItem("tornPrevSnapshot"),
  null,
  "tornPrevSnapshot",
);
const tornDomCache = {};

function getTornEl(id) {
  if (!id) return null;
  if (!tornDomCache[id]) {
    tornDomCache[id] = document.getElementById(id);
  }
  return tornDomCache[id];
}

function initTornTracker() {
  setTornStatsTab(tornStatsTab, true);
  if (tornConfig.key) {
    fetchTornData();
    if (tornInterval) clearInterval(tornInterval);
    tornInterval = setInterval(fetchTornData, 300000);

    if (tornTickInterval) clearInterval(tornTickInterval);
    tornTickInterval = setInterval(updateTornTimersUI, 1000);
    setTornSyncState("loading", "Syncing...");
  } else {
    resetTornUI();
  }
}

function setTornSyncState(state, text) {
  const pill = getTornEl("torn-sync-state");
  if (!pill) return;
  pill.classList.remove("loading", "success", "error");
  if (state) pill.classList.add(state);
  pill.innerText = text || "Idle";
}

function updateTornSyncTimestamp(ms) {
  tornLastSyncMs = ms || 0;
  const syncEl = getTornEl("torn-last-sync");
  if (!syncEl) return;
  if (!tornLastSyncMs) {
    syncEl.innerText = "Never synced";
    return;
  }
  const secondsAgo = Math.floor((Date.now() - tornLastSyncMs) / 1000);
  syncEl.innerText = `Updated ${secondsAgo < 1 ? "just now" : `${secondsAgo}s ago`}`;
}

function setTornStatusChip(state, text) {
  const statusEl = getTornEl("torn-profile-status");
  if (!statusEl) return;
  statusEl.classList.remove(
    "state-good",
    "state-warning",
    "state-travel",
    "state-danger",
    "state-neutral",
  );
  statusEl.classList.add(state || "state-neutral");
  statusEl.innerText = text || "--";
}

function toggleTornKeyVisibility() {
  const keyInput = document.getElementById("torn-cfg-key");
  if (!keyInput) return;
  keyInput.type = keyInput.type === "password" ? "text" : "password";
}

function toggleTornConfig() {
  const configView = document.getElementById("torn-config-view");
  const displayView = document.getElementById("torn-display-view");

  if (configView.style.display === "none") {
    document.getElementById("torn-cfg-key").value = tornConfig.key;
    configView.style.display = "flex";
    displayView.style.display = "none";
  } else {
    configView.style.display = "none";
    displayView.style.display = "flex";
  }
  triggerMasonryUpdate();
}

function saveTornConfig() {
  if (!tornConfig || typeof tornConfig !== 'object') tornConfig = { key: '' };
  tornConfig.key = document.getElementById("torn-cfg-key").value.trim();
  const fb = document.getElementById("torn-key-feedback");
  if (fb) {
    fb.innerText =
      tornConfig.key.length < 8
        ? "API key looks too short. Please verify before saving."
        : "API key saved locally on this browser.";
  }
  localStorage.setItem("dashboardTornTracker", JSON.stringify(tornConfig));
  toggleTornConfig();
  initTornTracker();
  renderTornDashboard();
}

function resetTornUI() {
  ["en", "ne", "ha", "li"].forEach((prefix) => {
    const valEl = document.getElementById(`torn-${prefix}-val`);
    const barEl = document.getElementById(`torn-${prefix}-bar`);
    const fullEl = document.getElementById(`torn-${prefix}-full`);
    if (valEl) valEl.innerText = "-- / --";
    if (barEl) barEl.style.width = "0%";
    if (fullEl) fullEl.innerText = "";
  });
  const pName = document.getElementById("torn-profile-name");
  const pStatus = document.getElementById("torn-profile-status");
  const tCash = document.getElementById("torn-cash");
  if (pName) pName.innerText = "Not Configured";
  if (pStatus) setTornStatusChip("state-neutral", "--");
  if (tCash) tCash.innerText = "$0";
  ["med", "drug", "boo"].forEach((prefix) => {
    const cdEl = document.getElementById(`torn-cd-${prefix}`);
    if (cdEl) cdEl.innerText = "Ready";
  });
  updateTornSyncTimestamp(0);
  setTornSyncState("", "Idle");
  triggerMasonryUpdate();
}

async function fetchTornData() {
  if (!tornConfig.key) return;
  setTornSyncState("loading", "Syncing...");

  try {
    const response = await fetch(
      `https://api.torn.com/user/?selections=bars,profile,cooldowns,travel,money,battlestats,workstats,jobpoints&key=${tornConfig.key}`,
    );
    if (!response.ok) throw new Error("Fetch failed");
    const data = await response.json();

    if (data.error) {
      console.error("Torn API Error:", data.error.error);
      const pn = document.getElementById("torn-profile-name");
      if (pn) pn.innerText = "Invalid API Key";
      setTornStatusChip("state-danger", "API Key Error");
      setTornSyncState("error", "Sync Failed");
      return;
    }

    // Profile & Status
    const pn = document.getElementById("torn-profile-name");
    if (pn) pn.innerText = `${data.name} [${data.level}]`;
    let cleanStatus = data.status.description.replace(/<[^>]*>?/gm, "");
    if (
      cleanStatus.toLowerCase().includes("hospital") ||
      cleanStatus.toLowerCase().includes("jail")
    ) {
      setTornStatusChip("state-danger", cleanStatus);
    } else if (cleanStatus.toLowerCase().includes("travel")) {
      setTornStatusChip("state-travel", cleanStatus);
    } else {
      setTornStatusChip("state-good", cleanStatus);
    }

    // Money
    const tcash = document.getElementById("torn-cash");
    if (tcash)
      tcash.innerText = "$" + data.money_onhand.toLocaleString("en-US");

    // Bars
    updateTornBar("en", data.energy);
    updateTornBar("ne", data.nerve);
    updateTornBar("ha", data.happy);
    updateTornBar("li", data.life);

    // Save Timers for Local Ticking
    const now = Date.now();

    let travelUntil = 0;
    if (data.travel && data.travel.time_left > 0) {
      travelUntil = now + data.travel.time_left * 1000;
    } else if (data.status && data.status.until > 0) {
      travelUntil = data.status.until * 1000;
    }

    tornTimers = {
      enFull: now + data.energy.fulltime * 1000,
      enTick: data.energy.ticktime ? now + data.energy.ticktime * 1000 : 0,
      neFull: now + data.nerve.fulltime * 1000,
      neTick: data.nerve.ticktime ? now + data.nerve.ticktime * 1000 : 0,
      haFull: now + data.happy.fulltime * 1000,
      haTick: data.happy.ticktime ? now + data.happy.ticktime * 1000 : 0,
      liFull: now + data.life.fulltime * 1000,
      liTick: data.life.ticktime ? now + data.life.ticktime * 1000 : 0,
      medCd: now + data.cooldowns.medical * 1000,
      drugCd: now + data.cooldowns.drug * 1000,
      booCd: now + data.cooldowns.booster * 1000,
      travel: travelUntil,
    };

    // Render Dynamic Stats + Deltas
    const deltas = tornPrevSnapshot
      ? {
          energyDelta:
            (data.energy?.current ?? 0) -
            (tornPrevSnapshot.energy?.current ?? 0),
          nerveDelta:
            (data.nerve?.current ?? 0) - (tornPrevSnapshot.nerve?.current ?? 0),
          cashDelta:
            (data.money_onhand ?? 0) - (tornPrevSnapshot.money_onhand ?? 0),
        }
      : null;
    data.__deltas = deltas;
    tornPrevSnapshot = data;
    localStorage.setItem("tornPrevSnapshot", JSON.stringify(data));
    renderTornStats(data, deltas);

    updateTornTimersUI();
    updateTornSyncTimestamp(now);
    setTornSyncState("success", "Synced");
    triggerMasonryUpdate();
  } catch (e) {
    console.error("Failed to fetch Torn data", e);
    setTornSyncState("error", "Sync Failed");
    setTornStatusChip("state-danger", "Connection error");
  }
}

// Helper for creating micro-card rows
function createTornRow(labelStr, valStr) {
  const row = document.createElement("div");
  row.className = "torn-mc-row";

  const label = document.createElement("span");
  label.className = "torn-mc-label";
  label.textContent = labelStr;

  const dots = document.createElement("div");
  dots.className = "torn-mc-dots";

  const val = document.createElement("span");
  val.className = "torn-mc-val";
  val.textContent = valStr;

  row.appendChild(label);
  row.appendChild(dots);
  row.appendChild(val);
  return row;
}

function createTornPillsContainer(data, formatNum) {
  let hasPoints = data.points !== undefined;
  let hasJp =
    data.jobpoints && (data.jobpoints.jobs || data.jobpoints.companies);

  if (!hasPoints && !hasJp) return null;

  const pillsContainer = document.createElement("div");
  pillsContainer.className = "torn-stats-pills";

  if (hasPoints) {
    const pill = document.createElement("div");
    pill.className = "torn-stat-pill";
    pill.innerHTML = `Points: <span>${formatNum(data.points)}</span>`;
    pillsContainer.appendChild(pill);
  }
  if (hasJp) {
    let totalJp = 0;
    if (data.jobpoints.jobs)
      Object.values(data.jobpoints.jobs).forEach((v) => (totalJp += v));
    if (data.jobpoints.companies)
      Object.values(data.jobpoints.companies).forEach((v) => (totalJp += v));

    const pill = document.createElement("div");
    pill.className = "torn-stat-pill";
    pill.innerHTML = `Job Points: <span>${formatNum(totalJp)}</span>`;
    pillsContainer.appendChild(pill);
  }
  return pillsContainer;
}

function createTornWorkCard(data, formatNum) {
  let hasWork =
    data.manual_labor !== undefined ||
    data.intelligence !== undefined ||
    data.endurance !== undefined;
  if (!hasWork) return null;

  const workCard = document.createElement("div");
  workCard.className = "torn-micro-card";

  const header = document.createElement("div");
  header.className = "torn-mc-header";
  header.innerHTML =
    '<i class="ph-fill ph-wrench" aria-hidden="true"></i> Working Stats';
  workCard.appendChild(header);

  if (data.manual_labor !== undefined)
    workCard.appendChild(
      createTornRow("Manual Labor", formatNum(data.manual_labor)),
    );
  if (data.intelligence !== undefined)
    workCard.appendChild(
      createTornRow("Intelligence", formatNum(data.intelligence)),
    );
  if (data.endurance !== undefined)
    workCard.appendChild(createTornRow("Endurance", formatNum(data.endurance)));

  return workCard;
}

function createTornBattleCard(data, formatNum) {
  let str =
    data.strength ||
    (data.strength_info ? data.strength_info.effective : undefined);
  let def =
    data.defense ||
    (data.defense_info ? data.defense_info.effective : undefined);
  let spd =
    data.speed || (data.speed_info ? data.speed_info.effective : undefined);
  let dex =
    data.dexterity ||
    (data.dexterity_info ? data.dexterity_info.effective : undefined);

  let hasBattle =
    str !== undefined ||
    def !== undefined ||
    spd !== undefined ||
    dex !== undefined ||
    data.total_stats !== undefined;
  if (!hasBattle) return null;

  const battleCard = document.createElement("div");
  battleCard.className = "torn-micro-card";

  const header = document.createElement("div");
  header.className = "torn-mc-header";
  header.innerHTML =
    '<i class="ph-fill ph-sword" aria-hidden="true"></i> Battle Stats';
  battleCard.appendChild(header);

  if (str !== undefined)
    battleCard.appendChild(createTornRow("Strength", formatNum(str)));
  if (def !== undefined)
    battleCard.appendChild(createTornRow("Defense", formatNum(def)));
  if (spd !== undefined)
    battleCard.appendChild(createTornRow("Speed", formatNum(spd)));
  if (dex !== undefined)
    battleCard.appendChild(createTornRow("Dexterity", formatNum(dex)));

  let totalStat = data.total_stats;
  if (
    totalStat === undefined &&
    str !== undefined &&
    def !== undefined &&
    spd !== undefined &&
    dex !== undefined
  ) {
    totalStat = str + def + spd + dex;
  }

  if (totalStat !== undefined) {
    const totalRow = document.createElement("div");
    totalRow.className = "torn-mc-total";

    const tLabel = document.createElement("span");
    tLabel.className = "torn-mc-total-label";
    tLabel.textContent = "Total";

    const tVal = document.createElement("span");
    tVal.className = "torn-mc-total-val";
    tVal.textContent = formatNum(totalStat);

    totalRow.appendChild(tLabel);
    totalRow.appendChild(tVal);
    battleCard.appendChild(totalRow);
  }

  return battleCard;
}

function setTornStatsTab(tabName, skipRender = false) {
  tornStatsTab = tabName || "overview";
  localStorage.setItem("tornStatsTab", tornStatsTab);
  document.querySelectorAll(".torn-stats-tab").forEach((btn) => {
    const isActive = btn.id === `torn-tab-${tornStatsTab}`;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  if (!skipRender && tornPrevSnapshot) {
    renderTornStats(tornPrevSnapshot, tornPrevSnapshot.__deltas || null);
  }
}

function renderTornStats(data, deltas = null) {
  const statsView = document.getElementById("torn-stats-view");
  if (!statsView) return;
  const oldContent = statsView.querySelector(".torn-stats-content");
  if (oldContent) oldContent.remove();

  const content = document.createElement("div");
  content.className = "torn-stats-content";

  const frag = document.createDocumentFragment();
  const formatNum = (num) =>
    typeof num === "number" ? num.toLocaleString("en-US") : num || "--";

  // --- GENERAL & ASSETS (PILLS) ---
  const pillsContainer = createTornPillsContainer(data, formatNum);
  if (pillsContainer && tornStatsTab !== "compact") {
    frag.appendChild(pillsContainer);
  }

  // --- GRID LAYOUT ---
  const gridContainer = document.createElement("div");
  gridContainer.className = "torn-stats-grid";

  // Column 1: Working Stats
  const workCard = createTornWorkCard(data, formatNum);
  if (workCard && tornStatsTab !== "battle" && tornStatsTab !== "compact") {
    const col1 = document.createElement("div");
    col1.className = "torn-stats-col";
    col1.appendChild(workCard);
    gridContainer.appendChild(col1);
  }

  // Column 2: Battle Stats
  const battleCard = createTornBattleCard(data, formatNum);
  if (battleCard && tornStatsTab !== "work" && tornStatsTab !== "compact") {
    const col2 = document.createElement("div");
    col2.className = "torn-stats-col";
    col2.appendChild(battleCard);
    gridContainer.appendChild(col2);
  }

  if ((workCard || battleCard) && tornStatsTab !== "compact") {
    frag.appendChild(gridContainer);
  }

  if (tornStatsTab === "compact") {
    const compact = document.createElement("div");
    compact.className = "torn-delta";
    const lines = [];
    if (deltas && typeof deltas.energyDelta === "number")
      lines.push(
        `Energy ${deltas.energyDelta >= 0 ? "+" : ""}${deltas.energyDelta}`,
      );
    if (deltas && typeof deltas.nerveDelta === "number")
      lines.push(
        `Nerve ${deltas.nerveDelta >= 0 ? "+" : ""}${deltas.nerveDelta}`,
      );
    if (deltas && typeof deltas.cashDelta === "number")
      lines.push(
        `Cash ${deltas.cashDelta >= 0 ? "+" : ""}${deltas.cashDelta.toLocaleString("en-US")}`,
      );
    compact.innerText = lines.length
      ? `Changes since last sync: ${lines.join(" • ")}`
      : "Compact mode active. Expand tabs for full detail.";
    frag.appendChild(compact);
  }

  if (frag.childNodes.length === 0) {
    const noStats = document.createElement("div");
    noStats.style.textAlign = "center";
    noStats.style.color = "var(--text-muted)";
    noStats.style.fontSize = "0.85rem";
    noStats.textContent = "No advanced stats mapped.";
    frag.appendChild(noStats);
  }

  content.appendChild(frag);
  statsView.appendChild(content);
}

function updateTornBar(prefix, barData) {
  if (!barData) return;
  const cur = barData.current;
  const max = barData.maximum;
  const pct = Math.min(100, Math.max(0, (cur / max) * 100));

  const ve = getTornEl(`torn-${prefix}-val`);
  const be = getTornEl(`torn-${prefix}-bar`);
  if (ve) ve.innerText = `${cur} / ${max}`;
  if (be) {
    be.style.width = `${pct}%`;
    const isCritical =
      prefix === "en" || prefix === "ne" ? pct >= 90 : pct <= 25;
    be.classList.toggle("critical", isCritical);
  }
}

function updateTornTimersUI() {
  if (!tornTimers.enFull) return;

  const now = Date.now();

  const formatSeconds = (s) => {
    if (s <= 0) return "";
    let h = Math.floor(s / 3600);
    let m = Math.floor((s % 3600) / 60);
    let sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  const fmtFull = (tickTarget, fullTarget) => {
    let tickStr = "";
    if (tickTarget && tickTarget > now) {
      tickStr = formatSeconds(Math.floor((tickTarget - now) / 1000));
    }

    let fullStr = "";
    if (fullTarget && fullTarget > now) {
      fullStr = formatSeconds(Math.floor((fullTarget - now) / 1000));
    }

    if (tickStr && fullStr) return `(Next in ${tickStr} | Full in ${fullStr})`;
    if (fullStr) return `(Full in ${fullStr})`;
    return "";
  };

  const fmtCd = (target, elId) => {
    let s = Math.floor((target - now) / 1000);
    const el = getTornEl(elId);
    if (!el) return;
    let cdCard = tornDomCache[`${elId}-card`];
    if (!cdCard) {
      cdCard = el.closest(".torn-cd");
      tornDomCache[`${elId}-card`] = cdCard;
    }
    if (cdCard) cdCard.classList.remove("soon", "ready");
    if (s <= 0) {
      el.innerText = "Ready";
      el.style.color = "var(--text-main)";
      if (cdCard) cdCard.classList.add("ready");
      return;
    }
    let h = Math.floor(s / 3600)
      .toString()
      .padStart(2, "0");
    let m = Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0");
    let sec = (s % 60).toString().padStart(2, "0");
    el.innerText = `(In ${h}:${m}:${sec})`;
    el.style.color = s < 600 ? "var(--warning)" : "var(--danger)";
    if (cdCard && s < 600) cdCard.classList.add("soon");
  };

  const en = getTornEl("torn-en-full");
  if (en) en.innerText = fmtFull(tornTimers.enTick, tornTimers.enFull);
  const ne = getTornEl("torn-ne-full");
  if (ne) ne.innerText = fmtFull(tornTimers.neTick, tornTimers.neFull);
  const ha = getTornEl("torn-ha-full");
  if (ha) ha.innerText = fmtFull(tornTimers.haTick, tornTimers.haFull);
  const li = getTornEl("torn-li-full");
  if (li) li.innerText = fmtFull(tornTimers.liTick, tornTimers.liFull);
  updateTornSyncTimestamp(tornLastSyncMs);

  fmtCd(tornTimers.medCd, "torn-cd-med");
  fmtCd(tornTimers.drugCd, "torn-cd-drug");
  fmtCd(tornTimers.booCd, "torn-cd-boo");

  const ps = getTornEl("torn-profile-status");
  if (ps && tornTimers.travel > now) {
    ps.classList.remove("state-good", "state-warning",
    "state-danger", "state-travel", "state-neutral");
    ps.classList.add("state-travel");
    let s = Math.floor((tornTimers.travel - now) / 1000);
    let h = Math.floor(s / 3600)
      .toString()
      .padStart(2, "0");
    let m = Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0");
    let sec = (s % 60).toString().padStart(2, "0");

    let originalText = ps.getAttribute("data-original-status") || ps.innerText;
    if (!ps.hasAttribute("data-original-status")) {
      ps.setAttribute("data-original-status", originalText);
    }

    let destinationText = originalText;
    if (destinationText.includes("Traveling")) {
      destinationText = destinationText.replace(/\s*\[.*?\]\s*/, " ");
    }

    ps.innerText = `${destinationText.trim()} [${h}:${m}:${sec}]`;
  } else if (ps && ps.hasAttribute("data-original-status")) {
    ps.innerText = ps.getAttribute("data-original-status");
    ps.removeAttribute("data-original-status");
  }
}

// --- 2. MULTI-TAB TASKS ---
let storedTodos = JSON.parse(localStorage.getItem("dashboardTodos"));
let todos = { work: [], personal: [], coding: [] };
let activeTaskTab = "work";

if (Array.isArray(storedTodos)) {
  todos.work = storedTodos;
  saveTodos();
} else if (storedTodos && typeof storedTodos === "object") {
  todos = storedTodos;
}

function switchTaskTab(tabName) {
  activeTaskTab = tabName;
  document.querySelectorAll("#mod-tasks .news-tab").forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  const tt = document.getElementById("task-tab-" + tabName);
  if (tt) {
    tt.classList.add("active");
    tt.setAttribute("aria-selected", "true");
  }
  renderTodos();
}

function saveTodos() {
  localStorage.setItem("dashboardTodos", JSON.stringify(todos));
}

function renderTodos() {
  const currentList = todos[activeTaskTab] || [];
  const tc = document.getElementById("task-count");

  const completedTasks = currentList.filter((t) => t.completed);
  if (tc) tc.innerText = `(${currentList.length - completedTasks.length})`;

  const clearBtn = document.getElementById("btn-clear-done");
  if (clearBtn) {
    if (completedTasks.length > 0) {
      clearBtn.disabled = false;
      clearBtn.title = "Clear completed tasks";
    } else {
      clearBtn.disabled = true;
      clearBtn.title = "No completed tasks to clear";
    }
  }

  if (tc) tc.innerText = `(${currentList.filter((t) => !t.completed).length})`;

  const list = document.getElementById("todo-list");
  if (!list) return;
  list.innerHTML =
    currentList.length === 0
      ? '<li style="text-align:center; color:var(--text-muted); padding: 20px 0; font-style: italic; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-check-circle" aria-hidden="true"></i> No tasks here.</li>'
      : "";

  let html = list.innerHTML;
  currentList.forEach((t, i) => {
    html += `
        <li class="todo-item ${t.completed ? "completed" : ""}" draggable="true" ondragstart="handleSubDragStart(event, 'task')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'task', todos['${activeTaskTab}'], saveTodos, renderTodos)" ondragend="handleSubDragEnd(event)">
            <div class="sub-item-drag-handle" title="Drag to reorder"><i class="ph ph-dots-six-vertical" aria-hidden="true"></i></div>
            <input type="checkbox" aria-label="Toggle task completion: ${escapeHtml(t.text)}" ${t.completed ? "checked" : ""} onchange="toggleTodo(${i})">
            <span class="todo-text" onclick="toggleTodo(${i})" role="button" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleTodo(${i}); }">${escapeHtml(t.text)}</span>
            <button type="button" class="delete-btn" aria-label="Delete task: ${escapeHtml(t.text)}" onclick="deleteTodo(${i})" title="Delete task">&times;</button>
        </li>`;
  });
  list.innerHTML = html;
  triggerMasonryUpdate();
}

function addTodo() {
  const i = document.getElementById("todo-input");
  if (i && i.value.trim()) {
    todos[activeTaskTab].push({ text: i.value.trim(), completed: false });
    i.value = "";
    saveTodos();
    renderTodos();
    const list = document.getElementById("todo-list");
    if (list)
      setTimeout(
        () => list.scrollTo({ top: list.scrollHeight, behavior: "smooth" }),
        50,
      );
  }
}
function handleTodoKeyPress(e) {
  if (e.key === "Enter") addTodo();
}
function toggleTodo(i) {
  todos[activeTaskTab][i].completed = !todos[activeTaskTab][i].completed;
  saveTodos();
  renderTodos();
}
function deleteTodo(i) {
  todos[activeTaskTab].splice(i, 1);
  saveTodos();
  renderTodos();
}
function clearCompletedTodos() {
  todos[activeTaskTab] = todos[activeTaskTab].filter((t) => !t.completed);
  saveTodos();
  renderTodos();
}

// --- 4. WEATHER ---
async function fetchWeatherForCity() {
  const wc = document.getElementById("weather-container");
  if (wc) wc.setAttribute("aria-busy", "true");

  if (dashSettings.weatherCity) {
    try {
      const gRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(dashSettings.weatherCity)}&count=1&language=en&format=json`,
      );
      const gData = await gRes.json();
      if (gData.results && gData.results.length > 0)
        fetchWeather(
          gData.results[0].latitude,
          gData.results[0].longitude,
          gData.results[0].name,
        );
      else throw new Error("No geocoding result");
    } catch (e) {
      getLocationFromBrowser();
    }
  } else {
    getLocationFromBrowser();
  }
}

function getLocationFromBrowser() {
  if (!navigator.geolocation) {
    getLocationFromIP();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeather(lat, lon, "Current Location");
    },
    () => getLocationFromIP(),
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
  );
}

function getLocationFromIP() {
  fetch("https://ipapi.co/json/")
    .then((res) => res.json())
    .then((data) => {
      if (
        data.error ||
        typeof data.latitude !== "number" ||
        typeof data.longitude !== "number"
      )
        throw new Error();
      fetchWeather(
        data.latitude,
        data.longitude,
        `${data.city}, ${data.country_name}`,
      );
    })
    .catch(() => {
      fetch("https://ipinfo.io/json")
        .then((res) => res.json())
        .then((data) => {
          if (!data.loc || !data.loc.includes(",")) throw new Error();
          const [lat, lon] = data.loc.split(",");
          fetchWeather(lat, lon, `${data.city}, ${data.country}`);
        })
        .catch(() => {
          fetch("https://ipwho.is/")
            .then((res) => res.json())
            .then((data) => {
              if (
                !data.success ||
                typeof data.latitude !== "number" ||
                typeof data.longitude !== "number"
              )
                throw new Error();
              fetchWeather(
                data.latitude,
                data.longitude,
                `${data.city}, ${data.country}`,
              );
            })
            .catch(() => renderWeatherError());
        })
        .catch(() => renderWeatherError());
    })
    .catch(() => renderWeatherError());
}

function renderWeatherError() {
  const wc = document.getElementById("weather-container");
  if (!wc) return;
  wc.removeAttribute("aria-busy");
  wc.innerHTML = `
        <div style="text-align:center; padding: 15px 0;">
            <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:15px; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-warning" aria-hidden="true"></i> Location blocked or unavailable.</div>
            <div class="todo-input-group" style="margin: 0 auto;">
                <input type="text" id="manual-city-input" aria-label="Enter City" placeholder="Enter City (e.g. Dhaka)" onkeypress="if(event.key==='Enter') saveManualCity()">
                <button type="button" class="btn-add" onclick="saveManualCity()">Go</button>
            </div>
        </div>`;
  triggerMasonryUpdate();
}

function saveManualCity() {
  const city = document.getElementById("manual-city-input").value.trim();
  if (city) {
    dashSettings.weatherCity = city;
    localStorage.setItem("dashSettings", JSON.stringify(dashSettings));
    const wc = document.getElementById("weather-container");
    if (wc) {
      wc.setAttribute("aria-busy", "true");
      const hasExisting = wc.querySelector(".current-weather-main");
      if (hasExisting) {
        wc.style.opacity = "0.5";
        wc.style.pointerEvents = "none";
        wc.style.transition = "opacity 0.2s ease";
      } else {
        wc.innerHTML =
          '<div class="loading"><i class="ph ph-spinner" aria-hidden="true"></i>Fetching...</div>';
      }
    }
    fetchWeatherForCity();
  }
}

const MOON_PHASES = [
  { name: "New Moon", icon: "ph-moon" },
  { name: "Waxing Crescent", icon: "ph-moon" },
  { name: "First Quarter", icon: "ph-moon" },
  { name: "Waxing Gibbous", icon: "ph-moon" },
  { name: "Full Moon", icon: "ph-moon-stars" },
  { name: "Waning Gibbous", icon: "ph-moon" },
  { name: "Last Quarter", icon: "ph-moon" },
  { name: "Waning Crescent", icon: "ph-moon" },
];

function calculateMoonPhaseIndex(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 3) {
    year--;
    month += 12;
  }

  ++month;
  let c = 365.25 * year;
  let e = 30.6 * month;
  let jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  let b = parseInt(jd);
  jd -= b;
  b = Math.round(jd * 8);

  if (b >= 8) b = 0;
  return b;
}

function getLocalMoonPhase() {
  return MOON_PHASES[calculateMoonPhaseIndex(new Date())];
}

window.getWeatherDetails = function (code, isDay = 1) {
  // ⚡ Bolt Performance: Replace O(N) array .includes() with O(1) switch statement for faster weather code lookups in render loops
  switch (code) {
    case 0:
      return {
        desc: "Clear",
        icon: isDay ? "ph-sun w-icon-sun" : "ph-moon w-icon-moon",
        bgClass: isDay ? "weather-bg-clear-day" : "weather-bg-clear-night",
      };
    case 1:
    case 2:
      return {
        desc: "Cloudy",
        icon: isDay
          ? "ph-cloud-sun w-icon-cloud-sun"
          : "ph-cloud-moon w-icon-cloud-moon",
        bgClass: isDay ? "weather-bg-cloudy-day" : "weather-bg-cloudy-night",
      };
    case 3:
      return {
        desc: "Overcast",
        icon: "ph-cloud w-icon-cloud",
        bgClass: "weather-bg-overcast",
      };
    case 45:
    case 48:
      return {
        desc: "Fog",
        icon: "ph-cloud-fog w-icon-fog",
        bgClass: "weather-bg-fog",
      };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 80:
    case 81:
    case 82:
      return {
        desc: "Rain",
        icon: "ph-cloud-rain w-icon-rain",
        bgClass: "weather-bg-rain",
        animClass: "weather-anim-rain",
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        desc: "Snow",
        icon: "ph-cloud-snow w-icon-snow",
        bgClass: "weather-bg-snow",
        animClass: "weather-anim-snow",
      };
    case 95:
    case 96:
    case 99:
      return {
        desc: "Storm",
        icon: "ph-cloud-lightning w-icon-storm",
        bgClass: "weather-bg-storm",
        animClass: "weather-anim-storm",
      };
    default:
      return {
        desc: "Unknown",
        icon: "ph-sun w-icon-sun",
        bgClass: "weather-bg-clear-day",
      };
  }
};
function getWindDir(d) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(d / 45) % 8];
}

function getAqiInfo(aqi) {
  if (aqi <= 50) return { l: "Good", c: "#34c759" };
  if (aqi <= 100) return { l: "Moderate", c: "#ff9500" };
  if (aqi <= 150) return { l: "Unhealthy", c: "#ff3b30" };
  return { l: "Hazardous", c: "#af52de" };
}

function generateSunCycleHTML(day) {
  // ⚡ Bolt Performance: Cache the local moon phase object to prevent redundant `new Date()` allocations and floating-point recalculations during weather UI rendering.
  const moonPhase = getLocalMoonPhase();
  return `
            <div class="sun-cycle" style="width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; padding: 15px 10px 25px 10px; background: var(--inner-bg); border-radius: 16px; margin-bottom: 15px;">
                <div style="width: 100%; max-width: 200px; position: relative; height: 50px; margin-bottom: 10px;">
                    <svg viewBox="0 0 100 55" style="width: 100%; height: 100%; overflow: visible; display: block;">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--glass-border)" stroke-width="2" stroke-dasharray="4 4" />
                        <circle cx="10" cy="50" r="2" fill="var(--text-muted)" />
                        <circle cx="90" cy="50" r="2" fill="var(--text-muted)" />
                        ${(() => {
                          const now = new Date();
                          const sunrise = new Date(day.sunrise[0]);
                          const sunset = new Date(day.sunset[0]);
                          let progress = 0;
                          if (now < sunrise) progress = 0;
                          else if (now > sunset) progress = 1;
                          else progress = (now - sunrise) / (sunset - sunrise);

                          const angle = Math.PI - progress * Math.PI;
                          const x = 50 + 40 * Math.cos(angle);
                          const y = 50 - 40 * Math.sin(angle);

                          let isSunVisible = now >= sunrise && now <= sunset;

                          if (!isSunVisible) return ""; // Hide sun when it's down

                          return `<g transform="translate(${x}, ${y})">
                                        <circle cx="0" cy="0" r="4" fill="#fbbc04" style="filter: drop-shadow(0 0 4px #fbbc04);" />
                                    </g>`;
                        })()}
                    </svg>
                    <div style="position: absolute; bottom: -22px; left: -10px; font-size: 0.7rem; font-weight: 700; text-align: center; color: var(--text-main);">
                        <i class="ph-fill ph-sunrise" aria-hidden="true" style="color: #fbbc04; font-size: 1.1rem; display: block; margin-bottom: 2px;"></i>
                        ${new Date(day.sunrise[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                    <div style="position: absolute; bottom: -22px; right: -10px; font-size: 0.7rem; font-weight: 700; text-align: center; color: var(--text-main);">
                        <i class="ph-fill ph-sunset" aria-hidden="true" style="color: #ff9500; font-size: 1.1rem; display: block; margin-bottom: 2px;"></i>
                        ${new Date(day.sunset[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                </div>
                <div style="margin-top: 30px; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 5px;">
                    <i class="ph-fill ${escapeHtml(moonPhase.icon)}" aria-hidden="true" style="font-size: 1.1rem; color: #a1a1a6;"></i>
                    ${escapeHtml(moonPhase.name)}
                </div>
            </div>`;
}

function generateHourlyForecastHTML(hr) {
  // ⚡ Bolt Performance: Cache current time prefix once to avoid instantiating new Date() inside a findIndex loop
  const nowPrefix = new Date().toISOString().slice(0, 14) + "00";
  let hIdx = hr.time.findIndex((t) => t >= nowPrefix);
  if (hIdx === -1) hIdx = 0;

  let htmlSegments = [];
  htmlSegments.push(
    `<div style="width: 100%;"><div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin: 0 0 8px 0; color: var(--text-muted);">Hourly</div><div class="hourly-forecast">`,
  );

  for (let i = hIdx + 1; i <= hIdx + 6; i++) {
    if (!hr.time[i]) break;

    // ⚡ Bolt Performance: Extract hour from ISO string (YYYY-MM-DDTHH:MM) using fast charCodeAt arithmetic, bypassing string allocation and parseInt
    let hourNum =
      (hr.time[i].charCodeAt(11) - 48) * 10 + (hr.time[i].charCodeAt(12) - 48);
    let ampm = hourNum >= 12 ? "PM" : "AM";
    let hour12 = hourNum % 12 || 12;
    let timeDisplay = `${hour12} ${ampm}`;

    const hInfo = window.getWeatherDetails(hr.weather_code[i], 1);
    htmlSegments.push(
      `<div class="hourly-item"><span class="hourly-time">${timeDisplay}</span><span class="hourly-icon"><i class="ph-fill ${escapeHtml(hInfo.icon)}" aria-hidden="true"></i></span><span class="hourly-temp">${Math.round(hr.temperature_2m[i])}&deg;</span>${hr.precipitation_probability[i] > 0 ? `<div class="hourly-pop"><i class="ph-fill ph-drop" aria-hidden="true" style="color: var(--accent);"></i> ${hr.precipitation_probability[i]}%</div>` : ""}</div>`,
    );
  }

  htmlSegments.push(`</div></div>`);
  return htmlSegments.join("");
}

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function generateDailyForecastHTML(day) {
  let htmlSegments = [];
  htmlSegments.push(`<div class="forecast-container" style="width: 100%;">`);

  for (let i = 1; i <= 4; i++) {
    if (!day.time[i]) break;

    // ⚡ Bolt Performance: Fast manual parse for YYYY-MM-DD using charCodeAt to avoid array allocation from split() and string parsing overhead
    const timeStr = day.time[i];
    const year =
      (timeStr.charCodeAt(0) - 48) * 1000 +
      (timeStr.charCodeAt(1) - 48) * 100 +
      (timeStr.charCodeAt(2) - 48) * 10 +
      (timeStr.charCodeAt(3) - 48);
    const month =
      (timeStr.charCodeAt(5) - 48) * 10 + (timeStr.charCodeAt(6) - 48);
    const d = (timeStr.charCodeAt(8) - 48) * 10 + (timeStr.charCodeAt(9) - 48);
    const dateObj = new Date(year, month - 1, d);
    const dayName = SHORT_DAYS[dateObj.getDay()];

    const dInfo = window.getWeatherDetails(day.weather_code[i], 1);
    htmlSegments.push(
      `<div class="forecast-day"><span class="fc-name">${dayName}</span><span class="fc-icon"><i class="ph-fill ${escapeHtml(dInfo.icon)}" aria-hidden="true"></i></span><div class="fc-temps"><span class="fc-max">${Math.round(day.temperature_2m_max[i])}&deg;</span><span class="fc-min">${Math.round(day.temperature_2m_min[i])}&deg;</span></div>${day.precipitation_probability_max[i] > 0 ? `<div class="fc-pop"><i class="ph-fill ph-drop" aria-hidden="true" style="color: var(--accent);"></i> ${day.precipitation_probability_max[i]}%</div>` : ""}</div>`,
    );
  }

  htmlSegments.push(`</div>`);
  return htmlSegments.join("");
}

function renderWeatherUI(data, aqiData, detailsDisplay) {
  const cur = data.current,
    day = data.daily,
    hr = data.hourly;
  const wInfo = window.getWeatherDetails(cur.weather_code, cur.is_day);

  // --- Apply dynamic weather background ---
  const modWeather = document.getElementById("mod-weather");
  if (modWeather) {
    // Remove existing weather background classes
    modWeather.className = modWeather.className.replace(
      /\bweather-bg-\S+/g,
      "",
    );
    modWeather.classList.add(wInfo.bgClass);

    // Handle animated overlay
    let overlay = modWeather.querySelector(".weather-fx-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "weather-fx-overlay";
      modWeather.insertBefore(overlay, modWeather.firstChild);
    }
    overlay.className = "weather-fx-overlay"; // Reset overlay classes
    if (wInfo.animClass) {
      overlay.classList.add(wInfo.animClass);

      if (
        wInfo.animClass === "weather-anim-rain" ||
        wInfo.animClass === "weather-anim-storm"
      ) {
        const windSpeed = Number(cur.wind_speed_10m) || 0;
        const windDir = Number(cur.wind_direction_10m) || 0;
        const windRad = (windDir * Math.PI) / 180;
        const rainDrift = Math.round(
          Math.sin(windRad) * Math.min(22, Math.max(8, windSpeed)),
        );

        overlay.style.setProperty("--rain-drift", `${rainDrift}px`);
        overlay.style.setProperty(
          "--rain-duration",
          `${Math.max(0.4, 0.95 - windSpeed / 85).toFixed(2)}s`,
        );

        if (windSpeed >= 30) {
          overlay.classList.add("weather-rain-heavy");
        } else if (windSpeed >= 15) {
          overlay.classList.add("weather-rain-medium");
        }
      }
    }
  }

  const hasAqi = !!(
    aqiData &&
    aqiData.current &&
    typeof aqiData.current.us_aqi === "number"
  );
  const aqi = hasAqi ? aqiData.current.us_aqi : null;
  const aInfo = hasAqi ? getAqiInfo(aqi) : null;

  let htmlSegments = [];

  htmlSegments.push(`
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            ${hasAqi ? `<div class="aqi-badge" style="background-color: ${escapeHtml(aInfo.c)};">AQI: ${Math.round(aqi)} - ${escapeHtml(aInfo.l)}</div>` : ""}
            <div class="current-weather-main">
                <div class="weather-icon-large"><i class="ph-fill ${escapeHtml(wInfo.icon)}" aria-hidden="true"></i></div>
                <div class="weather-temp-box"><span class="weather-temp">${Math.round(cur.temperature_2m)}&deg;</span><span class="weather-desc">${escapeHtml(wInfo.desc)}</span></div>
            </div>
        </div>
        <div id="weather-details-view" style="display: ${detailsDisplay}; flex-direction: column; width: 100%;">
            <div class="weather-stats" style="width: 100%;">
                <div class="stat-item"><span class="stat-label">Feels</span><span class="stat-val">${Math.round(cur.apparent_temperature)}&deg;</span></div>
                <div class="stat-item"><span class="stat-label">Wind</span><span class="stat-val">${Math.round(cur.wind_speed_10m)}k/h ${getWindDir(cur.wind_direction_10m)}</span></div>
                <div class="stat-item"><span class="stat-label">UV Max</span><span class="stat-val">${Math.round(day.uv_index_max[0])}</span></div>
                <div class="stat-item"><span class="stat-label">Humidity</span><span class="stat-val">${escapeHtml(String(cur.relative_humidity_2m))}%</span></div>
                <div class="stat-item"><span class="stat-label">Vis.</span><span class="stat-val">${escapeHtml((cur.visibility / 1000).toFixed(1))}km</span></div>
                <div class="stat-item"><span class="stat-label">Press.</span><span class="stat-val">${Math.round(cur.surface_pressure)}hPa</span></div>
            </div>
    `);

  htmlSegments.push(generateSunCycleHTML(day));
  htmlSegments.push(generateHourlyForecastHTML(hr));
  htmlSegments.push(generateDailyForecastHTML(day));
  htmlSegments.push(`</div>`);

  const wc = document.getElementById("weather-container");
  if (wc) {
    wc.innerHTML = htmlSegments.join("");
    triggerMasonryUpdate();
  }
}

async function fetchWeather(lat, lon, locName) {
  const locDisp = document.getElementById("location-display");
  if (locDisp) locDisp.innerText = locName;
  const wState = localStorage.getItem("weatherCardState") || "closed";
  const detailsDisplay = wState === "open" ? "flex" : "none";
  if (document.getElementById("weather-card-chevron") && wState === "open") {
    document.getElementById("weather-card-chevron").classList.add("open");
    const btn = document.querySelector(`[onclick*='weather-details-view']`);
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  const wcOuter = document.getElementById("weather-container");
  if (wcOuter) wcOuter.setAttribute("aria-busy", "true");

  try {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`,
    );
    if (!weatherResponse.ok)
      throw new Error(`Weather request failed (${weatherResponse.status})`);
    const data = await weatherResponse.json();
    if (!data || !data.current || !data.hourly || !data.daily)
      throw new Error("Weather response missing required fields");

    let aqiData = null;
    try {
      const aqiResponse = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi&timezone=auto`,
      );
      if (aqiResponse.ok) {
        aqiData = await aqiResponse.json();
      }
    } catch (_) {
      // AQI is optional; keep weather rendering even if AQI endpoint fails.
    }

    renderWeatherUI(data, aqiData, detailsDisplay);

    const wc = document.getElementById("weather-container");
    if (wc) {
      wc.style.opacity = "";
      wc.style.pointerEvents = "";
      wc.removeAttribute("aria-busy");
    }
  } catch (e) {
    renderWeatherError();
  }
}

// --- 5. CALENDAR (Accurate Bangladesh Holidays) ---
let displayedYear = new Date().getFullYear(),
  displayedMonth = new Date().getMonth();
function jumpToToday() {
  displayedYear = new Date().getFullYear();
  displayedMonth = new Date().getMonth();
  renderCalendar();
}
function jumpRelativeMonths(offsetMonths) {
  const d = new Date();
  d.setDate(1); // Set to 1st to avoid overflow issues (e.g. Aug 31 -> Nov 30 rollover)
  d.setMonth(d.getMonth() + offsetMonths);
  const newY = d.getFullYear();
  const newM = d.getMonth();
  if (newY !== displayedYear) {
    displayedYear = newY;
    displayedMonth = newM;
    loadBDHolidays(displayedYear);
  } else {
    displayedMonth = newM;
    renderCalendar();
  }
}

function changeMonth(offset) {
  displayedMonth += offset;
  if (displayedMonth < 0) {
    displayedMonth = 11;
    displayedYear--;
    loadBDHolidays(displayedYear);
  } else if (displayedMonth > 11) {
    displayedMonth = 0;
    displayedYear++;
    loadBDHolidays(displayedYear);
  } else renderCalendar();
}
function jumpToMonth(value) {
  if (!value) return;
  const [y, m] = value.split("-");
  const ny = parseInt(y),
    nm = parseInt(m) - 1;
  if (ny !== displayedYear) {
    displayedYear = ny;
    displayedMonth = nm;
    loadBDHolidays(displayedYear);
  } else {
    displayedMonth = nm;
    renderCalendar();
  }
}
let holidaysData = [];

let holidaysMap = new Map();

function loadBDHolidays(year) {
  let bdHolidays = [
    { date: `${year}-02-21`, name: "Language Martyrs' Day" },
    { date: `${year}-03-26`, name: "Independence Day" },
    { date: `${year}-04-14`, name: "Bengali New Year" },
    { date: `${year}-05-01`, name: "May Day" },
    { date: `${year}-12-16`, name: "Victory Day" },
    { date: `${year}-12-25`, name: "Christmas Day" },
  ];

  if (year === 2026) {
    bdHolidays = [
      { date: "2026-02-04", name: "Shab e-Barat" },
      { date: "2026-02-11", name: "Election Day" },
      { date: "2026-02-12", name: "Election Day Holiday" },
      { date: "2026-02-21", name: "Language Martyrs' Day" },
      { date: "2026-03-17", name: "Shab-e-Qadr" },
      { date: "2026-03-19", name: "Eid ul-Fitr Holiday" },
      { date: "2026-03-20", name: "Jumatul Bidah / Eid Holiday" },
      { date: "2026-03-21", name: "Eid ul-Fitr" },
      { date: "2026-03-22", name: "Eid ul-Fitr Holiday" },
      { date: "2026-03-23", name: "Eid ul-Fitr Holiday" },
      { date: "2026-03-26", name: "Independence Day" },
      { date: "2026-04-13", name: "Chaitra Sankranti" },
      { date: "2026-04-14", name: "Bengali New Year" },
      { date: "2026-05-01", name: "May Day / Buddha Purnima" },
      { date: "2026-05-26", name: "Eid al-Adha Holiday" },
      { date: "2026-05-27", name: "Eid al-Adha Holiday" },
      { date: "2026-05-28", name: "Eid al-Adha" },
      { date: "2026-05-29", name: "Eid al-Adha Holiday" },
      { date: "2026-05-30", name: "Eid al-Adha Holiday" },
      { date: "2026-05-31", name: "Eid al-Adha Holiday" },
      { date: "2026-06-17", name: "Muharram" },
      { date: "2026-06-26", name: "Ashura" },
      { date: "2026-07-01", name: "Bank Holiday" },
      { date: "2026-08-05", name: "Student-People Uprising Day" },
      { date: "2026-08-26", name: "Eid e-Milad-un Nabi" },
      { date: "2026-09-04", name: "Janmashtami" },
      { date: "2026-10-20", name: "Mahanabami" },
      { date: "2026-10-21", name: "Durga Puja" },
      { date: "2026-12-16", name: "Victory Day" },
      { date: "2026-12-25", name: "Christmas Day" },
      { date: "2026-12-31", name: "Bank Holiday" },
    ];
  }

  holidaysData = bdHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Performance optimization: rebuild the holiday map only when data changes
  holidaysMap.clear();
  holidaysData.forEach((h) => holidaysMap.set(h.date, h));

  renderCalendar();
  renderHolidayList();
}

function renderCalendar() {
  const actualToday = new Date(),
    viewDate = new Date(displayedYear, displayedMonth, 1);

  const monthStr = String(displayedMonth + 1).padStart(2, "0");
  const mp = document.getElementById("calendar-month-picker");
  if (mp) mp.value = `${displayedYear}-${monthStr}`;
  let htmlParts = ['<div class="calendar-grid">'];
  ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((d) =>
    htmlParts.push(`<div class="calendar-header">${d}</div>`),
  );

  const startDay = viewDate.getDay();
  for (let i = 0; i < startDay; i++)
    htmlParts.push(`<div class="calendar-day calendar-empty"></div>`);

  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const datePrefix = `${displayedYear}-${monthStr}-`;
  const isCurrentMonthYear =
    actualToday.getMonth() === displayedMonth &&
    actualToday.getFullYear() === displayedYear;
  const todayDate = actualToday.getDate();

  let currentDayOfWeek = startDay;

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = datePrefix + (i < 10 ? "0" + i : i);

    // ⚡ Bolt Performance: Replace expensive Date allocation with primitive tracking
    let isWeekend = currentDayOfWeek === 5 || currentDayOfWeek === 6;

    let hObj = holidaysMap.get(dateStr);
    let isToday = isCurrentMonthYear && i === todayDate ? "calendar-today" : "";
    let holidayClass = hObj || isWeekend ? "calendar-holiday" : "";
    let titleAttr = hObj
      ? `title="${escapeHtml(hObj.name)}"`
      : isWeekend
        ? `title="Weekend"`
        : "";

    htmlParts.push(
      `<div class="calendar-day ${isToday} ${holidayClass}" ${titleAttr}>${i}</div>`,
    );

    currentDayOfWeek = (currentDayOfWeek + 1) % 7;
  }
  const mc = document.getElementById("mini-calendar");
  if (mc) {
    mc.innerHTML = htmlParts.join("") + "</div>";
    triggerMasonryUpdate();
  }
}

function renderHolidayList() {
  const list = document.getElementById("holiday-list");
  if (!list) return;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const up = holidaysData.filter((h) => new Date(h.date) >= now);
  if (up.length === 0) {
    list.innerHTML =
      '<li class="holiday-item" style="display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted); font-size: 0.85rem; font-style: italic;"><i class="ph ph-calendar-check" aria-hidden="true"></i> No more holidays mapped for this year.</li>';
    return;
  }
  let html = "";
  up.slice(0, 5).forEach((h) => {
    const diffDays = Math.ceil(Math.abs(new Date(h.date) - now) / 86400000);
    html += `<li class="holiday-item"><span class="holiday-name">${escapeHtml(h.name)}</span><div class="holiday-meta"><span class="holiday-countdown">${diffDays === 0 ? "Today" : `in ${diffDays}d`}</span><span class="holiday-date">${shortDateFormatter.format(new Date(h.date))}</span></div></li>`;
  });
  list.innerHTML = html;
}

// ⚡ Bolt Performance: Cache HTML entities mapping to avoid allocating a new object on every character match
const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};
function escapeHtml(u) {
  if (u === null || u === undefined) return "";
  return String(u).replace(/[&<"'>]/g, (m) => ESCAPE_MAP[m]);
}
function safeUrl(u, fallback = "#") {
  const str = String(u || "")
    .replace(/[\s\x00-\x1f\x7f-\x9f]/g, "")
    .trim();
  return /^javascript:/i.test(str)
    ? fallback
    : escapeHtml(String(u || "").trim());
}

// --- 6. QUICK LINKS ---
let shortcutsArr = JSON.parse(localStorage.getItem("dashboardBookmarks")) || [];
function toggleShortcutInputs() {
  const container = document.getElementById("shortcut-inputs-container");
  if (container.style.display === "none") {
    container.style.display = "flex";
    document.getElementById("sc-name").focus({ preventScroll: true });
  } else {
    container.style.display = "none";
  }
  triggerMasonryUpdate();
}
function initShortcutsEngine() {
  renderShortcuts();
}
function saveShortcuts() {
  localStorage.setItem("dashboardBookmarks", JSON.stringify(shortcutsArr));
}
function renderShortcuts() {
  const grid = document.getElementById("shortcuts-grid");
  if (!grid) return;

  if (shortcutsArr.length === 0) {
    grid.innerHTML =
      '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-link" aria-hidden="true"></i> No links added yet. Click the + button above to pin your favorite websites.</div>';
    triggerMasonryUpdate();
    return;
  }

  let html = "";
  shortcutsArr.forEach((sc, i) => {
    let domain = sc.path
      .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "")
      .split("/")[0];
    let favUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    let onErrorFallback = `this.outerHTML='<i class=&quot;ph-fill ph-globe shortcut-fallback-icon&quot; aria-hidden=&quot;true&quot;></i>'`;
    html += `
            <div class="shortcut-wrapper" draggable="true" ondragstart="handleSubDragStart(event, 'link')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'link', shortcutsArr, saveShortcuts, renderShortcuts)" ondragend="handleSubDragEnd(event)">
                <div class="sub-item-drag-handle" title="Drag to reorder"><i class="ph ph-dots-six-vertical" aria-hidden="true"></i></div>
                <button type="button" class="bank-edit-btn" aria-label="Edit Link Name: ${escapeHtml(sc.name)}" onclick="editShortcut(${i}, event)" title="Edit Link Name"><i class="ph ph-pencil-simple" aria-hidden="true"></i></button>
                <button type="button" class="bank-del-btn" aria-label="Remove Link: ${escapeHtml(sc.name)}" onclick="deleteShortcut(${i}, event)" title="Remove Link"><i class="ph ph-x" aria-hidden="true"></i></button>
                <a href="${safeUrl(sc.path)}" class="shortcut-item" target="_blank" rel="noopener noreferrer">
                    <div class="shortcut-icon-wrapper"><img src="${safeUrl(favUrl)}" alt="" onerror="${onErrorFallback}"></div>
                    <div class="shortcut-info"><span class="shortcut-name" title="${escapeHtml(sc.name)}">${escapeHtml(sc.name)}</span></div>
                </a>
            </div>`;
  });
  grid.innerHTML = html;
  triggerMasonryUpdate();
}
function addShortcut() {
  const n = document.getElementById("sc-name"),
    p = document.getElementById("sc-path");
  if (n.value.trim() && p.value.trim()) {
    let url = p.value.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    shortcutsArr.push({ name: n.value.trim(), path: url });
    saveShortcuts();
    renderShortcuts();
    n.value = "";
    p.value = "";
    toggleShortcutInputs();
  }
}
function handleShortcutKeyPress(e) {
  if (e.key === "Enter") addShortcut();
}
function deleteShortcut(i, event) {
  event.preventDefault();
  event.stopPropagation();
  if (confirm("Remove this link?")) {
    shortcutsArr.splice(i, 1);
    saveShortcuts();
    renderShortcuts();
  }
}
function editShortcut(i, event) {
  event.preventDefault();
  event.stopPropagation();
  const newName = prompt("Edit shortcut name:", shortcutsArr[i].name);
  if (newName !== null && newName.trim() !== "") {
    shortcutsArr[i].name = newName.trim();
    saveShortcuts();
    renderShortcuts();
  }
}

// --- 7. NORMAL NOTEPAD ---
let notesArr = [];
let currentNoteId = null;
let colorDotCache = null;
function initNotesEngine() {
  colorDotCache = document.querySelectorAll(".color-dot");
  let savedNotes = JSON.parse(localStorage.getItem("dashboardNotes"));
  if (!savedNotes) {
    notesArr = [
      {
        id: Date.now(),
        title: "Welcome",
        content: "Type your quick notes here.",
        lastEdited: Date.now(),
        color: "none",
        pinned: false,
      },
    ];
    saveNotesArr();
  } else {
    notesArr = savedNotes.map((n) => ({
      ...n,
      color: n.color || "none",
      pinned: n.pinned || false,
    }));
  }

  const titleInp = document.getElementById("note-title-input");
  const textarea = document.getElementById("notepad-input");
  if (titleInp) titleInp.addEventListener("input", autoSaveNote);
  if (textarea) {
    textarea.addEventListener("input", () => {
      updateWordCount();
      autoSaveNote();
    });
    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.selectionStart,
          end = this.selectionEnd;
        this.value =
          this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
        updateWordCount();
        autoSaveNote();
      }
    });
  }
  renderNotesList();
}
function saveNotesArr() {
  localStorage.setItem("dashboardNotes", JSON.stringify(notesArr));
}

function renderNotesList() {
  const list = document.getElementById("notes-list-inject");
  const searchEl = document.getElementById("note-search");
  if (!list || !searchEl) return;

  const searchQ = searchEl.value.toLowerCase();
  let filteredNotes = searchQ
    ? notesArr.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQ) ||
          n.content.toLowerCase().includes(searchQ),
      )
    : notesArr;
  if (filteredNotes.length === 0) {
    list.innerHTML = `<div class="loading">${searchQ ? '<i class="ph ph-magnifying-glass" aria-hidden="true"></i> No matches found.' : '<i class="ph ph-notepad" aria-hidden="true"></i> No notes yet. Click + to create.'}</div>`;
    triggerMasonryUpdate();
    return;
  }

  let html = "";
  // ⚡ Bolt Performance: Cache Date.now() before loop to avoid calling it on every iteration
  const now = Date.now();
  [...filteredNotes]
    .sort((a, b) => {
      if (a.pinned === b.pinned) return b.lastEdited - a.lastEdited;
      return a.pinned ? -1 : 1;
    })
    .forEach((note) => {
      const diffMins = Math.floor((now - note.lastEdited) / 60000);
      let dateStr =
        diffMins < 1
          ? "Just now"
          : diffMins < 60
            ? `${diffMins}m`
            : diffMins < 1440
              ? `${Math.floor(diffMins / 60)}h`
              : shortDateFormatter.format(new Date(note.lastEdited));
      const pinClass = note.pinned ? "pinned" : "";
      const pinIcon = note.pinned ? "ph-fill ph-push-pin" : "ph ph-push-pin";

      html += `
            <div class="note-item color-${note.color} ${pinClass}" onclick="openNote(${note.id})" role="button" tabindex="0" aria-label="Open note: ${escapeHtml(note.title.trim() || "Untitled")}" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openNote(${note.id}); }">
                <div class="note-item-content">
                    <div class="note-title">${escapeHtml(note.title.trim() || "Untitled")}</div>
                    <div class="note-excerpt">${escapeHtml(note.content.trim().substring(0, 40)) || "..."}</div>
                </div>
                <div class="note-actions-col">
                    <button type="button" class="pin-btn" aria-label="Pin Note: ${escapeHtml(note.title.trim() || "Untitled")}" onclick="togglePin(${note.id}, event)" title="Pin Note"><i class="${pinIcon}" aria-hidden="true"></i></button>
                    <span style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">${dateStr}</span>
                </div>
                <button type="button" class="note-delete-btn" aria-label="Delete Note: ${escapeHtml(note.title.trim() || "Untitled")}" onclick="deleteNote(${note.id}, event)" title="Delete">&times;</button>
            </div>`;
    });
  list.innerHTML = html;
  triggerMasonryUpdate();
}

function createNewNote() {
  const newId = Date.now();
  notesArr.push({
    id: newId,
    title: "",
    content: "",
    lastEdited: newId,
    color: "none",
    pinned: false,
  });
  saveNotesArr();
  document.getElementById("note-search").value = "";
  openNote(newId);
}
function updateNoteColorUI(color) {
  if (!colorDotCache || colorDotCache.length === 0)
    colorDotCache = document.querySelectorAll(".color-dot");
  colorDotCache.forEach((d) => {
    d.classList.remove("active");
    d.setAttribute("aria-pressed", "false");
  });
  const activeDot = document.getElementById(`c-${color}`);
  if (activeDot) {
    activeDot.classList.add("active");
    activeDot.setAttribute("aria-pressed", "true");
  }
}
function openNote(id) {
  currentNoteId = id;
  const note = notesArr.find((n) => n.id === id);
  if (!note) return;
  document.getElementById("note-title-input").value = note.title;
  document.getElementById("notepad-input").value = note.content;
  updateNoteColorUI(note.color);
  updateWordCount();
  document.getElementById("notepad-header-title").innerHTML =
    '<i class="ph ph-notepad" style="margin-right: 8px;" aria-hidden="true"></i>Edit Note';
  document.getElementById("notepad-list-actions").style.display = "none";
  document.getElementById("notepad-list-view").style.display = "none";
  document.getElementById("notepad-edit-actions").style.display = "flex";
  document.getElementById("notepad-edit-view").style.display = "flex";
  document.getElementById("notepad-input").focus({ preventScroll: true });
  triggerMasonryUpdate();
}
function closeNote() {
  const note = notesArr.find((n) => n.id === currentNoteId);
  if (note && note.title.trim() === "" && note.content.trim() === "") {
    notesArr = notesArr.filter((n) => n.id !== currentNoteId);
    saveNotesArr();
  }
  currentNoteId = null;
  renderNotesList();
  document.getElementById("notepad-header-title").innerHTML =
    '<i class="ph ph-notepad" style="margin-right: 8px;" aria-hidden="true"></i>Quick Notes';
  document.getElementById("notepad-edit-actions").style.display = "none";
  document.getElementById("notepad-edit-view").style.display = "none";
  document.getElementById("notepad-list-actions").style.display = "block";
  document.getElementById("notepad-list-view").style.display = "flex";
  triggerMasonryUpdate();
}
function autoSaveNote() {
  if (!currentNoteId) return;
  const idx = notesArr.findIndex((n) => n.id === currentNoteId);
  if (idx > -1) {
    notesArr[idx].title = document.getElementById("note-title-input").value;
    notesArr[idx].content = document.getElementById("notepad-input").value;
    notesArr[idx].lastEdited = Date.now();
    saveNotesArr();
    const status = document.getElementById("note-save-status");
    status.innerHTML =
      '<i class="ph ph-spinner" style="margin-right:3px;" aria-hidden="true"></i>Saving';
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
      status.innerHTML =
        '<i class="ph ph-cloud-check" style="margin-right:3px;" aria-hidden="true"></i>Saved';
    }, 500);
  }
}
function setNoteColor(color) {
  if (!currentNoteId) return;
  const idx = notesArr.findIndex((n) => n.id === currentNoteId);
  if (idx > -1) {
    notesArr[idx].color = color;
    updateNoteColorUI(color);
    autoSaveNote();
  }
}
function togglePin(id, event) {
  event.stopPropagation();
  let note = notesArr.find((n) => n.id === id);
  if (note) {
    note.pinned = !note.pinned;
    saveNotesArr();
    renderNotesList();
  }
}
function deleteNote(id, event) {
  event.stopPropagation();
  if (confirm("Delete this note?")) {
    notesArr = notesArr.filter((n) => n.id !== id);
    saveNotesArr();
    renderNotesList();
  }
}
function updateWordCount() {
  const inc = document.getElementById("note-word-count");
  if (inc) {
    const text = document.getElementById("notepad-input").value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    inc.innerText = `${words} words`;
  }
}
function copyNote() {
  const content = document.getElementById("notepad-input").value;
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(content)
      .then(showCopied)
      .catch(() => {});
  }
  function showCopied() {
    const t = document.getElementById("notepad-header-title");
    t.innerHTML =
      '<i class="ph ph-check-circle" style="margin-right: 8px; color: var(--success);" aria-hidden="true"></i>Copied!';
    setTimeout(
      () =>
        (t.innerHTML =
          '<i class="ph ph-notepad" style="margin-right: 8px;" aria-hidden="true"></i>Edit Note'),
      1500,
    );
  }
}
function downloadNote() {
  const title =
    document.getElementById("note-title-input").value.trim() || "note";
  const blob = new Blob([document.getElementById("notepad-input").value], {
    type: "text/plain",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// --- 8. NEWS HUB ---

let currentNewsCategory = "top";
const NEWS_DENSITY_KEY = "newsHubDensityMode";
let newsDensityMode =
  localStorage.getItem(NEWS_DENSITY_KEY) === "compact"
    ? "compact"
    : "comfortable";
const NEWS_SORT_KEY = "newsHubSortMode";
const NEWS_SORT_BY_TOPIC_KEY = "newsHubSortModeByTopic";
const NEWS_FILTER_KEY = "newsHubFilterQuery";
const NEWS_UNREAD_ONLY_KEY = "newsHubUnreadOnly";
const NEWS_IMAGE_ONLY_KEY = "newsHubImageOnly";
const NEWS_AUTO_REFRESH_KEY = "newsHubAutoRefreshMinutes";
const NEWS_SESSION_CACHE_TTL_MS = 15 * 60 * 1000;
const NEWS_FETCH_CONCURRENCY = 4;
const NEWS_MIN_ITEMS_FOR_ADVANCED_TOOLS = 8;
let newsSortMode = localStorage.getItem(NEWS_SORT_KEY) || "newest";
let newsSortByTopic = JSON.parse(
  localStorage.getItem(NEWS_SORT_BY_TOPIC_KEY) || "{}",
);
let newsFilterQuery = localStorage.getItem(NEWS_FILTER_KEY) || "";
let newsUnreadOnlyFilter =
  localStorage.getItem(NEWS_UNREAD_ONLY_KEY) === "true";
let newsWithImageOnlyFilter =
  localStorage.getItem(NEWS_IMAGE_ONLY_KEY) === "true";
let newsAutoRefreshMinutes = Number.parseInt(
  localStorage.getItem(NEWS_AUTO_REFRESH_KEY) || "0",
  10,
);
if (![0, 15, 30, 60].includes(newsAutoRefreshMinutes))
  newsAutoRefreshMinutes = 0;
let latestNewsItemsByCategory = {};
let newsAutoRefreshTimer = null;
let newsFilterDebounceTimer = null;
let newsFetchController = null;
const NEWS_FEED_CACHE_TTL_MS = 5 * 60 * 1000;
const newsFeedMemoryCache = new Map();

const NEWS_SOURCE_CATALOG = [
  { id: "bbc", name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  {
    id: "aljazeera",
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
  },
  {
    id: "reuters-world",
    name: "Reuters World",
    url: "https://feeds.reuters.com/Reuters/worldNews",
  },
  {
    id: "reuters-top",
    name: "Reuters Top News",
    url: "https://feeds.reuters.com/reuters/topNews",
  },
  {
    id: "ap-top",
    name: "AP Top News",
    url: "https://feeds.apnews.com/apf-topnews",
  },
  { id: "npr", name: "NPR News", url: "https://feeds.npr.org/1001/rss.xml" },
  {
    id: "abc-news",
    name: "ABC News",
    url: "https://abcnews.go.com/abcnews/topstories",
  },
  {
    id: "cbs-news",
    name: "CBS News",
    url: "https://www.cbsnews.com/latest/rss/main",
  },
  {
    id: "nbc-news",
    name: "NBC News",
    url: "https://feeds.nbcnews.com/nbcnews/public/news",
  },
  {
    id: "guardian-world",
    name: "The Guardian World",
    url: "https://www.theguardian.com/world/rss",
  },
  {
    id: "guardian-us",
    name: "The Guardian US",
    url: "https://www.theguardian.com/us/rss",
  },
  {
    id: "dw-world",
    name: "DW World",
    url: "https://rss.dw.com/rdf/rss-en-all",
  },
  {
    id: "sky-world",
    name: "Sky News",
    url: "https://feeds.skynews.com/feeds/rss/world.xml",
  },
  {
    id: "nyt-world",
    name: "NYT World",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  },
  {
    id: "nyt-us",
    name: "NYT US",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  },
  {
    id: "washpo-world",
    name: "Washington Post World",
    url: "https://feeds.washingtonpost.com/rss/world",
  },
  { id: "axios", name: "Axios", url: "https://api.axios.com/feed/" },
  { id: "techcrunch", name: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { id: "wired", name: "WIRED", url: "https://www.wired.com/feed/rss" },
  {
    id: "verge",
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
  },
  { id: "engadget", name: "Engadget", url: "https://www.engadget.com/rss.xml" },
  {
    id: "arstechnica-science",
    name: "Ars Technica Science",
    url: "https://feeds.arstechnica.com/arstechnica/science",
  },
  {
    id: "mit-tech-review",
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/feed/",
  },
  {
    id: "cnbc-business",
    name: "CNBC Business",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrpt01&id=10001147",
  },
  {
    id: "marketwatch-top",
    name: "MarketWatch Top Stories",
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
  },
  {
    id: "investopedia",
    name: "Investopedia",
    url: "https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_headline",
  },
  {
    id: "wsj-world",
    name: "WSJ World",
    url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
  },
  { id: "ft", name: "Financial Times", url: "https://www.ft.com/rss/home" },
  {
    id: "espn",
    name: "ESPN Top Headlines",
    url: "https://www.espn.com/espn/rss/news",
  },
  {
    id: "theathletic-nfl",
    name: "The Athletic NFL",
    url: "https://theathletic.com/nfl/?rss=1",
  },
  {
    id: "nasa-breaking",
    name: "NASA Breaking News",
    url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
  },
  {
    id: "sciencedaily",
    name: "ScienceDaily Top",
    url: "https://www.sciencedaily.com/rss/top.xml",
  },
  {
    id: "nature-latest",
    name: "Nature Latest Research",
    url: "https://www.nature.com/nature.rss",
  },
  {
    id: "ars",
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
  },
  {
    id: "daily-star-bd",
    name: "The Daily Star (Bangladesh)",
    url: "https://www.thedailystar.net/rss.xml",
  },
  {
    id: "prothomalo",
    name: "Prothom Alo (Bangladesh)",
    url: "https://www.prothomalo.com/feed/",
  },
  {
    id: "tbs-bd",
    name: "The Business Standard (Bangladesh)",
    url: "https://www.tbsnews.net/rss.xml",
  },
  {
    id: "jagonews24",
    name: "Jago News 24 (Bangladesh)",
    url: "https://www.jagonews24.com/rss/rss.xml",
  },
  {
    id: "kalerkantho",
    name: "Kaler Kantho (Bangladesh)",
    url: "https://www.kalerkantho.com/rss.xml",
  },
];

function refreshCurrentNews() {
  const btn = document.getElementById("news-refresh-btn");
  btn.classList.add("spinning");
  fetchNews(currentNewsCategory, true)
    .then(() => setTimeout(() => btn.classList.remove("spinning"), 500))
    .catch(() => setTimeout(() => btn.classList.remove("spinning"), 500));
}

function applyNewsDensityMode() {
  const modNews = document.getElementById("mod-news");
  const densityBtn = document.getElementById("news-density-btn");
  if (!modNews || !densityBtn) return;

  const isCompact = newsDensityMode === "compact";
  modNews.classList.toggle("news-density-compact", isCompact);
  densityBtn.setAttribute("aria-pressed", isCompact ? "true" : "false");
  densityBtn.setAttribute(
    "title",
    isCompact
      ? "Switch to Comfortable News Cards"
      : "Switch to Compact News Cards",
  );
  densityBtn.innerHTML = isCompact
    ? '<i class="ph ph-text-columns" aria-hidden="true"></i>'
    : '<i class="ph ph-text-align-justify" aria-hidden="true"></i>';
}

window.toggleNewsDensity = function toggleNewsDensity() {
  newsDensityMode = newsDensityMode === "compact" ? "comfortable" : "compact";
  localStorage.setItem(NEWS_DENSITY_KEY, newsDensityMode);
  applyNewsDensityMode();
  triggerMasonryUpdate();
};

const fetchWithTimeout = (url, ms, options = {}) =>
  Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms),
    ),
  ]);

const DEFAULT_NEWS_TOPICS = {
  top: {
    name: "Top Stories",
    feeds: [
      "https://feeds.bbci.co.uk/news/rss.xml",
      "https://www.aljazeera.com/xml/rss/all.xml",
      "https://feeds.reuters.com/reuters/topNews",
      "https://feeds.apnews.com/apf-topnews",
      "https://feeds.npr.org/1001/rss.xml",
      "https://www.theguardian.com/world/rss",
      "https://rss.dw.com/rdf/rss-en-all",
      "https://abcnews.go.com/abcnews/topstories",
      "https://www.cbsnews.com/latest/rss/main",
      "https://feeds.nbcnews.com/nbcnews/public/news",
    ],
  },
  tech: {
    name: "Technology",
    feeds: [
      "https://techcrunch.com/feed/",
      "https://www.wired.com/feed/rss",
      "https://www.theverge.com/rss/index.xml",
      "https://www.engadget.com/rss.xml",
      "https://feeds.arstechnica.com/arstechnica/index",
    ],
  },
  business: {
    name: "Business",
    feeds: [
      "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrpt01&id=10001147",
      "https://feeds.marketwatch.com/marketwatch/topstories/",
      "https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_headline",
      "https://www.ft.com/rss/home",
      "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    ],
  },
  science: {
    name: "Science",
    feeds: [
      "https://www.nasa.gov/rss/dyn/breaking_news.rss",
      "https://www.sciencedaily.com/rss/top.xml",
      "https://www.nature.com/nature.rss",
      "https://feeds.arstechnica.com/arstechnica/science",
    ],
  },
  us: {
    name: "US Headlines",
    feeds: [
      "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
      "https://www.theguardian.com/us/rss",
      "https://feeds.washingtonpost.com/rss/world",
      "https://api.axios.com/feed/",
    ],
  },
  bangladesh: {
    name: "Bangladesh",
    feeds: [
      "https://www.thedailystar.net/rss.xml",
      "https://www.prothomalo.com/feed/",
      "https://www.tbsnews.net/rss.xml",
      "https://www.jagonews24.com/rss/rss.xml",
      "https://www.kalerkantho.com/rss.xml",
    ],
  },
};

function cloneNewsTopicConfig(topic) {
  return {
    name: topic?.name || "Topic",
    feeds: Array.isArray(topic?.feeds) ? [...topic.feeds] : [],
  };
}

// --- NEWS HUB LOGIC ---
let newsHubSettings = JSON.parse(localStorage.getItem("newsHubSettings")) || {
  topics: DEFAULT_NEWS_TOPICS,
};

let readNewsArticles =
  JSON.parse(localStorage.getItem("readNewsArticles")) || [];
let readNewsArticleSet = new Set(readNewsArticles);

function persistReadNewsArticles() {
  localStorage.setItem("readNewsArticles", JSON.stringify(readNewsArticles));
  readNewsArticleSet = new Set(readNewsArticles);
}

function saveNewsSettings() {
  localStorage.setItem("newsHubSettings", JSON.stringify(newsHubSettings));
}

function sanitizeNewsFeedUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (trimmed === "http://feeds.bbci.co.uk/news/rss.xml")
    return "https://feeds.bbci.co.uk/news/rss.xml";
  if (trimmed === "https://www.thedailystar.net/frontpage/rss.xml")
    return "https://www.thedailystar.net/rss.xml";
  return trimmed;
}

function normalizeNewsSettings() {
  if (!newsHubSettings || typeof newsHubSettings !== "object") {
    newsHubSettings = { topics: {} };
  }
  if (!newsHubSettings.topics || typeof newsHubSettings.topics !== "object") {
    newsHubSettings.topics = {};
  }

  for (const topic of Object.values(newsHubSettings.topics)) {
    const feeds = Array.isArray(topic?.feeds) ? topic.feeds : [];
    const normalizedFeeds = feeds.map(sanitizeNewsFeedUrl).filter(Boolean);
    topic.feeds = [...new Set(normalizedFeeds)];
  }

  if (Object.keys(newsHubSettings.topics).length === 0) {
    newsHubSettings.topics = Object.fromEntries(
      Object.entries(DEFAULT_NEWS_TOPICS).map(([topicId, topicData]) => [
        topicId,
        cloneNewsTopicConfig(topicData),
      ]),
    );
  }

  for (const [topicId, topicData] of Object.entries(DEFAULT_NEWS_TOPICS)) {
    if (!newsHubSettings.topics[topicId]) {
      newsHubSettings.topics[topicId] = cloneNewsTopicConfig(topicData);
      continue;
    }
    const existingFeeds = Array.isArray(newsHubSettings.topics[topicId].feeds)
      ? newsHubSettings.topics[topicId].feeds
      : [];
    const mergedFeeds = [...existingFeeds, ...topicData.feeds]
      .map(sanitizeNewsFeedUrl)
      .filter(Boolean);
    newsHubSettings.topics[topicId].feeds = [...new Set(mergedFeeds)];
    if (!newsHubSettings.topics[topicId].name) {
      newsHubSettings.topics[topicId].name = topicData.name;
    }
  }
}

normalizeNewsSettings();

function getSortModeForCategory(category = currentNewsCategory) {
  return newsSortByTopic[category] || newsSortMode || "newest";
}

function setSortModeForCategory(category, mode) {
  newsSortMode = mode || "newest";
  newsSortByTopic[category] = newsSortMode;
  localStorage.setItem(NEWS_SORT_KEY, newsSortMode);
  localStorage.setItem(NEWS_SORT_BY_TOPIC_KEY, JSON.stringify(newsSortByTopic));
}

function syncNewsControlState() {
  const sortSelect = document.getElementById("news-sort-select");
  const autoRefreshSelect = document.getElementById("news-auto-refresh-select");
  if (sortSelect) sortSelect.value = getSortModeForCategory();
  if (autoRefreshSelect)
    autoRefreshSelect.value = String(newsAutoRefreshMinutes);
  updateNewsFilterToggleUi();
}

function updateNewsFilterToggleUi() {
  const unreadBtn = document.getElementById("news-filter-unread-btn");
  const imageBtn = document.getElementById("news-filter-image-btn");
  if (unreadBtn) {
    unreadBtn.classList.toggle("active", newsUnreadOnlyFilter);
    unreadBtn.setAttribute(
      "aria-pressed",
      newsUnreadOnlyFilter ? "true" : "false",
    );
  }
  if (imageBtn) {
    imageBtn.classList.toggle("active", newsWithImageOnlyFilter);
    imageBtn.setAttribute(
      "aria-pressed",
      newsWithImageOnlyFilter ? "true" : "false",
    );
  }
}

function applyNewsAutoRefresh() {
  if (newsAutoRefreshTimer) {
    clearInterval(newsAutoRefreshTimer);
    newsAutoRefreshTimer = null;
  }
  if (!newsAutoRefreshMinutes) return;
  newsAutoRefreshTimer = setInterval(
    () => {
      if (document.hidden) return;
      const settingsView = document.getElementById("news-settings-view");
      if (settingsView && settingsView.style.display !== "none") return;
      fetchNews(currentNewsCategory, true).catch(() => {});
    },
    newsAutoRefreshMinutes * 60 * 1000,
  );
}

function normalizeNewsUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ].forEach((param) => {
      u.searchParams.delete(param);
    });
    return u.toString();
  } catch (_) {
    return url || "";
  }
}

function applyNewsFiltersAndSorting(items) {
  const query = newsFilterQuery.trim().toLowerCase();
  let processed = Array.isArray(items) ? [...items] : [];

  if (query) {
    processed = processed.filter((item) => {
      const haystack = `${item.title || ""} ${item.source || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }

  if (newsUnreadOnlyFilter) {
    processed = processed.filter((item) => !readNewsArticleSet.has(item.link));
  }

  if (newsWithImageOnlyFilter) {
    processed = processed.filter(
      (item) => item.imgUrl && String(item.imgUrl).trim() !== "",
    );
  }

  const activeSortMode = getSortModeForCategory();
  if (activeSortMode === "oldest") {
    processed.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  } else if (activeSortMode === "source") {
    processed.sort((a, b) => (a.source || "").localeCompare(b.source || ""));
  } else if (activeSortMode === "unread") {
    processed.sort((a, b) => {
      const aRead = readNewsArticleSet.has(a.link) ? 1 : 0;
      const bRead = readNewsArticleSet.has(b.link) ? 1 : 0;
      if (aRead !== bRead) return aRead - bRead;
      return b.dateObj.getTime() - a.dateObj.getTime();
    });
  } else {
    processed.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }

  return processed;
}

function updateNewsToolsVisibility(totalItems = 0) {
  const sortSelect = document.getElementById("news-sort-select");
  const unreadBtn = document.getElementById("news-filter-unread-btn");
  const imageBtn = document.getElementById("news-filter-image-btn");
  const searchInput = document.getElementById("news-search-input");
  const clearFiltersBtn = document.getElementById("news-clear-filters-btn");
  const enableAdvancedTools = totalItems >= NEWS_MIN_ITEMS_FOR_ADVANCED_TOOLS;

  if (!enableAdvancedTools) {
    newsUnreadOnlyFilter = false;
    newsWithImageOnlyFilter = false;
    localStorage.setItem(NEWS_UNREAD_ONLY_KEY, "false");
    localStorage.setItem(NEWS_IMAGE_ONLY_KEY, "false");
    setSortModeForCategory(currentNewsCategory, "newest");
    if (sortSelect) sortSelect.value = "newest";
  }

  [sortSelect, unreadBtn, imageBtn].forEach((el) => {
    if (!el) return;
    el.style.display = enableAdvancedTools ? "" : "none";
  });

  if (searchInput) {
    searchInput.placeholder = enableAdvancedTools
      ? "Filter headlines or sources..."
      : "Quick search (lean mode for small feed sets)";
  }
  if (clearFiltersBtn) {
    clearFiltersBtn.textContent = enableAdvancedTools
      ? "Clear filters"
      : "Reset";
  }
  updateNewsFilterToggleUi();
}

function renderProcessedNewsForCurrentCategory() {
  const c = document.getElementById("news-container");
  if (!c) return;

  const baseItems = latestNewsItemsByCategory[currentNewsCategory] || [];
  updateNewsToolsVisibility(baseItems.length);
  const items = applyNewsFiltersAndSorting(baseItems);
  const summaryLabel = document.getElementById("news-results-summary");
  if (summaryLabel) {
    const total = baseItems.length;
    const visible = items.length;
    const leanModeSuffix =
      total > 0 && total < NEWS_MIN_ITEMS_FOR_ADVANCED_TOOLS
        ? ` · Lean mode (<${NEWS_MIN_ITEMS_FOR_ADVANCED_TOOLS} stories)`
        : "";
    summaryLabel.textContent =
      total === visible
        ? `${visible} visible${leanModeSuffix}`
        : `${visible}/${total} visible${leanModeSuffix}`;
  }
  if (items.length === 0) {
    c.innerHTML =
      "<div class='loading'><i class='ph ph-funnel-x' aria-hidden='true'></i>No matching stories. Try clearing filters.</div>";
    triggerMasonryUpdate();
    return;
  }

  renderNewsItems(items, c);
}

function updateNewsLastUpdated(ts) {
  const label = document.getElementById("news-last-updated");
  if (!label) return;
  if (!ts) {
    label.textContent = "Updated: --";
    return;
  }
  const minutes = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  label.textContent =
    minutes === 0 ? "Updated: Just now" : `Updated: ${minutes}m ago`;
}

function initNewsControls() {
  const searchInput = document.getElementById("news-search-input");
  const sortSelect = document.getElementById("news-sort-select");
  const unreadBtn = document.getElementById("news-filter-unread-btn");
  const imageBtn = document.getElementById("news-filter-image-btn");
  const markReadBtn = document.getElementById("news-mark-read-btn");
  const markUnreadBtn = document.getElementById("news-mark-unread-btn");
  const clearFiltersBtn = document.getElementById("news-clear-filters-btn");
  const autoRefreshSelect = document.getElementById("news-auto-refresh-select");
  const tabsContainer = document.getElementById("news-tabs-container");
  if (!searchInput || !sortSelect || !tabsContainer) return;

  searchInput.value = newsFilterQuery;
  syncNewsControlState();

  searchInput.addEventListener("input", (e) => {
    newsFilterQuery = e.target.value || "";
    localStorage.setItem(NEWS_FILTER_KEY, newsFilterQuery);
    if (newsFilterDebounceTimer) clearTimeout(newsFilterDebounceTimer);
    newsFilterDebounceTimer = setTimeout(
      () => renderProcessedNewsForCurrentCategory(),
      120,
    );
  });

  sortSelect.addEventListener("change", (e) => {
    setSortModeForCategory(currentNewsCategory, e.target.value || "newest");
    renderProcessedNewsForCurrentCategory();
  });

  if (unreadBtn) {
    unreadBtn.addEventListener("click", () => {
      newsUnreadOnlyFilter = !newsUnreadOnlyFilter;
      localStorage.setItem(
        NEWS_UNREAD_ONLY_KEY,
        newsUnreadOnlyFilter ? "true" : "false",
      );
      updateNewsFilterToggleUi();
      renderProcessedNewsForCurrentCategory();
    });
  }

  if (imageBtn) {
    imageBtn.addEventListener("click", () => {
      newsWithImageOnlyFilter = !newsWithImageOnlyFilter;
      localStorage.setItem(
        NEWS_IMAGE_ONLY_KEY,
        newsWithImageOnlyFilter ? "true" : "false",
      );
      updateNewsFilterToggleUi();
      renderProcessedNewsForCurrentCategory();
    });
  }

  if (markReadBtn)
    markReadBtn.addEventListener("click", markAllCurrentNewsAsRead);
  if (markUnreadBtn)
    markUnreadBtn.addEventListener("click", markAllCurrentNewsAsUnread);
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      newsFilterQuery = "";
      newsUnreadOnlyFilter = false;
      newsWithImageOnlyFilter = false;
      localStorage.setItem(NEWS_FILTER_KEY, "");
      localStorage.setItem(NEWS_UNREAD_ONLY_KEY, "false");
      localStorage.setItem(NEWS_IMAGE_ONLY_KEY, "false");
      searchInput.value = "";
      updateNewsFilterToggleUi();
      renderProcessedNewsForCurrentCategory();
    });
  }

  if (autoRefreshSelect) {
    autoRefreshSelect.addEventListener("change", (e) => {
      const nextValue = Number.parseInt(e.target.value || "0", 10);
      newsAutoRefreshMinutes = [0, 15, 30, 60].includes(nextValue)
        ? nextValue
        : 0;
      localStorage.setItem(
        NEWS_AUTO_REFRESH_KEY,
        String(newsAutoRefreshMinutes),
      );
      applyNewsAutoRefresh();
    });
  }

  tabsContainer.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    const tabs = Array.from(tabsContainer.querySelectorAll(".news-tab"));
    if (!tabs.length) return;
    const currentIndex = tabs.findIndex(
      (tab) => tab === document.activeElement,
    );
    if (currentIndex === -1) return;
    e.preventDefault();
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = tabs.length - 1;
    tabs[nextIndex].focus({ preventScroll: true });
    tabs[nextIndex].click();
  });

  applyNewsAutoRefresh();
}

function markArticleRead(url) {
  if (!readNewsArticleSet.has(url)) {
    readNewsArticles.push(url);
    if (readNewsArticles.length > 200) readNewsArticles.shift(); // Keep limit
    persistReadNewsArticles();
  }
}

function markAllCurrentNewsAsRead() {
  const items = latestNewsItemsByCategory[currentNewsCategory] || [];
  let changed = false;
  items.forEach((item) => {
    if (item.link && !readNewsArticleSet.has(item.link)) {
      readNewsArticles.push(item.link);
      changed = true;
    }
  });
  if (readNewsArticles.length > 500)
    readNewsArticles = readNewsArticles.slice(-500);
  if (changed) persistReadNewsArticles();
  renderProcessedNewsForCurrentCategory();
}

function markAllCurrentNewsAsUnread() {
  const links = new Set(
    (latestNewsItemsByCategory[currentNewsCategory] || []).map(
      (item) => item.link,
    ),
  );
  if (!links.size) return;
  const before = readNewsArticles.length;
  readNewsArticles = readNewsArticles.filter((link) => !links.has(link));
  if (readNewsArticles.length !== before) persistReadNewsArticles();
  renderProcessedNewsForCurrentCategory();
}

function getHighResImageUrl(url) {
  if (!url) return url;
  let upgraded = url;

  // BBC: replace small 240px thumbnail with 1024px version
  if (upgraded.includes("ichef.bbci.co.uk") && upgraded.includes("/240/")) {
    upgraded = upgraded.replace("/240/", "/1024/");
  }
  // YouTube: replace standard thumbnail with high-res variant
  if (upgraded.includes("hqdefault.jpg")) {
    upgraded = upgraded.replace("hqdefault.jpg", "maxresdefault.jpg");
  }

  return upgraded;
}

async function fetchSingleFeed(feedUrl, forceRefresh, signal) {
  const fallbackImg =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 256 256' fill='none' stroke='#a1a1a6' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'><rect x='32' y='48' width='192' height='160' rx='8'></rect><line x1='80' y1='104' x2='176' y2='104'></line><line x1='80' y1='144' x2='176' y2='144'></line></svg>",
    );
  const normalizedFeedUrl = sanitizeNewsFeedUrl(feedUrl);
  const cachedFeed = newsFeedMemoryCache.get(normalizedFeedUrl);
  if (
    !forceRefresh &&
    cachedFeed &&
    Date.now() - cachedFeed.timestamp < NEWS_FEED_CACHE_TTL_MS
  ) {
    return cachedFeed.items;
  }

  const sourceDomain = (() => {
    try {
      return new URL(normalizedFeedUrl).hostname;
    } catch (_) {
      return "";
    }
  })();
  const fallbackSourceName = sourceDomain || "News Feed";

  const shapeItem = (raw, sourceName) => {
    const title = raw.title || "News Article";
    const link = normalizeNewsUrl(raw.link || "#");
    const pubDate =
      raw.pubDate || raw.published || raw.updated || new Date().toISOString();
    const desc = raw.description || raw.summary || "";
    const content = raw.content || raw.contentEncoded || "";
    let imgUrl = fallbackImg;
    if (raw.enclosure?.link) imgUrl = raw.enclosure.link;
    else if (raw.enclosure?.thumbnail) imgUrl = raw.enclosure.thumbnail;
    else if (raw.thumbnail) imgUrl = raw.thumbnail;
    else if (raw.mediaContent) imgUrl = raw.mediaContent;
    else if (raw.mediaThumbnail) imgUrl = raw.mediaThumbnail;
    else {
      const match =
        desc.match(/<img[^>]+src=["']([^"']+)["']/i) ||
        content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match) imgUrl = match[1];
    }
    imgUrl = getHighResImageUrl(imgUrl);
    const dateObj = new Date(String(pubDate).replace(/-/g, "/"));
    const hAgo = Math.floor((Date.now() - dateObj.getTime()) / 3600000);
    const timeStr = isNaN(hAgo)
      ? "Recently"
      : hAgo <= 0
        ? "Just now"
        : `${hAgo}h ago`;
    return {
      title,
      link,
      imgUrl,
      source: sourceName || fallbackSourceName,
      sourceDomain,
      timeStr,
      dateObj,
    };
  };

  const parseXmlFeed = (xmlText) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");
    const nodes = Array.from(xml.querySelectorAll("item, entry")).slice(0, 15);
    if (nodes.length === 0) return [];
    const channelTitle =
      xml.querySelector("channel > title, feed > title")?.textContent ||
      fallbackSourceName;
    return nodes.map((item) =>
      shapeItem(
        {
          title: item.querySelector("title")?.textContent || "",
          link:
            item.querySelector("link")?.textContent ||
            item.querySelector("link")?.getAttribute("href") ||
            "#",
          pubDate:
            item.querySelector("pubDate, published, updated")?.textContent ||
            "",
          description:
            item.querySelector("description, summary")?.textContent || "",
          contentEncoded:
            item.getElementsByTagNameNS("*", "encoded")[0]?.textContent || "",
          content: item.querySelector("content")?.textContent || "",
          enclosure: {
            link: item.querySelector("enclosure")?.getAttribute("url") || "",
          },
          mediaContent:
            item
              .getElementsByTagNameNS("*", "content")[0]
              ?.getAttribute("url") ||
            item.querySelector("media\\:content")?.getAttribute("url") ||
            "",
          mediaThumbnail:
            item
              .getElementsByTagNameNS("*", "thumbnail")[0]
              ?.getAttribute("url") ||
            item.querySelector("media\\:thumbnail")?.getAttribute("url") ||
            "",
        },
        channelTitle,
      ),
    );
  };

  const attempts = [
    async () => {
      const cacheBuster = forceRefresh ? `&_t=${Date.now()}` : "";
      const fetchUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(normalizedFeedUrl)}${cacheBuster}`;
      const res = await fetchWithTimeout(fetchUrl, 10000, { signal });
      if (!res.ok) throw new Error("rss2json unavailable");
      const data = await res.json();
      if (data.status !== "ok" || !Array.isArray(data.items))
        throw new Error("rss2json invalid payload");
      const sourceName = data.feed?.title || fallbackSourceName;
      return data.items.slice(0, 15).map((item) => shapeItem(item, sourceName));
    },
    async () => {
      const fetchUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedFeedUrl)}`;
      const res = await fetchWithTimeout(fetchUrl, 10000, { signal });
      if (!res.ok) throw new Error("allorigins get unavailable");
      const data = await res.json();
      return parseXmlFeed(data.contents || "");
    },
    async () => {
      const fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalizedFeedUrl)}`;
      const res = await fetchWithTimeout(fetchUrl, 10000, { signal });
      if (!res.ok) throw new Error("allorigins raw unavailable");
      return parseXmlFeed(await res.text());
    },
  ];

  for (const attempt of attempts) {
    try {
      const items = await attempt();
      if (items.length > 0) {
        newsFeedMemoryCache.set(normalizedFeedUrl, {
          timestamp: Date.now(),
          items,
        });
        return items;
      }
    } catch (_) {}
  }

  return cachedFeed?.items || [];
}

async function fetchNewsData(topicId, forceRefresh, signal) {
  const topic = newsHubSettings.topics[topicId];
  const feedUrls = [
    ...new Set(
      (topic?.feeds || []).map((url) => (url || "").trim()).filter(Boolean),
    ),
  ];
  if (feedUrls.length === 0) return [];

  // Fetch feeds in bounded parallel batches for better responsiveness and lower burst load
  const results = [];
  for (let i = 0; i < feedUrls.length; i += NEWS_FETCH_CONCURRENCY) {
    const chunk = feedUrls.slice(i, i + NEWS_FETCH_CONCURRENCY);
    const chunkResults = await Promise.allSettled(
      chunk.map((url) => fetchSingleFeed(url, forceRefresh, signal)),
    );
    results.push(...chunkResults);
  }

  // ⚡ Bolt Performance: Eliminate O(N^2) array concat allocations and combine deduplication into a single O(N) pass using a Map
  const dedupedMap = new Map();
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      const items = result.value;
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        const key = normalizeNewsUrl(item.link);
        if (!dedupedMap.has(key)) {
          dedupedMap.set(key, item);
        }
      }
    }
  }

  const deduped = Array.from(dedupedMap.values());
  deduped.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  return deduped.slice(0, 20);
}

function renderNewsItems(items, container) {
  const fallbackImg =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 256 256' fill='none' stroke='#a1a1a6' stroke-width='12' stroke-linecap='round' stroke-linejoin='round'><rect x='32' y='48' width='192' height='160' rx='8'></rect><line x1='80' y1='104' x2='176' y2='104'></line><line x1='80' y1='144' x2='176' y2='144'></line></svg>",
    );
  const html = `<div class="news-list">${items
    .map((p) => {
      const isRead = readNewsArticleSet.has(p.link) ? "read" : "";
      const faviconUrl = p.sourceDomain
        ? `https://www.google.com/s2/favicons?domain=${p.sourceDomain}&sz=32`
        : "";
      const faviconHtml = faviconUrl
        ? `<img src="${faviconUrl}" alt="${p.source}" class="news-favicon" onerror="this.style.display='none'">`
        : "";

      return `
            <a href="${safeUrl(p.link)}" target="_blank" rel="noopener noreferrer" class="news-item ${isRead}">
                <div class="news-image-wrapper"><img src="${safeUrl(p.imgUrl, fallbackImg)}" class="news-image" alt="" onerror="this.src='${fallbackImg}'"></div>
                <div class="news-content">
                    <div class="news-title">${escapeHtml(p.title)}</div>
                    <div class="news-source-meta">
                        ${faviconHtml}
                        <div class="news-source">${p.source} &bull; ${p.timeStr}</div>
                    </div>
                </div>
            </a>`;
    })
    .join("")}</div>`;
  container.innerHTML = html;
  if (!container.dataset.newsDelegatedClick) {
    container.addEventListener("click", (event) => {
      const anchor = event.target.closest(".news-item");
      if (!anchor) return;
      markArticleRead(anchor.getAttribute("href"));
      anchor.classList.add("read");
    });
    container.dataset.newsDelegatedClick = "true";
  }

  // Phase 1 Fix: The Masonry Race Condition
  // Wait for all images (news images and favicons) to load or fail before triggering the masonry update
  const images = Array.from(container.querySelectorAll(".news-image, .news-favicon"));
  const totalImages = images.length;
  const finishedImages = new Set();
  let masonryTriggered = false;

  const triggerOnce = () => {
    if (masonryTriggered) return;
    masonryTriggered = true;
    triggerMasonryUpdate();
  };

  // Safety timeout: trigger masonry anyway after 2 seconds if images are taking too long
  const safetyTimeout = setTimeout(triggerOnce, 2000);

  if (totalImages === 0) {
    clearTimeout(safetyTimeout);
    triggerOnce();
  } else {
    const checkDone = (img) => {
      finishedImages.add(img);
      if (finishedImages.size >= totalImages) {
        clearTimeout(safetyTimeout);
        triggerOnce();
      }
    };

    images.forEach((img) => {
      if (img.complete && img.naturalWidth !== 0) {
        checkDone(img);
      } else {
        img.addEventListener("load", () => checkDone(img), { once: true });
        img.addEventListener("error", () => checkDone(img), { once: true });
      }
    });
  }
}

function renderNewsTabs() {
  const container = document.getElementById("news-tabs-container");
  if (!container) return;

  const htmlArr = [];
  const topics = newsHubSettings.topics || {};

  // Ensure currentNewsCategory is valid, default to first topic if not
  if (!topics[currentNewsCategory]) {
    currentNewsCategory = Object.keys(topics)[0] || "top";
  }

  for (const [topicId, topicData] of Object.entries(topics)) {
    const isActive = currentNewsCategory === topicId;
    htmlArr.push(
      `<button type="button" class="news-tab ${isActive ? "active" : ""}" id="tab-${topicId}" onclick="fetchNews('${topicId}')" role="tab" aria-selected="${isActive ? "true" : "false"}" tabindex="${isActive ? "0" : "-1"}">${escapeHtml(topicData.name)}</button>`,
    );
  }

  container.innerHTML = htmlArr.join("");
  syncNewsControlState();
}

function saveCustomRssSources() {
  localStorage.setItem(
    "dashboardCustomRssSources",
    JSON.stringify(customRssSources),
  );
}

function renderCustomRssSourceSelector() {
  const select = document.getElementById("set-rss-source");
  if (!select) return;

  select.innerHTML = NEWS_SOURCE_CATALOG.map(
    (source) =>
      `<option value="${escapeHtml(source.url)}|${escapeHtml(source.name)}">${escapeHtml(source.name)}</option>`,
  ).join("");
}

function renderCustomRssSourcesList() {
  const list = document.getElementById("rss-sources-list");
  if (!list) return;

  if (customRssSources.length === 0) {
    list.innerHTML =
      '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;"><i class="ph ph-newspaper" aria-hidden="true"></i> No custom sources added. Add your favorite RSS feeds in the Settings menu.</div>';
    return;
  }

  let html = "";
  customRssSources.forEach((src, i) => {
    html += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--inner-bg); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
                <div style="display: flex; flex-direction: column; overflow: hidden;">
                    <span style="font-weight: 700; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(src.name)}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(src.url)}</span>
                </div>
                <button type="button" class="delete-btn" aria-label="Remove Source: ${escapeHtml(src.name)}" style="opacity: 1; position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--danger-light); border-radius: 50%; padding: 0;" onclick="deleteCustomRssSource(${i})" title="Remove Source">&times;</button>
            </div>`;
  });
  list.innerHTML = html;
}

window.addCustomRssSource = function addCustomRssSource() {
  const select = document.getElementById("set-rss-source");
  if (!select || !select.value) return;

  const [url, name] = select.value.split("|");
  if (!url || !name) return;

  if (customRssSources.some((src) => src.url === url)) {
    alert("This source is already in your saved list.");
    return;
  }

  let idStr = "custom_" + Date.now();
  customRssSources.push({ id: idStr, name, url });
  saveCustomRssSources();
  renderCustomRssSourcesList();
  renderNewsTabs();
};

window.deleteCustomRssSource = function deleteCustomRssSource(i) {
  if (confirm("Remove this custom RSS feed?")) {
    // if currently viewing this feed, switch to default
    if (currentNewsCategory === customRssSources[i].id) {
      fetchNews("top");
    }
    customRssSources.splice(i, 1);
    saveCustomRssSources();
    renderCustomRssSourcesList();
    renderNewsTabs();
  }
};

window.renderNewsTabs = renderNewsTabs;

async function fetchNews(category, forceRefresh = false) {
  currentNewsCategory = category;
  renderNewsTabs();
  syncNewsControlState();

  const c = document.getElementById("news-container");
  if (!c) return;

  const cacheKey = `news_cache_${category}`;

  if (!forceRefresh) {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (cacheAge < NEWS_SESSION_CACHE_TTL_MS) {
          latestNewsItemsByCategory[category] = parsed.items || [];
          updateNewsLastUpdated(parsed.timestamp);
          renderProcessedNewsForCurrentCategory();
          return;
        }
        // Stale-while-refresh: show stale items instantly while fetching in background
        latestNewsItemsByCategory[category] = parsed.items || [];
        updateNewsLastUpdated(parsed.timestamp);
        renderProcessedNewsForCurrentCategory();
      } catch (_) {
        sessionStorage.removeItem(cacheKey);
      }
    }
  }

  const hasExistingItems = c.querySelector(".news-item") !== null;
  const currentHeight = c.offsetHeight;
  if (newsFetchController) newsFetchController.abort();
  newsFetchController = new AbortController();

  c.setAttribute("aria-busy", "true");

  if (hasExistingItems) {
    c.style.minHeight = currentHeight + "px";
    c.style.opacity = "0.5";
    c.style.pointerEvents = "none";
    c.style.transition = "opacity 0.2s ease";
  } else {
    c.innerHTML =
      '<div class="loading" style="height: 100%;"><i class="ph ph-spinner" aria-hidden="true"></i>Fetching latest headlines...</div>';
    triggerMasonryUpdate();
  }

  try {
    const items = await fetchNewsData(
      category,
      forceRefresh,
      newsFetchController.signal,
    );
    if (items.length === 0) throw new Error("No items");
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ timestamp: Date.now(), items: items }),
    );
    latestNewsItemsByCategory[category] = items;
    // Prevent race condition: Only render if the active tab hasn't changed during fetch
    if (currentNewsCategory === category) {
      c.style.opacity = "";
      c.style.pointerEvents = "";
      c.style.minHeight = "";
      c.removeAttribute("aria-busy");
      updateNewsLastUpdated(Date.now());
      renderProcessedNewsForCurrentCategory();
    }
  } catch (e) {
    if (e?.name === "AbortError") return;
    if (currentNewsCategory === category) {
      const stale = sessionStorage.getItem(cacheKey);
      if (stale) {
        try {
          const parsed = JSON.parse(stale);
          latestNewsItemsByCategory[category] = parsed.items || [];
          c.style.opacity = "";
          c.style.pointerEvents = "";
          c.style.minHeight = "";
          c.removeAttribute("aria-busy");
          updateNewsLastUpdated(parsed.timestamp || null);
          renderProcessedNewsForCurrentCategory();
          return;
        } catch (_) {
          sessionStorage.removeItem(cacheKey);
        }
      }
      c.style.opacity = "";
      c.style.pointerEvents = "";
      c.style.minHeight = "";
      c.removeAttribute("aria-busy");
      c.innerHTML =
        "<div class='loading' style='color:var(--danger);'><i class='ph ph-warning-circle' aria-hidden='true'></i>Could not load this topic. Check feed URLs or try refresh.</div>";
      updateNewsLastUpdated(null);
      triggerMasonryUpdate();
    }
  }
}

window.addEventListener("load", initDashboard);

// --- PWA SERVICE WORKER REGISTRATION ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (window.location.protocol !== "file:") {
      navigator.serviceWorker.register("./service-worker.js");
    }
  });
}

const SOUND_CLACK =
  "data:audio/wav;base64,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";
const SOUND_BLOOP =
  "data:audio/wav;base64,UklGRpgiAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YXQiAABmJl8mWCZSJksmRCY+JjcmMCYqJiMmHCYWJg8mCCYCJvsl9SXuJecl4SXaJdQlzSXGJcAluSWzJawlpiWfJZglkiWLJYUlfiV4JXElayVkJV4lVyVRJUolRCU9JTclMCUqJSMlHSUWJRAlCSUDJQPbCtsQ2xfbHdsk2yrbMNs32z3bRNtK21DbV9td22Tbattw23fbfduD24rbkNuW253bo9up27Dbttu828PbydvP29bb3Nvi2+jb79v12/vbAtwI3A7cFNwb3CHcJ9wt3DTcOtxA3EbcTdytI6cjoSObI5QjjiOII4IjfCN2I28jaSNjI10jVyNRI0ojRCM+IzgjMiMsIyYjHyMZIxMjDSMHIwEj+yL1Iu8i6SLjItwi1iLQIsoixCK+IrgisiKsIqYioCKaIpQijiKIIoIifCJ2IpDdlt2c3aLdqN2u3bTdut3A3cbdzN3S3djd3t3k3erd8N323fvdAd4H3g3eE94Z3h/eJd4r3jHeN9483kLeSN5O3lTeWt5g3mXea95x3nfefd6D3onejt6U3preoN6m3qvesd633kMhPSE4ITIhLCEmISEhGyEVIQ8hCSEEIf4g+CDyIO0g5yDhINwg1iDQIMogxSC/ILkgtCCuIKggoyCdIJcgkSCMIIYggSB7IHUgcCBqIGQgXyBZIFMgTiBIIEIgPSA3IDIgLCDa39/f5d/q3/Df9t/73wHgBuAM4BHgF+Ac4CLgKOAt4DPgOOA+4EPgSeBO4FTgWeBf4GTgauBv4HXgeuCA4IXgi+CQ4Jbgm+Ch4KbgrOCx4LfgvODB4MfgzODS4Nfg3eDi4BkfEx8OHwgfAx/+Hvge8x7tHuge4x7dHtge0h7NHsgewh69Hrgesh6tHqgeoh6dHpgekh6NHogegh59Hngech5tHmgeYx5dHlgeUx5NHkgeQx4+HjgeMx4uHikeIx7i4efh7OHy4ffh/OEB4gfiDOIR4hbiG+Ih4ibiK+Iw4jXiO+JA4kXiSuJP4lTiWuJf4mTiaeJu4nPieeJ+4oPiiOKN4pLil+Kc4qLip+Ks4rHituK74sDixeLK4s/iKx0mHSEdHB0XHRIdDR0IHQMd/hz5HPQc7xzqHOUc4BzbHNYc0RzMHMccwhy9HLgc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bwhtCGwIaghpCJj3mveb9533nveg96H3o/ek96b3p/ep96r3q/et9673sPex97P3tPe297f3uPe697v3vfe+90AIPwg9CDwIOwg5CDgINgg1CDMIMggxCC8ILggsCCsIKQgoCCcIJQgkCCIIIQggCB4IHQgbCOb36Pfp9+r37Pft9+/38Pfx9/P39Pf29/f3+Pf69/v3/ff+9//3AfgC+AT4BfgG+Aj4CfgK+PQH8wfxB/AH7wftB+wH6gfpB+gH5gflB+QH4gfhB98H3gfdB9sH2gfZB9cH1gfVB9MH0gfQBzH4Mvg0+DX4Nvg4+Dn4Ovg8+D34PvhA+EH4Q/hE+EX4R/hI+En4S/hM+E34T/hQ+FH4U/hU+KsHqQeoB6cHpQekB6MHoQegB58HnQecB5sHmQeYB5cHlQeUB5MHkQeQB48HjgeMB4sHigd4+Hn4evh8+H34fviA+IH4gviE+IX4hviH+In4iviL+I34jviP+JH4kviT+JT4lviX+Jj4mvhlB2QHYwdhB2AHXwddB1wHWwdaB1gHVwdWB1QHUwdSB1EHTwdOB00HTAdKB0kHSAdGB0UHvPi9+L/4wPjB+ML4xPjF+Mb4x/jJ+Mr4y/jM+M74z/jQ+NH40/jU+NX41vjY+Nn42vjb+CMHIgchByAHHgcdBxwHGwcZBxgHFwcWBxQHEwcSBxEHEAcOBw0HDAcLBwkHCAcHBwYHBQf9+P74//gA+QL5A/kE+QX5BvkI+Qn5CvkL+Q35DvkP+RD5EfkT+RT5FfkW+Rf5Gfka+Rv55AbjBuEG4AbfBt4G3QbbBtoG2QbYBtcG1QbUBtMG0gbRBtAGzgbNBswGywbKBsgGxwY6+Tv5PPk9+T/5QPlB+UL5Q/lF+Ub5R/lI+Un5SvlM+U35TvlP+VD5UflT+VT5VflW+Vf5qAamBqUGpAajBqIGoQagBp4GnQacBpsGmgaZBpcGlgaVBpQGkwaSBpEGjwaOBo0GjAZ1+Xb5d/l4+Xr5e/l8+X35fvl/+YD5gvmD+YT5hfmG+Yf5iPmJ+Yv5jPmN+Y75j/mQ+W8GbgZsBmsGagZpBmgGZwZmBmUGYwZiBmEGYAZfBl4GXQZcBlsGWgZYBlcGVgZVBlQGUwau+a/5sPmy+bP5tPm1+bb5t/m4+bn5uvm7+bz5vvm/+cD5wfnC+cP5xPnF+cb5x/k4BjYG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hv2G/Yf9h/14AngCeAJ3AncCdgJ2AnUCdQJ1AnQCdAJzAnMCcgJyAnICcQJxAnACkP2R/ZH9kf2S/ZL9k/2T/ZT9lP2U/ZX9lf2W/Zb9lv2X/Zf9mP1oAmcCZwJnAmYCZgJlAmUCZQJkAmQCYwJjAmICYgJiAmECYQJgAqD9oP2h/aH9ov2i/aP9o/2j/aT9pP2l/aX9pf2m/ab9p/2n/af9qP1YAlcCVwJWAlYCVgJVAlUCVAJUAlQCUwJTAlICUgJSAlECUQJQArD9sP2x/bH9sv2y/bL9s/2z/bT9tP20/bX9tf22/bb9tv23/bf9SAJIAkgCRwJHAkYCRgJGAkUCRQJEAkQCRAJDAkMCQgJCAkICQQK//cD9wP3A/cH9wf3B/cL9wv3D/cP9w/3E/cT9xf3F/cX9xv3G/TkCOQI5AjgCOAI4AjcCNwI2AjYCNgI1AjUCNAI0AjQCMwIzAjMCzv3O/c/9z/3P/dD90P3R/dH90f3S/dL90v3T/dP91P3U/dT91f0rAisCKgIqAikCKQIpAigCKAIoAicCJwImAiYCJgIlAiUCJQIkAtz93f3d/d393v3e/d793/3f/eD94P3g/eH94f3h/eL94v3j/eP9HQIcAhwCHAIbAhsCGwIaAhoCGQIZAhkCGAIYAhgCFwIXAhcCFgLq/ev96/3r/ez97P3s/e397f3t/e797v3v/e/97/3w/fD98P0PAg8CDwIOAg4CDgINAg0CDAIMAgwCCwILAgsCCgIKAgoCCQIJAvf9+P34/fn9+f35/fr9+v36/fv9+/37/fz9/P38/f39/f39/f79AgIBAgECAQIAAgACAAL/Af8B/wH+Af4B/gH9Af0B/QH8AfwBBP4F/gX+Bf4G/gb+Bv4H/gf+CP4I/gj+Cf4J/gn+Cv4K/gr+C/71AfUB9AH0AfQB8wHzAfMB8gHyAfIB8QHxAfEB8AHwAfAB7wER/hH+Ev4S/hL+E/4T/hP+FP4U/hT+Ff4V/hX+Fv4W/hb+F/4=";

// --- AUDIO SOUNDSCAPE ---
const audioCache = {
  clack: new Audio(SOUND_CLACK),
  bloop: new Audio(SOUND_BLOOP),
};

function playThemeSound() {
  if (dashSettings.themeStyle === "terminal") {
    audioCache.clack.currentTime = 0;
    audioCache.clack.play().catch(() => {});
  } else if (dashSettings.themeStyle === "pixel") {
    audioCache.bloop.currentTime = 0;
    audioCache.bloop.play().catch(() => {});
  }
}

document.addEventListener("click", function (e) {
  const isInteractive = e.target.closest(
    "button, .btn, a, input, select, .card, .news-item, .fab-btn, .action-btn, .icon-btn",
  );
  if (isInteractive) {
    playThemeSound();
  }
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getWindDir,
    getAqiInfo,
    escapeHtml,
    safeUrl,
    safeParseJson,
    getModuleKeyByCardId,

    getCardIdByModuleKey,
    isWidgetLayoutEnabled,
    dashSettings,
    applyWorkspace,
    saveCurrentWorkspace,
    deleteWorkspace,
    addWorkspaceSchedule,
    removeWorkspaceSchedule,

  };
}

// --- SYSTEM UPDATE FUNCTION ---
async function checkForUpdates() {
  const statusDiv = document.getElementById("update-status");
  const updateBtn = document.querySelector(
    '.backup-btn[onclick="checkForUpdates()"]',
  );

  if (!statusDiv || !updateBtn) return;

  const originalBtnHTML = updateBtn.innerHTML;
  // Set loading state
  statusDiv.style.color = "var(--text-main)";
  statusDiv.innerHTML =
    '<i class="ph ph-spinner ph-spin" aria-hidden="true"></i> Checking for updates...';
  updateBtn.disabled = true;
  updateBtn.style.opacity = "0.7";
  updateBtn.innerHTML =
    '<i class="ph ph-spinner ph-spin" aria-hidden="true"></i> Checking...';

  try {
    // Fetch latest commit from main branch
    const response = await fetch(
      "https://api.github.com/repos/rabib786/Personal-Dashboard-/commits/main",
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.commit && data.commit.author) {
      const commitDate = new Date(data.commit.author.date);
      const formattedDate =
        commitDate.toLocaleDateString() + " " + commitDate.toLocaleTimeString();
      const commitMessage = escapeHtml(data.commit.message);

      statusDiv.style.color = "var(--text-main)";
      statusDiv.innerHTML = `
                <div style="margin-bottom: 8px;">
                    <strong>Latest Update:</strong> ${formattedDate}
                </div>
                <div style="margin-bottom: 12px; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 6px; border-left: 3px solid var(--accent);">
                    ${commitMessage}
                </div>
                <div style="color: var(--accent); font-weight: 500;">
                    <i class="ph ph-info" aria-hidden="true"></i> To apply this update, close this window and run <code>update.bat</code> (Windows) or <code>update.sh</code> (Mac/Linux) in your dashboard folder.
                </div>
            `;
    } else {
      throw new Error("Invalid response format from GitHub");
    }
  } catch (error) {
    console.error("Update check failed:", error);
    statusDiv.style.color = "#ff4b4b"; // Error color
    statusDiv.innerHTML = `<i class="ph ph-warning" aria-hidden="true"></i> Error checking for updates. Please check your internet connection or try again later.`;
  } finally {
    updateBtn.disabled = false;
    updateBtn.style.opacity = "1";
    updateBtn.innerHTML = originalBtnHTML;
  }
}

// --- NEWS HUB SETTINGS LOGIC ---
function toggleNewsSettings() {
  const view = document.getElementById("news-settings-view");
  const tabs = document.getElementById("news-tabs-container");
  const tools = document.getElementById("news-tools");
  const container = document.getElementById("news-container");
  const btn = document.getElementById("news-manage-btn");

  if (view.style.display === "none") {
    view.style.display = "block";
    tabs.style.display = "none";
    if (tools) tools.style.display = "none";
    container.style.display = "none";
    btn.setAttribute("aria-expanded", "true");
    btn.innerHTML = '<i class="ph ph-x" aria-hidden="true"></i>';
    renderNewsSettings();
  } else {
    view.style.display = "none";
    tabs.style.display = "flex"; // Ensure flex since it might be a flex container
    if (tools) tools.style.display = "flex";
    container.style.display = "block";
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = '<i class="ph ph-gear" aria-hidden="true"></i>';
    renderNewsTabs();
    fetchNews(currentNewsCategory);
  }
  triggerMasonryUpdate();
}

function renderNewsSettings() {
  const list = document.getElementById("news-settings-topics-list");
  if (!list) return;

  const htmlArr = [];
  const topics = newsHubSettings.topics || {};

  for (const [topicId, topicData] of Object.entries(topics)) {
    htmlArr.push(`
            <div style="background: var(--inner-bg); border: 1px solid var(--glass-border); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <input type="text" aria-label="Topic Name: ${escapeHtml(topicData.name)}" value="${escapeHtml(topicData.name)}" onchange="updateNewsTopicName('${topicId}', this.value)" style="font-weight: bold; background: transparent; border: none; border-bottom: 1px dashed var(--glass-border); color: var(--text-main); font-size: 1rem; padding: 2px;">
                    <button type="button" aria-label="Delete Topic: ${escapeHtml(topicData.name)}" title="Delete Topic" class="icon-btn" onclick="deleteNewsTopic('${topicId}')" style="color: var(--danger); width: 28px; height: 28px;"><i class="ph ph-trash" aria-hidden="true"></i></button>
                </div>
                <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px;">
                    <select id="catalog-${topicId}" aria-label="Choose News Source for: ${escapeHtml(topicData.name)}" style="flex: 1; padding: 6px 8px; border-radius: 6px; border: 1px solid var(--glass-border); background: var(--inner-bg); color: var(--text-main); font-size: 0.85rem;">
                        ${NEWS_SOURCE_CATALOG.map((source) => `<option value="${escapeHtml(source.url)}">${escapeHtml(source.name)}</option>`).join("")}
                    </select>
                    <button type="button" aria-label="Add Source" class="action-btn" onclick="addNewsTopicFeedFromCatalog('${topicId}')" style="padding: 6px 10px; font-size: 0.8rem; justify-content: center;"><i class="ph ph-plus" aria-hidden="true"></i> Add Source</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
        `);

    topicData.feeds.forEach((feedUrl, idx) => {
      htmlArr.push(`
                <div style="display: flex; gap: 5px; align-items: center;">
                    <input type="url" aria-label="Feed URL: ${escapeHtml(feedUrl)}" value="${escapeHtml(feedUrl)}" onchange="updateNewsTopicFeed('${topicId}', ${idx}, this.value)" placeholder="https://example.com/rss" style="flex: 1; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--glass-border); background: var(--inner-bg); color: var(--text-main); font-size: 0.8rem;">
                    <button type="button" aria-label="Remove Feed: ${escapeHtml(feedUrl)}" title="Remove Feed" class="icon-btn" onclick="deleteNewsTopicFeed('${topicId}', ${idx})" style="width: 24px; height: 24px;"><i class="ph ph-minus" aria-hidden="true"></i></button>
                </div>
            `);
    });

    htmlArr.push(`
                </div>
                <button type="button" aria-label="Add Feed" class="action-btn" onclick="addNewsTopicFeed('${topicId}')" style="margin-top: 8px; font-size: 0.8rem; padding: 4px 8px; justify-content: center;"><i class="ph ph-plus" aria-hidden="true"></i> Add Feed</button>
            </div>
        `);
  }

  list.innerHTML = htmlArr.join("");
  triggerMasonryUpdate();
}

function addNewsTopicFeedFromCatalog(topicId) {
  const select = document.getElementById(`catalog-${topicId}`);
  if (!select || !newsHubSettings.topics[topicId]) return;

  const selectedFeed = select.value;
  if (!selectedFeed) return;

  const topicFeeds = newsHubSettings.topics[topicId].feeds;
  if (topicFeeds.includes(selectedFeed)) {
    alert("This source is already added to the topic.");
    return;
  }

  topicFeeds.push(selectedFeed);
  saveNewsSettings();
  renderNewsSettings();
}

function updateNewsTopicName(topicId, newName) {
  if (newsHubSettings.topics[topicId]) {
    newsHubSettings.topics[topicId].name = newName || "Unnamed Topic";
    saveNewsSettings();
  }
}

function updateNewsTopicFeed(topicId, idx, newUrl) {
  if (
    newsHubSettings.topics[topicId] &&
    newsHubSettings.topics[topicId].feeds[idx] !== undefined
  ) {
    if (newUrl) {
      newsHubSettings.topics[topicId].feeds[idx] = newUrl;
    } else {
      newsHubSettings.topics[topicId].feeds.splice(idx, 1);
    }
    saveNewsSettings();
    renderNewsSettings();
  }
}

function deleteNewsTopicFeed(topicId, idx) {
  if (newsHubSettings.topics[topicId]) {
    newsHubSettings.topics[topicId].feeds.splice(idx, 1);
    saveNewsSettings();
    renderNewsSettings();
  }
}

function addNewsTopicFeed(topicId) {
  if (newsHubSettings.topics[topicId]) {
    newsHubSettings.topics[topicId].feeds.push("");
    saveNewsSettings();
    renderNewsSettings();
  }
}

function deleteNewsTopic(topicId) {
  if (confirm("Are you sure you want to delete this entire topic?")) {
    delete newsHubSettings.topics[topicId];
    saveNewsSettings();
    renderNewsSettings();
  }
}

function addNewsTopic() {
  let id = "topic_" + Date.now();
  newsHubSettings.topics[id] = { name: "New Topic", feeds: [] };
  saveNewsSettings();
  renderNewsSettings();
}

// Call migrateLegacyProfilesToWorkspaces on init
if (typeof window !== 'undefined') {

}

// Import Torn Engine Script dynamically if not present
if (typeof document !== 'undefined' && document.querySelector && !document.querySelector('script[src="torn_engine.js"]')) {
  const script = (typeof document !== 'undefined' && document.createElement) ? document.createElement('script') : {};
  script.src = 'torn_engine.js';
  if (typeof document !== 'undefined' && document.head) if (typeof document !== 'undefined' && document.head) if (typeof document !== 'undefined' && document.head) document.head.appendChild(script);
}

// Import Torn Widgets Script dynamically if not present
if (typeof document !== 'undefined' && document.querySelector && !document.querySelector('script[src="torn_widgets.js"]')) {
  const script = typeof document !== 'undefined' ? document.createElement('script') : {};
  script.src = 'torn_widgets.js';
  if (typeof document !== 'undefined' && document.head) document.head.appendChild(script);
}

// Add CSS for Torn Widgets
const tornStyles = (typeof document !== 'undefined' && document.createElement) ? document.createElement('style') : {};
tornStyles.innerHTML = `
  .torn-widget { border: 1px solid var(--border-color, #ccc); margin-bottom: 10px; padding: 10px; border-radius: 8px; }
  .torn-widget h3 { margin-top: 0; display: flex; justify-content: space-between; align-items: center; }
  .event-list { list-style-type: none; padding-left: 0; }
  .event-list li { margin-bottom: 5px; border-bottom: 1px solid var(--border-color, #eee); padding-bottom: 5px; }
  .event-list li:last-child { border-bottom: none; }
`;
if (typeof document !== 'undefined' && document.head) if (typeof document !== 'undefined' && document.head) document.head.appendChild(tornStyles);

// Import Torn Settings UI Script dynamically if not present
if (typeof document !== 'undefined' && document.querySelector && !document.querySelector('script[src="torn_settings.js"]')) {
  const script = typeof document !== 'undefined' ? document.createElement('script') : {};
  script.src = 'torn_settings.js';
  if (typeof document !== 'undefined' && document.head) document.head.appendChild(script);
}

// Global hook for the button
window.openTornSettings = function() {
    if (typeof TornSettingsUI !== 'undefined') {
        TornSettingsUI.open();
    } else {
        console.error("TornSettingsUI not loaded");
    }
};

// CSS for Settings Modal
const settingsStyles = (typeof document !== 'undefined' && document.createElement) ? document.createElement('style') : {};
settingsStyles.innerHTML = `
  .torn-settings-modal {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
    z-index: 1000;
  }
  .settings-content {
    background: var(--bg-color, #fff); color: var(--text-color, #000);
    padding: 20px; border-radius: 8px; width: 80%; max-width: 600px;
    position: relative;
  }
  .close-btn { position: absolute; top: 10px; right: 15px; cursor: pointer; font-size: 24px; }
  .settings-section { margin-bottom: 20px; }
  .widget-list { list-style: none; padding: 0; }
  .widget-list li {
    display: flex; align-items: center; padding: 10px; border: 1px solid #ccc;
    margin-bottom: 5px; background: rgba(0,0,0,0.05); cursor: grab;
  }
  .drag-handle { margin-right: 10px; cursor: grab; }
  .widget-name { flex-grow: 1; margin-left: 10px; }
  .poll-override { width: 80px; }
`;
if (typeof document !== 'undefined' && document.head) if (typeof document !== 'undefined' && document.head) document.head.appendChild(settingsStyles);

// Initial Render Hook for Dashboard
function renderTornDashboard() {
  const container = document.getElementById("mod-torn-workspace");
  if (!container) return;

  container.innerHTML = ''; // Clear existing
  const layout = TornStorage.getLayout();

  layout.order.forEach(widgetId => {
    if (layout.activeWidgets.includes(widgetId)) {
      let widget;
      switch (widgetId) {
        case 'events': widget = new EventsWidget(); break;
        case 'travel': widget = new TravelWidget(); break;
        case 'bars': widget = new BarsWidget(); break;
        // Mock others for now
        default:
           widget = new TornWidget(widgetId, widgetId.toUpperCase(), 60000);
           break;
      }
      container.appendChild(widget.render());
      widget.start();
    }
  });
}

// Attach a listener to settings modal triggers if any exist in the UI, else the user can call window.openTornSettings()
