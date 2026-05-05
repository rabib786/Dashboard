// --- POWER-USER SETTINGS UI FOR TORN ---

class TornSettingsUI {
  constructor() {
    this.container = null;
    this.availableWidgets = ['events', 'travel', 'bars', 'chain', 'inventory', 'stats'];
  }

  render() {
    const config = TornStorage.getConfig();
    const layout = TornStorage.getLayout();

    const el = document.createElement('div');
    el.className = 'torn-settings-modal';
    el.id = 'torn-settings-modal';
    el.style.display = 'none'; // Hidden by default

    el.innerHTML = `
      <div class="settings-content">
        <span class="close-btn" onclick="TornSettingsUI.close()">&times;</span>
        <h2>Torn Workspace Settings</h2>

        <div class="settings-section">
          <h3>API Configuration</h3>
          <label>API Key:</label>
          <input type="password" id="torn-api-key" value="${this.escapeHtml(config.apiKey || '')}" placeholder="Enter Torn API Key">

          <label>Global Sync Mode:</label>
          <select id="torn-sync-mode">
            <option value="aggressive" ${config.syncMode === 'aggressive' ? 'selected' : ''}>Aggressive (Fast updates, high API usage)</option>
            <option value="standard" ${config.syncMode === 'standard' ? 'selected' : ''}>Standard (Balanced)</option>
            <option value="eco" ${config.syncMode === 'eco' ? 'selected' : ''}>Eco Mode (Battery/API saving)</option>
          </select>
        </div>

        <div class="settings-section">
          <h3>Widget Layout & Polling Overrides</h3>
          <p class="text-secondary">Drag to reorder. Check to enable.</p>
          <ul id="torn-widget-list" class="widget-list">
            ${this.renderWidgetList(layout, config)}
          </ul>
        </div>

        <div class="settings-section">
          <h3>Data Export</h3>
          <button onclick="TornSettingsUI.exportData()">Export Local Cache (JSON)</button>
        </div>

        <button class="save-btn" onclick="TornSettingsUI.save()">Save Configuration</button>
      </div>
    `;

    this.container = el;
    document.body.appendChild(el);
    this.setupDragAndDrop();
    return el;
  }

  renderWidgetList(layout, config) {
    let html = '';
    // First render active widgets in order
    layout.order.forEach(w => {
      const isActive = layout.activeWidgets.includes(w);
      const override = config.widgetOverrides[w] ? (config.widgetOverrides[w] / 1000) : '';
      html += this.createWidgetListItem(w, isActive, override);
    });

    // Then render any available widgets not in the order
    this.availableWidgets.forEach(w => {
      if (!layout.order.includes(w)) {
        html += this.createWidgetListItem(w, false, '');
      }
    });
    return html;
  }

  createWidgetListItem(widgetId, isActive, override) {
    const titles = {
      'events': 'Live Events',
      'travel': 'Travel Hub',
      'bars': 'Bars & Refills',
      'chain': 'Chain Watcher',
      'inventory': 'Inventory',
      'stats': 'Stat Progression'
    };
    const title = titles[widgetId] || widgetId;

    return `
      <li draggable="true" data-id="${widgetId}">
        <span class="drag-handle">☰</span>
        <input type="checkbox" class="widget-toggle" data-id="${widgetId}" ${isActive ? 'checked' : ''}>
        <span class="widget-name">${title}</span>
        <input type="number" class="poll-override" data-id="${widgetId}" value="${override}" placeholder="Poll (s)" min="10" title="Override polling interval in seconds">
      </li>
    `;
  }

  setupDragAndDrop() {
    const list = this.container.querySelector('#torn-widget-list');
    let draggedItem = null;

    list.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'LI') {
        draggedItem = e.target;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => draggedItem.style.opacity = '0.5', 0);
      }
    });

    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(list, e.clientY);
      const currentItem = document.querySelector('.dragging'); // this class approach would need more setup
      // Simplistic approach for drag over:
      if (e.target.tagName === 'LI' && e.target !== draggedItem) {
          const rect = e.target.getBoundingClientRect();
          const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > .5;
          list.insertBefore(draggedItem, next && e.target.nextSibling || e.target);
      }
    });

    list.addEventListener('dragend', () => {
      if (draggedItem) {
        draggedItem.style.opacity = '1';
        draggedItem = null;
      }
    });
  }

  getDragAfterElement(container, y) {
      // Stub for standard drag-and-drop
  }

  escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  static open() {
    let modal = document.getElementById('torn-settings-modal');
    if (!modal) {
      const ui = new TornSettingsUI();
      modal = ui.render();
    } else {
        // Re-render contents
        const ui = new TornSettingsUI();
        const newHtml = ui.render();
        modal.innerHTML = newHtml.innerHTML;
        ui.setupDragAndDrop();
    }
    modal.style.display = 'flex';
  }

  static close() {
    const modal = document.getElementById('torn-settings-modal');
    if (modal) modal.style.display = 'none';
  }

  static save() {
    const modal = document.getElementById('torn-settings-modal');
    if (!modal) return;

    // Save Config
    const config = TornStorage.getConfig();
    config.apiKey = modal.querySelector('#torn-api-key').value.trim();
    config.syncMode = modal.querySelector('#torn-sync-mode').value;

    const overrides = {};
    modal.querySelectorAll('.poll-override').forEach(input => {
      const val = parseInt(input.value);
      if (!isNaN(val) && val >= 10) {
        overrides[input.dataset.id] = val * 1000; // to ms
      }
    });
    config.widgetOverrides = overrides;
    TornStorage.saveConfig(config);

    // Save Layout
    const layout = TornStorage.getLayout();
    const activeWidgets = [];
    const order = [];

    modal.querySelectorAll('#torn-widget-list li').forEach(li => {
      const id = li.dataset.id;
      order.push(id);
      const checkbox = li.querySelector('.widget-toggle');
      if (checkbox && checkbox.checked) {
        activeWidgets.push(id);
      }
    });

    layout.activeWidgets = activeWidgets;
    layout.order = order;
    TornStorage.saveLayout(layout);

    TornSettingsUI.close();

    // In real app, trigger dashboard re-render
    if (typeof renderTornDashboard === 'function') {
        renderTornDashboard();
    }
  }

  static exportData() {
    const cache = localStorage.getItem(TORN_CACHE_KEY);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(cache || "{}");
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "torn_cache_export.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

// Ensure exports for tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TornSettingsUI };
}
