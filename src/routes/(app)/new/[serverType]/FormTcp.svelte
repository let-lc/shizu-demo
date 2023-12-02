<script lang="ts">
  import type { SuperValidated } from 'sveltekit-superforms';

  import { type TcpFormSchema, tcpFormSchema } from '$lib/types';
  import * as Card from '$lib/components/ui/card';
  import * as Form from '$lib/components/ui/form';

  import FieldAttempts from './FieldAttempts.svelte';
  import FieldPingCron from './FieldPingCron.svelte';
  import FieldServerId from './FieldServerId.svelte';
  import FieldValueFrom from './FieldValueFrom.svelte';
  import ItemInput from './ItemInput.svelte';

  export let form: SuperValidated<TcpFormSchema>;
</script>

<svelte:head>
  <title>New TCP Server</title>
</svelte:head>

<Form.Root
  let:config
  {form}
  schema={tcpFormSchema}
  method="POST"
  action="?/tcp"
  options={{
    dataType: 'json',
  }}
>
  <div class="mb-4 space-y-2 border-y py-4">
    <Card.Root>
      <Card.Header>
        <Card.Title>Basic Server Configuration</Card.Title>
      </Card.Header>
      <Card.Content class="grid gap-x-4 py-2 xl:grid-cols-2">
        <Form.Field {config} name="id">
          <FieldServerId />
        </Form.Field>
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
  <Form.Button>Submit</Form.Button>
</Form.Root>
