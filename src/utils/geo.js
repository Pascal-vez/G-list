export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function getGoogleMapsUrl(lat, lng, label) {
  const query = encodeURIComponent(label || `${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${query}`;
}

export function getGoogleMapsEmbedUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}&hl=fr&z=15&output=embed`;
}

export function getGoogleMapsDirectionsUrl(destLat, destLng, originLat, originLng) {
  if (originLat != null && originLng != null) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
}

export function sortByDistance(pros, userLat, userLng) {
  return [...pros]
    .map((pro) => ({
      ...pro,
      distance: haversineDistance(userLat, userLng, pro.lat, pro.lng),
    }))
    .sort((a, b) => a.distance - b.distance);
}
