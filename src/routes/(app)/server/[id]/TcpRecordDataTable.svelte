<script lang="ts">
  import { IconChevronDown } from '@tabler/icons-svelte';
  import dayjs from 'dayjs';
  import { slide } from 'svelte/transition';

  import * as Collapsible from '$lib/components/ui/collapsible';
  import * as Table from '$lib/components/ui/table';
  import type { TcpPingRecordType } from '$lib/types';
  import { cn } from '$lib/utils';

  import EventChart from './EventChart.svelte';

  export let records: Array<TcpPingRecordType>;
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Date</Table.Head>
      <Table.Head class="text-center">Min Response Time</Table.Head>
      <Table.Head class="text-center">Max Response Time</Table.Head>
      <Table.Head class="text-center">Avg Response Time</Table.Head>
      <Table.Head class="text-center">Events</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each records as item}
      <Collapsible.Root asChild let:builder>
        {@const open = builder['data-state'] === 'open'}
        <Table.Row>
          <Table.Cell>{dayjs(item.ranAt).format('YYYY-MM-DD HH:mm:ss')}</Table.Cell>
          <Table.Cell class="text-center">
            <span class="text-blue-500">{item.time.min}</span>
            <i>ms</i>
          </Table.Cell>
          <Table.Cell class="text-center">
            <span class="text-blue-500">{item.time.max}</span>
            <i>ms</i>
          </Table.Cell>
          <Table.Cell class="text-center">
            <span class="text-blue-500">{item.time.avg}</span>
            <i>ms</i>
          </Table.Cell>
          <Table.Cell class="flex w-full justify-center">
            <Collapsible.Trigger class="flex items-center gap-x-1">
              <span>{open ? 'Hide' : 'Show'}</span>
              <IconChevronDown class={cn('h-4 w-4', open ? 'rotate-180' : 'rotate-0')} />
            </Collapsible.Trigger>
          </Table.Cell>
        </Table.Row>
        <Collapsible.Content asChild>
          <Table.Row>
            <Table.Cell colspan={6}>
              <div transition:slide>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="text-center">Index</Table.Head>
                      <Table.Head class="text-center">Success</Table.Head>
                      <Table.Head class="text-center">Time</Table.Head>
                      <Table.Head class="text-center">Error</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each item.events as event, idx}
                      <Table.Row>
                        <Table.Cell class="text-center">{idx + 1}</Table.Cell>
                        <Table.Cell class="text-center">{event.success ? 'Yes' : 'No'}</Table.Cell>
                        <Table.Cell class="text-center">
                          {#if event.success}
                            <span class="text-green-500">{event.time}</span>
                            <i>ms</i>
                          {:else}
                            -
                          {/if}
                        </Table.Cell>
                        <Table.Cell class="whitespace-pre text-center">
                          {#if event.success}
                            -
                          {:else}
                            <span class="text-red-500">
                              {event.error.name}<br />{event.error.message}
                            </span>
                          {/if}
                        </Table.Cell>
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
                <EventChart data={item.events} />
              </div>
            </Table.Cell>
          </Table.Row>
        </Collapsible.Content>
      </Collapsible.Root>
    {/each}
  </Table.Body>
</Table.Root>
