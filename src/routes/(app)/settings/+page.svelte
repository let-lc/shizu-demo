<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import { configFormSchema } from '$lib/types';
  import { cn } from '$lib/utils';

  import ItemInput from '../new/[serverType]/ItemInput.svelte';
  import type { PageServerData } from './$types';

  export let data: PageServerData;
</script>

<svelte:head>
  <title>Settings</title>
</svelte:head>

<h2 class="mb-2 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Settings</h2>

<Form.Root
  let:config
  form={data.form}
  schema={configFormSchema}
  method="POST"
  options={{
    dataType: 'json',
    onSubmit: ({ action, cancel }) => {
      if (action.search === '?/delete') {
        if (!confirm('Please confirm to delete!')) {
          cancel();
        }
      }
    },
  }}
>
  <Form.Field {config} name="buildCron">
    <ItemInput label="Build Cron" />
  </Form.Field>
  <Form.Field {config} name="basePath">
    <ItemInput label="Base Path" />
  </Form.Field>
  <div class="mt-4 flex gap-2 border-t pt-4">
    <Form.Button formaction="?/update">Update</Form.Button>
    <Form.Button
      formaction="?/workflow"
      variant="outline"
      class={cn(
        data.workflow
          ? 'border-destructive hover:text-destructive'
          : 'border-green-500 hover:text-green-500',
        'hover:bg-transparent'
      )}
    >
      {data.workflow ? 'Deactivate' : 'Activate'} Workflow
    </Form.Button>
  </div>
</Form.Root>
