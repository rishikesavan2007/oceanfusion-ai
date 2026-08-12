import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function IncidentMap() {
  return (
    <MapContainer
      center={[13.0827, 80.2707]}
      zoom={6}
      style={{
        height: "500px",
        width: "100%",
        borderRadius: "16px"
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
    </MapContainer>
  );
}