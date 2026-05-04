const fs = require('fs');

let content = fs.readFileSync('Personal-Dashboard--main/app.js', 'utf8');

const originalFunc = `function runAccessibilityConsistencyPass() {
  document.querySelectorAll(".drag-handle").forEach((handle) => {
    handle.setAttribute("role", "button");
    handle.setAttribute("tabindex", "0");
    if (!handle.getAttribute("aria-label")) {
      const heading =
        handle
          .closest(".card")
          ?.querySelector(".card-header h2")
          ?.textContent?.trim() || "card";
      handle.setAttribute("aria-label", \`Drag \${heading}\`);
    }
  });

  document.querySelectorAll("button, .icon-btn, .action-btn").forEach((el) => {
    if (!el.getAttribute("aria-label")) {
      const text = el.textContent?.trim();
      const title = el.getAttribute("title");
      if (title) el.setAttribute("aria-label", title);
      else if (text) el.setAttribute("aria-label", text);
    }
  });
}`;

const replacementFunc = `function updateDragHandleAccessibility() {
  document.querySelectorAll(".drag-handle").forEach((handle) => {
    handle.setAttribute("role", "button");
    handle.setAttribute("tabindex", "0");
    if (!handle.getAttribute("aria-label")) {
      const heading =
        handle
          .closest(".card")
          ?.querySelector(".card-header h2")
          ?.textContent?.trim() || "card";
      handle.setAttribute("aria-label", \`Drag \${heading}\`);
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
}`;

if (content.includes(originalFunc)) {
    content = content.replace(originalFunc, replacementFunc);
    fs.writeFileSync('Personal-Dashboard--main/app.js', content);
    console.log("Patched successfully!");
} else {
    console.log("Could not find the function to patch. Doing alternative patch.");
}
