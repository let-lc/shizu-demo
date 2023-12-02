<script lang="ts">
  import { Form as FormPrimitive } from 'formsnap';
  import type { HTMLAttributes } from 'svelte/elements';

  import { cn } from '$lib/utils';

  type $$Props = HTMLAttributes<HTMLParagraphElement>;
  let className: string | undefined | null = undefined;
  export { className as class };
</script>

<FormPrimitive.Validation
  class={cn('text-[0.8rem] font-medium text-destructive', className)}
  {...$$restProps}
/>
