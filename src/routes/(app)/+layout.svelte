<script lang="ts">
  import { IconMoon, IconPlus, IconSettings, IconSun } from '@tabler/icons-svelte';
  import { resetMode, setMode, userPrefersMode } from 'mode-watcher';

  import { dev } from '$app/environment';
  import { base } from '$app/paths';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { cn } from '$lib/utils';
</script>

<header
  class="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="container flex h-14 items-center justify-between">
    <a href="{base}/" class="mr-6 flex items-center space-x-2">
      <img
        class="h-6 w-6 [content:url(/img/logo-dark.png)] dark:[content:url(/img/logo-light.png)]"
        alt="Shizu Logo"
      />
      <span class="hidden text-[15px] font-bold sm:inline-block lg:text-base">Shizu</span>
    </a>

    <div class="space-x-1">
      {#if dev}
        <a href="{base}/new">
          <Button variant="outline" class="w-9 px-0">
            <IconPlus class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            <span class="sr-only">Add new site</span>
          </Button>
        </a>
        <a href="{base}/settings">
          <Button variant="outline" class="w-9 px-0">
            <IconSettings class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
            <span class="sr-only">Add new site</span>
          </Button>
        </a>
      {/if}
      <DropdownMenu.Root positioning={{ placement: 'bottom-end' }}>
        <DropdownMenu.Trigger asChild let:builder>
          <Button builders={[builder]} variant="ghost" class="w-9 px-0">
            <IconSun
              class="dark:-roate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0"
            />
            <IconMoon
              class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span class="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            class={cn($userPrefersMode === 'light' && 'bg-accent')}
            on:click={() => setMode('light')}>Light</DropdownMenu.Item
          >
          <DropdownMenu.Item
            class={cn($userPrefersMode === 'dark' && 'bg-accent')}
            on:click={() => setMode('dark')}>Dark</DropdownMenu.Item
          >
          <DropdownMenu.Item
            class={cn($userPrefersMode === 'system' && 'bg-accent')}
            on:click={() => resetMode()}>System</DropdownMenu.Item
          >
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>
</header>

<div class="container mx-auto py-4">
  <slot />
</div>
