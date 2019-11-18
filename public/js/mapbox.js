export const displayMapbox = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1IjoicmFmYWVsbyIsImEiOiJjazMzdWN1emIwdHd6M2xwOWIzeTJwenB6In0.CZT_KRFl-_1_9AVESLQAnw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rafaelo/ck33uj6hs15nh1ct706l4jfw5',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
