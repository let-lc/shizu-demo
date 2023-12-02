<script lang="ts">
  import Chart from 'chart.js/auto';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';

  import * as Card from '$lib/components/ui/card';
  import type { HttpPingRecordType, TcpPingRecordType } from '$lib/types';

  export let data: Array<HttpPingRecordType | TcpPingRecordType> = [];

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const context = canvas.getContext('2d');
    if (context) {
      const labels = data.map((d) => dayjs(d.ranAt).format('YYYY-MM-DD HH:mm:ss'));
      const min = data.map((d) => d.time.min);
      const max = data.map((d) => d.time.max);
      const avg = data.map((d) => d.time.avg);
      new Chart(context, {
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
          },
          interaction: {
            intersect: false,
            mode: 'index',
          },
          scales: {
            x: {
              title: {
                text: 'Time',
                display: true,
              },
              ticks: {
                callback: function (_, idx) {
                  return idx === 0 || idx === labels.length - 1
                    ? this.getLabelForValue(idx).split(' ')
                    : '';
                },
                maxRotation: 0,
                align: 'inner',
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
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Maximum',
              backgroundColor: '#f59e0b',
              borderColor: '#f59e0b',
              data: max,
            },
            {
              label: 'Average',
              backgroundColor: '#0ea5e9',
              borderColor: '#0ea5e9',
              data: avg,
            },
            {
              label: 'Minimum',
              backgroundColor: '#22c55e',
              borderColor: '#22c55e',
              data: min,
            },
          ],
        },
      });
    }
  });
</script>

<Card.Root>
  <Card.Header class="text-center">
    <Card.Title>Response Time</Card.Title>
    <Card.Description>Response time changes over time</Card.Description>
  </Card.Header>
  <Card.Content>
    <canvas bind:this={canvas} id="response-time-chart" class="h-96" />
  </Card.Content>
</Card.Root>
