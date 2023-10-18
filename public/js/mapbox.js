
// console.log(locations);
export const displayMap = function (locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYXJhdmluZDEyNDUiLCJhIjoiY2xjcHV4a292MXU4aDN2cnk5MTk5dTlzbiJ9.FF96jZewZZ3iaYaIs2ZG7w';
  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/aravind1245/clcpx5imp005y14let1zsnffl',
    scrollZoom:false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';

    //Adding Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //Adding Popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //Extend map bound to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
