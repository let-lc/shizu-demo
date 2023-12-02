<script lang="ts">
  import ItemInput from './ItemInput.svelte';
</script>

<ItemInput label="Server ID">
  <p slot="tooltips" class="max-w-xs">
    This is a unique ID for each server config. Default value is a random generated nanoid, you can
    modify it if you want.
  </p>
</ItemInput>
