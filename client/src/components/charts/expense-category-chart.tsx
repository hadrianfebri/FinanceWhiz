import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { formatCurrency } from "@/lib/utils";

Chart.register(...registerables);

interface ExpenseCategoryChartProps {
  data: { category: string; amount: number; percentage: number }[];
}

export default function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
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

    const colors = [
      'hsl(32, 95%, 44%)', // warning/orange
      'hsl(207, 90%, 54%)', // blue
      'hsl(267, 84%, 64%)', // purple
      'hsl(25, 5.3%, 44.7%)', // gray
      'hsl(160, 84%, 39%)', // primary
      'hsl(0, 84%, 55%)', // red
    ];

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.category),
        datasets: [{
          data: data.map(item => item.percentage),
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: 'white',
          hoverBorderWidth: 3,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
              },
              color: 'hsl(25, 5.3%, 44.7%)',
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataItem = data[context.dataIndex];
                return `${context.label}: ${formatCurrency(dataItem.amount)} (${dataItem.percentage.toFixed(1)}%)`;
              }
            }
          }
        },
        cutout: '60%',
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
        <p>Tidak ada data pengeluaran</p>
      </div>
    );
  }

  return (
    <div className="relative h-48">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
