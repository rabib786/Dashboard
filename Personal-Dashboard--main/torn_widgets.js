// --- MODULAR UI WIDGETS FOR TORN ---

// Managed interval system for memory leak prevention
const tornWidgetActiveIntervals = new Set();

function createTornWidgetManagedInterval(callback, delay) {
  const id = setInterval(callback, delay);
  tornWidgetActiveIntervals.add(id);
  return id;
}

function clearTornWidgetManagedInterval(id) {
  if (id) {
    clearInterval(id);
    tornWidgetActiveIntervals.delete(id);
  }
}

function clearAllTornWidgetIntervals() {
  tornWidgetActiveIntervals.forEach(id => clearInterval(id));
  tornWidgetActiveIntervals.clear();
}

class TornWidget {
  constructor(id, title, updateIntervalMs) {
    this.id = id;
    this.title = title;
    this.updateIntervalMs = updateIntervalMs;
    this.lastUpdate = 0;
    this.container = null;
    this.intervalId = null;
  }

  render() {
    const el = document.createElement("div");
    el.className = "card torn-widget";
    el.id = `widget-${this.id}`;
    el.innerHTML = `
      <h3>${this.title} <span class="widget-status"></span></h3>
      <div class="widget-content" id="content-${this.id}">
        <p class="text-secondary">Loading...</p>
      </div>
    `;
    this.container = el;
    return el;
  }

  start() {
    this.update(); // Initial fetch
    // Use configured override if available, otherwise default
    const config = TornStorage.getConfig();
    const interval = config.widgetOverrides[this.id] || this.updateIntervalMs;

    this.intervalId = createTornWidgetManagedInterval(() => this.update(), interval);
  }

  stop() {
    if (this.intervalId) {
      clearTornWidgetManagedInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async update() {
    if (this.container) {
      this.container.querySelector('.widget-status').innerText = '🔄';
    }
    try {
      await this.fetchData();
      if (this.container) {
        this.container.querySelector('.widget-status').innerText = '✅';
        setTimeout(() => {
          if (this.container) this.container.querySelector('.widget-status').innerText = '';
        }, 2000);
      }
    } catch (e) {
      if (this.container) {
        this.container.querySelector('.widget-status').innerText = '❌';
      }
      console.error(`Error updating widget ${this.id}:`, e);
    }
  }

  async fetchData() {
    // Override in subclasses
  }

  updateContent(html) {
    if (this.container) {
      const contentEl = this.container.querySelector(`#content-${this.id}`);
      if (contentEl) {
        contentEl.innerHTML = html;
        if (typeof triggerMasonryUpdate === 'function') {
          triggerMasonryUpdate();
        }
      }
    }
  }
}

// 1. Live Events & Notifications Widget
class EventsWidget extends TornWidget {
  constructor() {
    super('events', 'Live Events', 30000); // 30s default
  }

  async fetchData() {
    const data = await TornEngine.enqueueRequest('user', ['events', 'messages']);
    let html = '<ul class="event-list">';

    // Safety check for mocked data in tests
    if (data._mocked) {
        html += `<li>Mocked Events Data</li>`;
    } else {
        const events = data.events ? Object.values(data.events).slice(0, 5) : [];
        if (events.length === 0) html += '<li>No recent events</li>';
        events.forEach(ev => {
          html += `<li><small>${new Date(ev.timestamp * 1000).toLocaleTimeString()}</small>: ${ev.event}</li>`;
        });
    }

    html += '</ul>';
    this.updateContent(html);
  }
}

// 2. Travel Hub Widget
class TravelWidget extends TornWidget {
  constructor() {
    super('travel', 'Travel Status', 60000); // 1m default
  }

  async fetchData() {
    const data = await TornEngine.enqueueRequest('user', ['travel']);
    let html = '';

    if (data._mocked) {
        html = '<p>Mocked Travel Data</p>';
    } else {
        const travel = data.travel;
        if (travel && travel.destination !== 'Torn') {
             const timeRemaining = travel.time_left; // in seconds
             html = `
                <div class="travel-status">
                  <strong>Destination:</strong> ${travel.destination}<br>
                  <strong>Time Left:</strong> ${Math.floor(timeRemaining/60)}m ${timeRemaining%60}s
                </div>
             `;
        } else {
             html = '<p>Currently in Torn City.</p>';
        }
    }
    this.updateContent(html);
  }
}

// 3. Bars & Refills Widget
class BarsWidget extends TornWidget {
  constructor() {
    super('bars', 'Bars & Refills', 30000);
  }

  async fetchData() {
    const data = await TornEngine.enqueueRequest('user', ['bars', 'cooldowns']);
    let html = '';

    if (data._mocked) {
        html = '<p>Mocked Bars Data</p>';
    } else {
        const energy = data.energy;
        const nerve = data.nerve;
        const happy = data.happy;
        const life = data.life;

        html = `
            <div class="bar-stats">
              <div>Energy: ${energy ? energy.current + '/' + energy.maximum : 'N/A'}</div>
              <div>Nerve: ${nerve ? nerve.current + '/' + nerve.maximum : 'N/A'}</div>
              <div>Happy: ${happy ? happy.current + '/' + happy.maximum : 'N/A'}</div>
              <div>Life: ${life ? life.current + '/' + life.maximum : 'N/A'}</div>
            </div>
        `;
    }
    this.updateContent(html);
  }
}

// Ensure exports for tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TornWidget, EventsWidget, TravelWidget, BarsWidget };
}
