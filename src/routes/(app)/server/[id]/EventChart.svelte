<script lang="ts">
  import Chart from 'chart.js/auto';
  import { onMount } from 'svelte';

  import type { HttpPingRecordType, TcpPingRecordType } from '$lib/types';

  export let data: HttpPingRecordType['events'] | TcpPingRecordType['events'];

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const context = canvas.getContext('2d');
    if (context) {
      const labels: Array<number> = [],
        values: Array<number> = [],
        backgroundColor: Array<string> = [],
        borderColor: Array<string> = [];

      for (const [idx, item] of data.entries()) {
        labels.push(idx + 1);

        if (item.success) {
          values.push(item.time);
          backgroundColor.push('#22c55e80');
          borderColor.push('#22c55e');
        } else {
          values.push(-10);
          backgroundColor.push('#dc262680');
          borderColor.push('#dc2626');
        }
      }

      new Chart(context, {
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return (context.raw as number) >= 0 ? context.formattedValue + ' ms' : 'Error';
                },
                title: () => '',
              },
            },
          },
          scales: {
            x: {
              title: {
                text: 'Event Index',
                display: true,
              },
            },
            y: {
              title: {
                text: 'Milliseconds (ms)',
                display: true,
              },
            },
          },
        },
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Events',
              data: values,
              backgroundColor,
              borderColor,
              borderWidth: 1,
            },
          ],
        },
      });
    }
  });
</script>

<div class="mt-2 rounded border p-2 pt-4 hover:bg-accent">
  <canvas bind:this={canvas} class="h-96 max-h-96 max-w-full" />
</div>
