const { performance } = require('perf_hooks');

const holidaysData = [
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
    { date: "2026-12-31", name: "Bank Holiday" }
];

function renderCalendarBaseline(displayedYear, displayedMonth) {
    const actualToday = new Date(), viewDate = new Date(displayedYear, displayedMonth, 1);
    let html = '<div class="calendar-grid">';
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => html += `<div class="calendar-header">${d}</div>`);
    for (let i = 0; i < viewDate.getDay(); i++) html += `<div class="calendar-day calendar-empty"></div>`;

    // Core logic loop
    for (let i = 1; i <= new Date(displayedYear, displayedMonth + 1, 0).getDate(); i++) {
        const dateStr = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        let isToday = (actualToday.getDate() === i && actualToday.getMonth() === displayedMonth && actualToday.getFullYear() === displayedYear) ? 'calendar-today' : '';
        const hObj = holidaysData.find(h => h.date === dateStr);
        html += `<div class="calendar-day ${isToday} ${hObj ? 'calendar-holiday' : ''}" ${hObj ? `title="${hObj.name}"` : ''}>${i}</div>`;
    }

    html += '</div>';
    return html;
}

function renderCalendarOptimized(displayedYear, displayedMonth) {
    const actualToday = new Date(), viewDate = new Date(displayedYear, displayedMonth, 1);
    let html = '<div class="calendar-grid">';
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => html += `<div class="calendar-header">${d}</div>`);
    for (let i = 0; i < viewDate.getDay(); i++) html += `<div class="calendar-day calendar-empty"></div>`;

    const holidaysMap = new Map();
    if (holidaysData && holidaysData.length > 0) {
        holidaysData.forEach(h => holidaysMap.set(h.date, h));
    }

    // Core logic loop
    for (let i = 1; i <= new Date(displayedYear, displayedMonth + 1, 0).getDate(); i++) {
        const dateStr = `${displayedYear}-${String(displayedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        let isToday = (actualToday.getDate() === i && actualToday.getMonth() === displayedMonth && actualToday.getFullYear() === displayedYear) ? 'calendar-today' : '';
        const hObj = holidaysMap.get(dateStr);
        html += `<div class="calendar-day ${isToday} ${hObj ? 'calendar-holiday' : ''}" ${hObj ? `title="${hObj.name}"` : ''}>${i}</div>`;
    }

    html += '</div>';
    return html;
}

function runBenchmark() {
    const ITERATIONS = 10000;

    const startBaseline = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        renderCalendarBaseline(2026, 2);
    }
    const endBaseline = performance.now();
    const baselineMs = endBaseline - startBaseline;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        renderCalendarOptimized(2026, 2);
    }
    const endOptimized = performance.now();
    const optimizedMs = endOptimized - startOptimized;

    console.log(`Baseline execution time for ${ITERATIONS} iterations: ${baselineMs.toFixed(2)} ms`);
    console.log(`Optimized execution time for ${ITERATIONS} iterations: ${optimizedMs.toFixed(2)} ms`);

    const improvement = ((baselineMs - optimizedMs) / baselineMs) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}% faster`);
}

runBenchmark();
