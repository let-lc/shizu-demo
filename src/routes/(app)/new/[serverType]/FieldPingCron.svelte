<script lang="ts">
  import ItemInput from './ItemInput.svelte';
</script>

<ItemInput label="Cron">
  <p slot="tooltips" class="max-w-xs">
    POSIX cron expression for scheduling the ping event. Check
    <a
      href="https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule"
      rel="noopener noreferrer external"
      class="underline"
    >
      GitHub Docs
    </a>
    for more information.
  </p>
</ItemInput>
