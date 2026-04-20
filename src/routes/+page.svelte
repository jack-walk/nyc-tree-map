<!--
@component
This is your page!
-->
<script>
  import ArticleHeader from '$lib/components/Article/ArticleHeader.svelte';
  import Map from '$lib/components/Maps/Map.svelte';

  let { data } = $props();
  const greatTrees = data.greatTrees;
  console.log(greatTrees);
</script>

<div class="container">
  <ArticleHeader
    headline="The Trees of New York"
    byline="NYCity News Service"
    pubDate="2026-04-20"
  />

  <Map
    longitude={-74.0}
    latitude={40.7}
    zoom={9.5}
    height={600}
    theme="positron"
    credit="OpenFreeMap / OpenStreetMap contributors"
  />
</div>