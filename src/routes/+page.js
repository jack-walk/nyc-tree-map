// Page settings
// These values are passed to the layout to control what appears on the page.
import greatTrees from '$lib/data/great-trees.json';

export function load() {
  return {
    showHeader: true,
    showFooter: true,
    greatTrees,
  };
}