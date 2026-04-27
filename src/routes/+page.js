// Page settings
// These values are passed to the layout to control what appears on the page.
import foodScrapCsv from '$lib/data/Food_Scrap_Drop-Off_Locations_in_NYC_20260426.csv?raw';

/**
 * Split a CSV row on commas that are not inside double quotes.
 * This is sufficient for the DSNY export used in this project.
 * @param {string} row
 * @returns {string[]}
 */
function splitCsvRow(row) {
  return row
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((value) => value.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
}

/**
 * Convert the food scrap CSV into GeoJSON points.
 * @param {string} csvText
 * @returns {GeoJSON.FeatureCollection}
 */
function buildFoodScrapGeojson(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  const headers = splitCsvRow(lines[0]);
  const headerIndex = headers.reduce((accumulator, header, index) => {
    accumulator[header] = index;
    return accumulator;
  }, {});

  const features = lines
    .slice(1)
    .map((line) => splitCsvRow(line))
    .map((row) => {
      const latitude = Number.parseFloat(row[headerIndex.Latitude]);
      const longitude = Number.parseFloat(row[headerIndex.Longitude]);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        properties: {
          objectId: row[headerIndex['Object ID']],
          siteName: row[headerIndex.SiteName],
          siteAddr: row[headerIndex.SiteAddr],
          borough: row[headerIndex.Borough],
          hostedBy: row[headerIndex.Hosted_By],
          openMonth: row[headerIndex.Open_Month],
          dayHours: row[headerIndex.Day_Hours],
          notes: row[headerIndex.Notes],
          website: row[headerIndex.Website],
        },
      };
    })
    .filter(Boolean);

  return {
    type: 'FeatureCollection',
    features,
  };
}

const foodScrapDropoff = buildFoodScrapGeojson(foodScrapCsv);

export function load() {
  return {
    showHeader: true,
    showFooter: true,
    foodScrapDropoff,
  };
}