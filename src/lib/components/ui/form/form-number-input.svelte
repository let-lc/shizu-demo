<script lang="ts">
  import { getFormField } from 'formsnap';
  import type { HTMLInputAttributes } from 'svelte/elements';

  import { type InputEvents, NumberInput } from '$lib/components/ui/input';

  type $$Props = HTMLInputAttributes;
  type $$Events = InputEvents;

  const { attrStore, value } = getFormField();
</script>

<NumberInput
  {...$attrStore}
  bind:value={$value}
  {...$$restProps}
  on:blur
  on:change
  on:click
  on:focus
  on:keydown
  on:keypress
  on:keyup
  on:mouseover
  on:mouseenter
  on:mouseleave
  on:paste
  on:input
/>
