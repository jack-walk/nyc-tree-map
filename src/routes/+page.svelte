<script>
  import ArticleHeader from '$lib/components/Article/ArticleHeader.svelte';
  import Map from '$lib/components/Maps/Map.svelte';
  import MapLayer from '$lib/components/Maps/MapLayer.svelte';
  import Geocoder from '$lib/components/Maps/Geocoder.svelte';

  let { data } = $props();
  const greatTrees = data.greatTrees;
  const planetrees = data.planetrees;

  let longitude = $state(-74.0);
  let latitude = $state(40.7);
  let zoom = $state(9.5);
</script>

<div class="container">
  <ArticleHeader
    headline="The Great Trees of New York"
    byline="NYCity News Service"
    pubDate="2026-04-20"
  />

  <p>
    In 1985, the New York City Parks Department began an ambitious new venture.
    They called it the Great Tree Search.
  </p>

  <p>
    The agency called on the public to nominate "trees of unusual size, species,
    form or historical association." Explore them here and see if you can find any near you.
  </p>

  <Geocoder
    label="Find your neighborhood"
    placeholder="Enter an address in New York…"
    onresult={(result) => {
      longitude = result.lng;
      latitude = result.lat;
      zoom = 15;
    }}
  />

  <Map
    {longitude}
    {latitude}
    {zoom}
    height={600}
    theme="positron"
    credit="OpenFreeMap / OpenStreetMap contributors"
  >
    <MapLayer
      id="nta-fill"
      type="fill"
      data={planetrees}
      paint={{
        'fill-color': [
          'step',
          ['get', 'total_planetree'],
          '#eef2f9',
          147,
          '#c2cfe6',
          269,
          '#8098cc',
          434,
          '#3366b3',
          697,
          '#0033a1',
        ],
        'fill-opacity': 0.7,
      }}
    />
    <MapLayer
      id="nta-outline"
      type="line"
      data={planetrees}
      paint={{
        'line-color': '#0033a1',
        'line-width': 0.5,
      }}
    />
  </Map>
</div>