<script lang="ts">
  import ItemInput from './ItemInput.svelte';
</script>

<ItemInput label="Attempts" type="number">
  <p slot="tooltips" class="max-w-xs">Number of attempts for each ping event.</p>
</ItemInput>
