<script lang="ts">
  import { IconChevronLeft } from '@tabler/icons-svelte';

  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';

  import type { PageServerData } from './$types';
  import FormHttp from './FormHttp.svelte';
  import FormTcp from './FormTcp.svelte';

  export let data: PageServerData;
</script>

<svelte:head>
  <title>{data.server.name}</title>
</svelte:head>

<Card.Root>
  <Card.Header>
    <Card.Title class="flex items-center gap-x-2">
      <a href="{base}/server/{$page.params.id}">
        <Button variant="ghost" size="sm">
          <IconChevronLeft />
        </Button>
      </a>
      <Badge>{data.server.serverType.toUpperCase()}</Badge>
      <span>ID: {data.server.id}</span>
    </Card.Title>
  </Card.Header>
  <Card.Content>
    {#if data.server.serverType === 'http'}
      <FormHttp data={data.server} workflow={data.workflow} />
    {:else if data.server.serverType === 'tcp'}
      <FormTcp data={data.server} workflow={data.workflow} />
    {/if}
  </Card.Content>
</Card.Root>
