# Torn Tracker Module Expansion: Architectural Report

## 1. 💡 Invent the Features (Contextual to Torn & API Capabilities)

Assuming full API access, here are advanced, data-driven features we can implement to dramatically improve usability and real-time awareness for a power user:

*   **Live Event & Action Streams:** Real-time polling of the `events` or `messages` endpoints to display a scrolling, customizable newsfeed of attacks received, faction updates, or trades, complete with native browser notification triggers.
*   **Chain Watcher & Attack Logs:** A specialized view utilizing the `battlestats` and `faction` endpoints (if applicable) to monitor active chains. It can include visual indicators for "chain timeout" warnings, recent targets, and personal contribution metrics.
*   **Inventory & Bazaar Management:** An advanced inventory view tracking high-value items or specific categories (e.g., medical, drugs). Integration with the bazaar endpoint to monitor listed item statuses and total held value.
*   **Travel & Trading Optimizations:** A dedicated "Travel Hub" using the `travel` endpoint. It would not only show current travel status but predict landing times accurately, track current overseas item stocks (via public APIs if available, or estimated), and suggest profitable routes based on user capacity.
*   **Stat Progression Tracking:** Historical charting of battle stats and work stats over time by locally caching data on each sync, providing a visual growth curve that the default Torn UI lacks.
*   **Custom Goal Tracking:** Allow users to set specific targets (e.g., "Reach 1B Networth", "Achieve 50k Nerve"), combining multiple API data points to display a progress bar.

## 2. 🏗️ Architectural Options (The Layout Engine)

### Option A: Native Integration (Expanding existing UI)

Expanding the current Torn module to render the new API data using our existing UI components and state management.

**Pros:**
*   **Seamless UX:** Matches the look, feel, and theme (dark mode, glassmorphism) of the existing dashboard perfectly.
*   **Data Control & Mashups:** We can combine Torn data with other dashboard features (e.g., a unified notification center).
*   **Performance:** Lightweight JSON payloads via fetch are faster and less resource-intensive than rendering a full web page.
*   **Offline/Cached Capabilities:** We can store recent data in `localStorage` for immediate rendering upon load, before the next API sync.

**Cons:**
*   **Development Overhead:** Requires building and maintaining custom UI for every single feature (inventory lists, event feeds, charts).
*   **API Rate Limits:** Heavy, frequent polling across multiple endpoints (events, inventory, faction) can quickly exhaust the user's API key limits if not carefully managed.
*   **Maintenance:** Changes to Torn's API structure require code updates to our dashboard.

### Option B: The Embedded View (Iframe/Web View)

Creating a dedicated module that loads specific Torn mobile pages (e.g., `https://www.torn.com/index.php`) via an embedded iframe.

**Pros:**
*   **Zero Feature Development:** We instantly get full access to Torn's native features (bazaar, inventory, attacks) without writing UI code.
*   **Always Up-to-Date:** Any changes Torn makes to their UI or features are immediately reflected.
*   **No API Limit Issues:** Relies on the user's session cookie within the iframe, bypassing API key rate limits for UI interactions.

**Cons:**
*   **CORS & X-Frame-Options Constraints:** **Major Blockers.** Torn.com likely employs `X-Frame-Options: SAMEORIGIN` or restrictive CSP headers to prevent clickjacking. Loading Torn in an iframe on a local dashboard (`file://` or custom host) will almost certainly be blocked by modern browsers.
*   **Layout & Responsive Issues:** Forcing a complex site into a small dashboard widget often results in scrollbars, broken layouts, and a poor mobile experience.
*   **Session Management:** The user must be actively logged into Torn in the browser; the dashboard cannot manage the authentication state inside the iframe.
*   **Visual Inconsistency:** The Torn UI will clash heavily with the dashboard's design system.

### Recommendation: Option A (Native Integration)

Due to the near-certainty of iframe blocking (CORS/X-Frame-Options) and the desire for a cohesive, power-user experience, **Option A is the only viable and professional choice.** We should build dedicated, native UI components for the new data.

## 3. ⚙️ Technical & Customization Considerations

### Technical Roadblocks

*   **API Rate Limits:** Torn limits API requests (typically 100 per minute). Our architecture must implement a centralized "API Manager" that queues requests, prevents duplicate simultaneous calls, and gracefully handles HTTP 429 (Too Many Requests) errors.
*   **API Key Security:** Currently, the key is likely stored in `localStorage`. While standard for client-side apps, we must ensure it's never logged, transmitted elsewhere, and that the UI clearly indicates it's a client-side only operation.
*   **Data Caching Strategy:** To minimize API calls, we must implement a TTL (Time-to-Live) caching system in `localStorage`. For example, `profile` data might update every 5 minutes, while `events` update every 1 minute.

### Power-User Customization Opportunities

1.  **Granular Sync Polling Controls:** A settings slider allowing the user to dictate the sync frequency (e.g., "Aggressive" = 30s, "Standard" = 2m, "Eco" = 5m). This empowers users to manage their own API limits.
2.  **Custom Threshold Alerts:** UI toggles to trigger visual pulses or browser notifications based on specific criteria. E.g., "Alert me when Energy > 90%", "Alert me when Travel Arrival < 2 minutes", or "Alert me on Hospitalization".
3.  **Modular Widget View:** Allow the user to select which "blocks" of data are visible in the Torn module. A user might only want to see Cooldowns and Travel, hiding Work/Battle stats to save space.
