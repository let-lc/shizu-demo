<script lang="ts">
  import { base } from '$app/paths';
  import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
  <title>Error</title>
</svelte:head>

<main class="grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8">
  <div class="text-center">
    <p class="font-mono text-9xl text-red-600">404</p>
    <h1 class="mt-4 text-4xl font-extrabold tracking-tight lg:text-5xl">Page not found</h1>
    <p class="mt-4">The page you are looking for does not exist.</p>
    <a href="{base}/">
      <Button variant="outline" class="mt-6">Go back home</Button>
    </a>
  </div>
</main>
