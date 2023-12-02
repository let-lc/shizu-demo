<script lang="ts">
  import { superValidateSync } from 'sveltekit-superforms/client';

  import * as Card from '$lib/components/ui/card';
  import * as Form from '$lib/components/ui/form';
  import { type TcpFormData, tcpFormSchema } from '$lib/types';
  import { cn } from '$lib/utils';

  import FieldAttempts from '../../../new/[serverType]/FieldAttempts.svelte';
  import FieldPingCron from '../../../new/[serverType]/FieldPingCron.svelte';
  import FieldValueFrom from '../../../new/[serverType]/FieldValueFrom.svelte';
  import ItemInput from '../../../new/[serverType]/ItemInput.svelte';

  export let data: TcpFormData;
  export let workflow: boolean;

  const form = superValidateSync(data, tcpFormSchema);
</script>

<Form.Root
  let:config
  {form}
  schema={tcpFormSchema}
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
  <div class="mb-4 space-y-2 border-y py-4">
    <Card.Root>
      <Card.Header>
        <Card.Title>Basic Server Configuration</Card.Title>
      </Card.Header>
      <Card.Content class="grid gap-x-4 py-2 xl:grid-cols-2">
        <Form.Field {config} name="name">
          <ItemInput label="Server Name" />
        </Form.Field>
        <Form.Field {config} name="pingCron">
          <FieldPingCron />
        </Form.Field>
        <Form.Field {config} name="pingAttempts">
          <FieldAttempts />
        </Form.Field>
        <Form.Field {config} name="maxRecordHistory">
          <Form.Item>
            <Form.Label>Max Record History (in seconds)</Form.Label>
            <Form.FormNumberInput />
            <Form.Validation />
          </Form.Item>
        </Form.Field>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header>
        <Card.Title>TCP Server Specific Configuration</Card.Title>
      </Card.Header>
      <Card.Content class="grid gap-x-4 py-2 xl:grid-cols-2">
        <div class="grid gap-x-2 sm:grid-cols-2">
          <Form.Field {config} name="host.from" let:attrs>
            {@const { value } = attrs.input}
            <FieldValueFrom valueName="Host" defaultValue={value} />
          </Form.Field>
          <Form.Field {config} name="host.value">
            <Form.Item>
              <Form.Label>Host Value</Form.Label>
              <Form.Input />
              <Form.Validation />
            </Form.Item>
          </Form.Field>
        </div>
        <div class="grid gap-x-2 sm:grid-cols-2">
          <Form.Field {config} name="port.from" let:attrs>
            {@const { value } = attrs.input}
            <FieldValueFrom valueName="Port" defaultValue={value} />
          </Form.Field>
          <Form.Field {config} name="port.value">
            <Form.Item>
              <Form.Label>Port Value</Form.Label>
              <Form.NumberInput min={0} max={65535} />
              <Form.Validation />
            </Form.Item>
          </Form.Field>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
  <div class="flex justify-between gap-2">
    <div class="flex gap-2">
      <Form.Button formaction="?/tcpUpdate">Update</Form.Button>
      <Form.Button formaction="?/delete" variant="destructive">Delete</Form.Button>
    </div>
    <Form.Button
      formaction="?/workflow"
      variant="outline"
      class={cn(
        workflow
          ? 'border-destructive hover:text-destructive'
          : 'border-green-500 hover:text-green-500',
        'hover:bg-transparent'
      )}
    >
      {workflow ? 'Deactivate' : 'Activate'} Workflow
    </Form.Button>
  </div>
</Form.Root>
