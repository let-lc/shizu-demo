<script lang="ts">
  import { IconDatabaseExclamation } from '@tabler/icons-svelte';
  import { toString } from 'cronstrue';
  import dayjs from 'dayjs';

  import { dev } from '$app/environment';
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as HoverCard from '$lib/components/ui/hover-card';
  import { SERVER_TYPE_COLOR } from '$lib/constants';
  import { cn, getStatusColor, getStatusLevel, ignoreSvelteTsError } from '$lib/utils';

  import type { PageServerData } from './$types';
  import HttpRecordDataTable from './HttpRecordDataTable.svelte';
  import ResponseTimeChart from './ResponseTimeChart.svelte';
  import TcpRecordDataTable from './TcpRecordDataTable.svelte';

  export let data: PageServerData;
  const revRecords = data.records.slice().reverse();
  const serverColor = SERVER_TYPE_COLOR?.[data.server.serverType];
</script>

<svelte:head>
  <title>{data.server.name || data.server.id}</title>
</svelte:head>

<div class="mb-2 flex justify-between border-b pb-2">
  <h2 class="scroll-m-20 text-3xl font-semibold tracking-tight">
    {data.server.name || data.server.id}
  </h2>
  {#if dev}
    <a href="{base}{$page.url.pathname}/edit">
      <Button variant="default">Edit</Button>
    </a>
  {/if}
</div>

<div class="space-y-4">
  <div class="my-4 flex gap-x-2">
    <Badge
      style="--server-color: {serverColor}"
      class={cn(
        data.server.serverType in SERVER_TYPE_COLOR &&
          'bg-[--server-color] hover:bg-[--server-color] hover:brightness-95 dark:hover:brightness-110'
      )}
    >
      {data.server.serverType.toUpperCase()}
    </Badge>
    <Badge variant="secondary">
      ID: {data.server.id}
    </Badge>
  </div>

  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between">
      <Card.Title>Status</Card.Title>
      <div class="flex items-center gap-x-1.5">
        <span class="text-xs">Latest status: </span>
        {#if revRecords.length > 0}
          {@const percent =
            revRecords[0].events.reduce((count, { success }) => count + +success, 0) /
            revRecords[0].events.length}
          {@const status = getStatusLevel(percent)}
          {@const statusColor = getStatusColor(percent)}
          <Badge
            variant="outline"
            style="--status-color: {statusColor}; --status-bg-color: {statusColor}40"
            class="border-[--status-bg-color] text-[--status-color] hover:border-[--status-bg-color]"
          >
            {status}
          </Badge>
        {:else}
          <Badge variant="outline">NOT FOUND</Badge>
        {/if}
      </div>
    </Card.Header>
    <Card.Content>
      <div class="flex h-8 flex-row-reverse flex-wrap justify-end gap-0.5 overflow-hidden">
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each { length: 128 } as _, i}
          {#if i < revRecords.length}
            {@const { events, ranAt, time } = revRecords[i]}
            {@const successCount = events.reduce((count, { success }) => count + +success, 0)}
            {@const failCount = events.length - successCount}
            {@const percent = successCount / events.length}
            {@const statusColor = getStatusColor(percent)}
            <HoverCard.Root openDelay={0} closeDelay={0} positioning={{ placement: 'top' }}>
              <HoverCard.Trigger>
                <div
                  style="--status-color: {statusColor}"
                  class="aspect-square h-8 w-2 rounded-xl bg-[--status-color]"
                />
              </HoverCard.Trigger>
              <HoverCard.Content class="w-max" style="--status-color: {statusColor}">
                <p class="whitespace-nowrap text-center text-xs">
                  {dayjs(ranAt).format('YYYY-MM-DD HH:mm:ss')}
                </p>
                <div class="flex items-center justify-between gap-1 rounded font-mono text-xs">
                  <span class="font-medium text-green-500">
                    {successCount}
                  </span>
                  <div class="relative flex h-0.5 flex-grow gap-0.5">
                    <div
                      style="--percent:{percent * 100}%"
                      class="h-full w-[--percent] flex-shrink-0 rounded bg-green-500"
                    />
                    <div class="h-full w-full flex-grow rounded bg-red-500" />
                  </div>
                  <span class="font-medium text-red-500">
                    {failCount}
                  </span>
                </div>
                <p class="text-center text-xs font-medium text-[--status-color]">
                  {getStatusLevel(percent)}
                </p>
                <div class="grid grid-cols-3 divide-x text-xs">
                  <div class="px-4 py-2 text-center">
                    <p class="font-semibold">Min</p>
                    <p>{time.min} ms</p>
                  </div>
                  <td class="px-4 py-2 text-center">
                    <p class="font-semibold">Avg</p>
                    <p>{time.avg} ms</p>
                  </td>
                  <td class="px-4 py-2 text-center">
                    <p class="font-semibold">Max</p>
                    <p>{time.max} ms</p>
                  </td>
                </div>
              </HoverCard.Content>
            </HoverCard.Root>
          {:else}
            <div class="aspect-square h-8 w-2 rounded-xl bg-muted" />
          {/if}
        {/each}
      </div>
    </Card.Content>
    <Card.Footer class="flex items-center justify-between">
      <span class="text-sm">Check {toString(data.server.pingCron, { verbose: true })}</span>
      {#if revRecords.length > 0}
        <span class="text-xs">
          Latest run: <i>{dayjs(revRecords[0].ranAt).format('YYYY-MM-DD HH:mm:ss')}</i>
        </span>
      {/if}
    </Card.Footer>
  </Card.Root>

  {#if data.records.length}
    <ResponseTimeChart data={data.records} />
  {/if}

  <Card.Root>
    <Card.Header>
      <Card.Title>Ping Record Table</Card.Title>
      <Card.Description>
        All historical records, click <span class="rounded-sm bg-accent px-2">Show</span> to view all
        the ping events from each record.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      {#if data.records.length > 0}
        {#if data.server.serverType === 'http'}
          <HttpRecordDataTable records={ignoreSvelteTsError(revRecords)} />
        {:else if data.server.serverType === 'tcp'}
          <TcpRecordDataTable records={ignoreSvelteTsError(revRecords)} />
        {/if}
      {:else}
        <p class="flex items-center justify-center gap-2 rounded-md border py-4">
          <IconDatabaseExclamation class="h-5 w-5 text-amber-500" />
          <span class="text-sm font-semibold">No record</span>
        </p>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
