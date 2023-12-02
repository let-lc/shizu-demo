<script lang="ts">
  import type { SuperValidated } from 'sveltekit-superforms';

  import { type HttpFormSchema, httpFormSchema } from '$lib/types';
  import * as Card from '$lib/components/ui/card';
  import * as Form from '$lib/components/ui/form';
  import { HTTP_METHODS } from '$lib/constants';

  import FieldAttempts from './FieldAttempts.svelte';
  import FieldPingCron from './FieldPingCron.svelte';
  import FieldServerId from './FieldServerId.svelte';
  import FieldValueFrom from './FieldValueFrom.svelte';
  import ItemInput from './ItemInput.svelte';

  export let form: SuperValidated<HttpFormSchema>;
</script>

<svelte:head>
  <title>New HTTP Server</title>
</svelte:head>

<Form.Root
  let:config
  {form}
  schema={httpFormSchema}
  method="POST"
  action="?/http"
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
        <Card.Title>HTTP Server Specific Configuration</Card.Title>
      </Card.Header>
      <Card.Content class="grid gap-x-4 py-2 xl:grid-cols-2">
        <div class="grid gap-x-2 sm:grid-cols-2">
          <Form.Field {config} name="url.from" let:attrs>
            {@const { value } = attrs.input}
            <FieldValueFrom valueName="URL" defaultValue={value} />
          </Form.Field>
          <Form.Field {config} name="url.value">
            <Form.Item>
              <Form.Label>URL Value</Form.Label>
              <Form.Input />
              <Form.Validation />
            </Form.Item>
          </Form.Field>
        </div>
        <div class="grid gap-x-2 sm:grid-cols-2">
          <Form.Field {config} name="body.from" let:attrs>
            {@const { value } = attrs.input}
            <FieldValueFrom valueName="Payload/Body" defaultValue={value} />
          </Form.Field>
          <Form.Field {config} name="body.value">
            <ItemInput label="Payload/Body Value"
              ><p slot="tooltips" class="max-w-xs">
                This can be text, JSON, HTML, or XML, etc. You must pre-format the value, including
                stringification and minification, because this field doesn't do any format
                validation.
              </p>
            </ItemInput>
          </Form.Field>
        </div>
        <Form.Field {config} name="method" let:attrs>
          {@const { value } = attrs.input}
          <Form.Item>
            <Form.Label>HTTP Method</Form.Label>
            <Form.Select selected={{ value, label: value }}>
              <Form.SelectTrigger placeholder="Select a Server Type" />
              <Form.SelectContent>
                {#each HTTP_METHODS as httpMethod}
                  <Form.SelectItem value={httpMethod}>{httpMethod}</Form.SelectItem>
                {/each}
              </Form.SelectContent>
            </Form.Select>
            <Form.Validation />
          </Form.Item>
        </Form.Field>
        <Form.Field {config} name="statusCodes">
          <ItemInput label="Accepted Status Codes">
            <p slot="tooltips" class="max-w-xs">
              Comma separated list, each item can be a number from 100-599, or a range
              representation like <code class="rounded-sm bg-background px-0.5 text-foreground"
                >200-299</code
              >.
            </p>
          </ItemInput>
        </Form.Field>
      </Card.Content>
    </Card.Root>
  </div>
  <Form.Button>Submit</Form.Button>
</Form.Root>
