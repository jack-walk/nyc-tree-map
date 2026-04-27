<script>
  import ArticleHeader from '$lib/components/Article/ArticleHeader.svelte';
  import MethodologyBox from '$lib/components/Article/MethodologyBox.svelte';
  import Map from '$lib/components/Maps/Map.svelte';
  import MapLayer from '$lib/components/Maps/MapLayer.svelte';
  import Geocoder from '$lib/components/Maps/Geocoder.svelte';
  import Legend from '$lib/components/Maps/Legend.svelte';

  let { data } = $props();
  const foodScrapDropoff = $derived(
    data.foodScrapDropoff ?? { type: 'FeatureCollection', features: [] }
  );

  let longitude = $state(-74.0);
  let latitude = $state(40.7);
  let zoom = $state(9.5);
  let nearestDropoffId = $state(null);
  let hasSearchedAddress = $state(false);

  /**
   * Calculate great-circle distance between two points in meters.
   */
  function distanceInMeters(lat1, lng1, lat2, lng2) {
    const earthRadius = 6371000;
    const toRadians = (degrees) => (degrees * Math.PI) / 180;

    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lng2 - lng1);

    const a =
      Math.sin(deltaPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }

  function findNearestDropoffId(lat, lng, features) {
    let bestId = null;
    let smallestDistance = Number.POSITIVE_INFINITY;

    for (const feature of features) {
      if (!feature?.geometry?.coordinates) continue;
      const [siteLng, siteLat] = feature.geometry.coordinates;
      const distance = distanceInMeters(lat, lng, siteLat, siteLng);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        bestId = feature.properties.objectId;
      }
    }

    return bestId;
  }

  const dropoffPins = $derived.by(() => ({
    type: 'FeatureCollection',
    features: foodScrapDropoff.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        isNearest: feature.properties.objectId === nearestDropoffId,
      },
    })),
  }));

  const nearestDropoff = $derived.by(
    () =>
      dropoffPins.features.find(
        (feature) => feature.properties.objectId === nearestDropoffId
      ) ?? null
  );

  const searchedAddressPin = $derived.by(() => ({
    type: 'FeatureCollection',
    features: hasSearchedAddress
      ? [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            properties: {
              label: '🏠',
            },
          },
        ]
      : [],
  }));
</script>

<div class="container">
  <ArticleHeader
    headline="Where can I dispose of my food scraps in New York City?"
    byline="Jack Walker"
    pubDate="2026-04-26"
  />

  <p>
    New York City residents have been required to dispose of “leaf and yard waste, food waste, and food-soiled paper” separately from their standard trash since April 1, 2025, according to the <a href="https://www.nyc.gov/site/dsny/collection/residents/collection-laws-residents.page#plant-food-waste">New York City Department of Sanitation</a>.
  </p>

  <p>
    Residents can dispose of organic waste in city-issued compost bins, or by visiting food scrap drop-off sites located throughout the five boroughs.
  </p>

  <p>
    To help New Yorkers identify the nearest location for disposing their food waste, the <i>NYCity News Service</i> has charted out the city's food scrap drop-off sites, providing also their address and hours of operation. Type your address into the map and we will return the nearest drop-off location.
  </p>

  <Geocoder
    label="Find your address"
    placeholder="Enter an address in New York…"
    onresult={(result) => {
      longitude = result.lng;
      latitude = result.lat;
      zoom = 15;
      hasSearchedAddress = true;

      nearestDropoffId = findNearestDropoffId(
        result.lat,
        result.lng,
        foodScrapDropoff.features
      );
    }}
  />

  {#if nearestDropoff}
    <p>
      Nearest drop-off: <strong>{nearestDropoff.properties.siteName}</strong>
      {#if nearestDropoff.properties.siteAddr}
        ({nearestDropoff.properties.siteAddr})
      {/if}
    </p>
  {/if}

  <Map
    {longitude}
    {latitude}
    {zoom}
    height={600}
    theme="positron"
    credit="OpenFreeMap / OpenStreetMap contributors"
  >
    <MapLayer
      id="searched-address-pin"
      type="symbol"
      data={searchedAddressPin}
      paint={{
        'text-color': '#d62828',
      }}
      layout={{
        'text-field': ['get', 'label'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10,
          20,
          13,
          26,
          16,
          34,
        ],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      }}
    />

    <MapLayer
      id="food-scrap-dropoffs"
      type="circle"
      data={dropoffPins}
      paint={{
        'circle-radius': [
          'case',
          ['boolean', ['get', 'isNearest'], false],
          8,
          6,
        ],
        'circle-color': [
          'case',
          ['boolean', ['get', 'isNearest'], false],
          '#f6c90e',
          '#0b5ed7',
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.95,
      }}
      popup={(feature) => {
        const p = feature.properties;
        const url = p.website
          ? p.website.startsWith('http')
            ? p.website
            : `https://${p.website}`
          : '';

        return `
          <strong>${p.siteName || 'Food Scrap Drop-off'}</strong><br/>
          ${p.siteAddr ? `${p.siteAddr}<br/>` : ''}
          ${p.dayHours ? `<em>${p.dayHours}</em><br/>` : ''}
          ${p.borough ? `Borough: ${p.borough}<br/>` : ''}
          ${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">Website</a>` : ''}
        `;
      }}
    />
  </Map>

  <Legend
    title="Food scrap drop-off locations"
    mode="categorical"
    items={[
      {
        color: '#0b5ed7',
        label: 'Drop-off location',
      },
      {
        color: '#f6c90e',
        label: 'Your nearest dropoff site',
      },
      {
        icon: '🏠',
        label: 'Your address',
      },
    ]}
  />

  <MethodologyBox>
    <p>
      This data was collected by the New York City Department of Sanitation and
      obtained through the New York City OpenData portal.
      <a
        href="https://data.cityofnewyork.us/Environment/Food-Scrap-Drop-Off-Locations-in-NYC/if26-z6xq/about_data"
        target="_blank"
        rel="noopener noreferrer"
      >Access the data here.</a>
    </p>
  </MethodologyBox>

</div>