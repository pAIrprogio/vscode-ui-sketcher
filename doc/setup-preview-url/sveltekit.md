# Sveltkit Preview URL Setup

## Notes

- It's recommended to add the route under `src/routes/(preview)/preview`
- It allows overriding the app's layout with a barebone `+layout.svelte` file

## Code

File path: `src/routes/(preview)/preview/+page.svelte`

```svelte
<script lang="ts">
  import { page } from '$app/stores';

  $: componentPath = '../../../../' + $page.url.searchParams.get('filePath');
  $: componentPromise = componentPath
    ? import(/* @vite-ignore */ componentPath).then((data) => data.default)
    : null;
</script>

{#await componentPromise}
  <h1>Loading...</h1>
{:then Component}
  <svelte:component this={Component} />
{:catch error}
  <h1>Error loading component</h1>
  <pre>{error.message}</pre>
{/await}
```
