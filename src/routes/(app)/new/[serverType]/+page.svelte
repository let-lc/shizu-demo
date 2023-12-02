<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import * as Select from '$lib/components/ui/select';
  import { SERVER_TYPES } from '$lib/constants';

  import type { PageServerData } from './$types';
  import FormHttp from './FormHttp.svelte';
  import FormTcp from './FormTcp.svelte';

  export let data: PageServerData;

  let selected = {
    value: $page.params.serverType,
    label: $page.params.serverType.toUpperCase(),
  };
</script>

<h2 class="mb-2 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">New Server</h2>

<Select.Root
  bind:selected
  onSelectedChange={(event) => {
    goto(`/new/${event?.value}`);
  }}
>
  <Select.Label>Server Type</Select.Label>
  <Select.Trigger class="w-48" value={$page.params.serverType}>
    <Select.Value placeholder="Select a Server Type" />
  </Select.Trigger>
  <Select.Content>
    {#each SERVER_TYPES as serverType}
      <Select.Item value={serverType}>{serverType.toUpperCase()}</Select.Item>
    {/each}
  </Select.Content>
</Select.Root>

<div class="py-4">
  {#if $page.params.serverType === 'http'}
    <FormHttp form={data.form} />
  {:else if $page.params.serverType === 'tcp'}
    <FormTcp form={data.form} />
  {/if}
</div>
