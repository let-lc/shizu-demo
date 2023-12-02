<script lang="ts">
  import * as Form from '$lib/components/ui/form';
  import { VALUE_FROM } from '$lib/constants';

  export let valueName: string;
  export let defaultValue: string | undefined = undefined;
</script>

<Form.Item>
  <Form.Label>Read {valueName} Value From</Form.Label>
  <Form.Select
    selected={{
      value: defaultValue,
      label: VALUE_FROM.find(({ value }) => value === defaultValue)?.label || undefined,
    }}
  >
    <Form.SelectTrigger placeholder="Read value from..." />
    <Form.SelectContent>
      {#each VALUE_FROM as { value, label }}
        <Form.SelectItem {value}>
          {label}
        </Form.SelectItem>
      {/each}
    </Form.SelectContent>
  </Form.Select>
  <Form.Validation />
</Form.Item>
