
/**
 * Synthesis Core Orchestrator
 * Inter-Module Communication Protocol
 */

export const SynthesisOrchestrator = {
  dispatch: (eventName, data) => {
    console.log(`[ORCHESTRATOR] Dispatching: ${eventName}`, data);
    const event = new CustomEvent(`synthesis:${eventName}`, { detail: data });
    window.dispatchEvent(event);
    
    // Log to matrix
    const logEl = document.getElementById('event-log');
    if (logEl) {
      const entry = document.createElement('div');
      entry.textContent = `[${new Date().toLocaleTimeString()}] ${eventName}`;
      logEl.prepend(entry);
    }
  },

  listen: (eventName, callback) => {
    window.addEventListener(`synthesis:${eventName}`, (e) => callback(e.detail));
  }
};

window.SynthesisOrchestrator = SynthesisOrchestrator;
