// maintenance.js

export function checkMaintenance() {
  const maintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  
  if (maintenance) {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;">
        <h1>🚧 Wartungsarbeiten 🚧</h1>
        <p>Unsere Website ist gerade nicht erreichbar. Bitte versuche es später erneut.</p>
      </div>
    `;
    // Stoppe weiteres JS
    throw new Error("Wartungsmodus aktiv");
  }
}
