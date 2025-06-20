import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { formatCurrency } from "@/lib/utils";

Chart.register(...registerables);

interface CashFlowChartProps {
  data: { date: string; balance: number }[];
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data?.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map(item => {
      const date = new Date(item.date);
      return new Intl.DateTimeFormat('id-ID', { 
        day: 'numeric', 
        month: 'short' 
      }).format(date);
    });

    const balances = data.map(item => item.balance);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Arus Kas',
          data: balances,
          borderColor: 'hsl(160, 84%, 39%)',
          backgroundColor: 'hsla(160, 84%, 39%, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'hsl(160, 84%, 39%)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Saldo: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'hsl(20, 5.9%, 90%)',
            },
            ticks: {
              callback: function(value) {
                return formatCurrency(value as number);
              },
              color: 'hsl(25, 5.3%, 44.7%)',
            }
          },
          x: {
            grid: {
              color: 'hsl(20, 5.9%, 90%)',
            },
            ticks: {
              color: 'hsl(25, 5.3%, 44.7%)',
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <p>Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <div className="relative h-48">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
