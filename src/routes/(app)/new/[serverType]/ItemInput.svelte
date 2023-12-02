<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import * as Tooltip from '$lib/components/ui/tooltip';

  export let label: string;
  export let type: 'number' | 'text' = 'text';
</script>

<Form.Item>
  {#if $$slots.tooltips}
    <div class="inline-flex w-full items-center gap-x-1">
      <Form.Label>{label}</Form.Label>
      <Tooltip.Root openDelay={0}>
        <Tooltip.Trigger>
          <span class="text-md float-right font-medium">ⓘ</span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <slot name="tooltips" />
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  {:else}
    <Form.Label>{label}</Form.Label>
  {/if}
  <svelte:component this={type === 'text' ? Form.Input : Form.NumberInput} />
  <Form.Validation />
</Form.Item>
