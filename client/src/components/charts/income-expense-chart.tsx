import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { formatCurrency } from "@/lib/utils";

Chart.register(...registerables);

interface IncomeExpenseChartProps {
  income: number;
  expenses: number;
}

export default function IncomeExpenseChart({ income, expenses }: IncomeExpenseChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Pemasukan', 'Pengeluaran'],
        datasets: [{
          label: 'Jumlah',
          data: [income, expenses],
          backgroundColor: [
            'hsl(142, 76%, 36%)', // success color for income
            'hsl(0, 84%, 55%)', // accent color for expenses
          ],
          borderRadius: 8,
          borderSkipped: false,
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
                return `${context.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
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
              display: false,
            },
            ticks: {
              color: 'hsl(25, 5.3%, 44.7%)',
            }
          }
        },
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [income, expenses]);

  return (
    <div className="relative h-48">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
