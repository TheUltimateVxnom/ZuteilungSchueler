import React from "react";

export default function Maintenance() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      fontFamily: "sans-serif",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1>🚧 Wartungsarbeiten 🚧</h1>
      <p>Unsere Website ist gerade nicht erreichbar. Bitte versuche es später erneut.</p>
    </div>
  );
}
