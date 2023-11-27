# Sveltkit Preview URL Setup

## Notes

- It's recommended to add the route under `src/routes/(preview)/preview`
- It allows overriding the app's layout with a barebone `+layout.svelte` file

## Code

File path: `src/routes/(preview)/preview/+page.svelte`

```svelte
<script context="module" lang="ts">
  declare const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  $: componentPath = '../../../../' + $page.url.searchParams.get('filePath');
  $: componentPromise = componentPath
    ? import(/* @vite-ignore */ componentPath).then((data) => data.default)
    : null;

  onMount(() => {
    console.debug('Listening for screenshot requests');
    window.addEventListener(
      'message',
      function (event) {
        if (event.data.action === 'take-screenshot' && event.data.shapeid) {
          html2canvas(document.body, {
            useCors: true,
            foreignObjectRendering: true,
            allowTaint: true,
          })
            .then(function (canvas) {
              const data = canvas.toDataURL('image/png');
              // console.debug('Sending screenshot to parent', data);
              window.parent.postMessage({ screenshot: data, shapeid: event.data.shapeid }, '*');
            })
            .catch((e) => {
              console.error(e);
            });
        }
      },
      false,
    );

    // and prevent the user from pinch-zooming into the iframe
    document.body.addEventListener(
      'wheel',
      (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
      },
      { passive: false },
    );
  });
</script>

<svelte:head>
  <script
    src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
  ></script>
</svelte:head>

{#await componentPromise}
  <h1>Loading...</h1>
{:then Component}
  <svelte:component this={Component} />
{:catch error}
  <h1>Error loading component</h1>
  <pre>{error.message}</pre>
{/await}

```
