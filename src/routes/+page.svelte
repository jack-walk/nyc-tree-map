<script>
  import ArticleHeader from '$lib/components/Article/ArticleHeader.svelte';
  import Map from '$lib/components/Maps/Map.svelte';
  import MapLayer from '$lib/components/Maps/MapLayer.svelte';

  let { data } = $props();
  const greatTrees = data.greatTrees;
  console.log(greatTrees);
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

  <Map
    longitude={-74.0}
    latitude={40.7}
    zoom={9.5}
    height={600}
    theme="positron"
    credit="OpenFreeMap / OpenStreetMap contributors"
  >
    <MapLayer
      id="great-trees"
      type="circle"
      data={greatTrees}
      paint={{
        'circle-color': '#0033a1',
        'circle-radius': 5,
        'circle-stroke-color': '#1a1a1a',
        'circle-stroke-width': 1,
        'circle-opacity': 0.9,
      }}
    />
  </Map>
</div>