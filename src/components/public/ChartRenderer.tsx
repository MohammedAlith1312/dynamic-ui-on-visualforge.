"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

interface ChartRendererProps {
  content: {
    chartType: string;
    data: string;
    title: string;
    xAxisKey?: string;
    yAxisKey?: string;
    dataKeys?: string;
  };
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const ChartRenderer = ({ content }: ChartRendererProps) => {
  let chartData: any[] = [];

  try {
    chartData = JSON.parse(content.data || "[]");
  } catch (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
        <p className="text-destructive font-semibold">Invalid chart data</p>
        <p className="text-sm text-muted-foreground">Please provide valid JSON data</p>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="p-4 border border-border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    );
  }

  const chartConfig = chartData.reduce((acc, item, index) => {
    Object.keys(item).forEach(key => {
      if (key !== content.xAxisKey && key !== "name" && !acc[key]) {
        acc[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1),
          color: COLORS[Object.keys(acc).length % COLORS.length],
        };
      }
    });
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const renderChart = () => {
    switch (content.chartType) {
      case "bar":
        return (
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={content.xAxisKey || "name"}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey={content.yAxisKey || "value"}
                fill={COLORS[0]}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        );

      case "line":
        const lineDataKeys = (content.dataKeys || "").split(",").filter(Boolean);
        return (
          <ChartContainer config={chartConfig}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={content.xAxisKey || "month"}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {lineDataKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key.trim()}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        );

      case "area":
        const areaDataKeys = (content.dataKeys || "").split(",").filter(Boolean);
        return (
          <ChartContainer config={chartConfig}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey={content.xAxisKey || "time"}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {areaDataKeys.map((key, idx) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key.trim()}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ChartContainer>
        );

      case "pie":
        return (
          <ChartContainer config={chartConfig}>
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        );

      case "radar":
        return (
          <ChartContainer config={chartConfig}>
            <RadarChart data={chartData}>
              <PolarGrid className="stroke-muted" />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar
                name="Score"
                dataKey="value"
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.6}
              />
            </RadarChart>
          </ChartContainer>
        );

      default:
        return <div className="text-muted-foreground">Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full space-y-4">
      {content.title && (
        <h3 className="text-xl font-semibold text-center">{content.title}</h3>
      )}
      <div className="w-full min-h-[300px] max-h-[400px] h-[400px]">
        {renderChart()}
      </div>
    </div>
  );
};
