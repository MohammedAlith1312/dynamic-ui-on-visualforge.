import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ChartComponentEditorProps {
  component: {
    content: any;
  };
  onUpdate: (newContent: any) => void;
}

const sampleData = {
  bar: JSON.stringify([
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 600 },
    { name: "Apr", value: 800 },
    { name: "May", value: 500 },
    { name: "Jun", value: 700 }
  ], null, 2),
  line: JSON.stringify([
    { month: "Jan", sales: 400, expenses: 240 },
    { month: "Feb", sales: 300, expenses: 139 },
    { month: "Mar", sales: 600, expenses: 380 },
    { month: "Apr", sales: 800, expenses: 430 },
    { month: "May", sales: 500, expenses: 210 },
    { month: "Jun", sales: 700, expenses: 350 }
  ], null, 2),
  area: JSON.stringify([
    { time: "00:00", visitors: 240 },
    { time: "03:00", visitors: 139 },
    { time: "06:00", visitors: 380 },
    { time: "09:00", visitors: 430 },
    { time: "12:00", visitors: 650 },
    { time: "15:00", visitors: 500 },
    { time: "18:00", visitors: 420 },
    { time: "21:00", visitors: 310 }
  ], null, 2),
  pie: JSON.stringify([
    { name: "Desktop", value: 400 },
    { name: "Mobile", value: 300 },
    { name: "Tablet", value: 200 },
    { name: "Other", value: 100 }
  ], null, 2),
  radar: JSON.stringify([
    { subject: "Math", value: 120, fullMark: 150 },
    { subject: "Chinese", value: 98, fullMark: 150 },
    { subject: "English", value: 86, fullMark: 150 },
    { subject: "Geography", value: 99, fullMark: 150 },
    { subject: "Physics", value: 85, fullMark: 150 },
    { subject: "History", value: 65, fullMark: 150 }
  ], null, 2)
};

export const ChartComponentEditor = ({ component, onUpdate }: ChartComponentEditorProps) => {
  const content = component.content as {
    chartType: string;
    data: string;
    title: string;
    xAxisKey?: string;
    yAxisKey?: string;
    dataKeys?: string;
  };
  const handleChartTypeChange = (chartType: string) => {
    onUpdate({ 
      ...content, 
      chartType,
      data: sampleData[chartType as keyof typeof sampleData] || "[]",
      xAxisKey: chartType === "bar" ? "name" : chartType === "line" ? "month" : chartType === "area" ? "time" : undefined,
      yAxisKey: chartType === "bar" ? "value" : undefined,
      dataKeys: chartType === "line" ? "sales,expenses" : chartType === "area" ? "visitors" : undefined
    });
  };

  const loadSample = () => {
    const chartType = content.chartType || "bar";
    onUpdate({
      ...content,
      data: sampleData[chartType as keyof typeof sampleData] || "[]",
      title: `Sample ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <Label>Chart Type</Label>
        <Select value={content.chartType || "bar"} onValueChange={handleChartTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="area">Area Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="radar">Radar Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Chart Title</Label>
        <Input
          value={content.title || ""}
          onChange={(e) => onUpdate({ ...content, title: e.target.value })}
          placeholder="Enter chart title"
        />
      </div>

      {(content.chartType === "bar" || content.chartType === "line" || content.chartType === "area") && (
        <>
          <div>
            <Label>X-Axis Key</Label>
            <Input
              value={content.xAxisKey || ""}
              onChange={(e) => onUpdate({ ...content, xAxisKey: e.target.value })}
              placeholder="e.g., name, month, time"
            />
          </div>

          {content.chartType === "bar" && (
            <div>
              <Label>Y-Axis Key</Label>
              <Input
                value={content.yAxisKey || ""}
                onChange={(e) => onUpdate({ ...content, yAxisKey: e.target.value })}
                placeholder="e.g., value"
              />
            </div>
          )}

          {(content.chartType === "line" || content.chartType === "area") && (
            <div>
              <Label>Data Keys (comma-separated)</Label>
              <Input
                value={content.dataKeys || ""}
                onChange={(e) => onUpdate({ ...content, dataKeys: e.target.value })}
                placeholder="e.g., sales,expenses or visitors"
              />
            </div>
          )}
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Chart Data (JSON)</Label>
          <Button variant="outline" size="sm" onClick={loadSample}>
            Load Sample
          </Button>
        </div>
        <Textarea
          value={content.data || "[]"}
          onChange={(e) => onUpdate({ ...content, data: e.target.value })}
          placeholder="Enter JSON data..."
          rows={10}
          className="font-mono text-sm"
        />
      </div>

      <Separator />

      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="font-semibold">Sample Data Formats:</p>
        <div className="space-y-1">
          <p><strong>Bar/Pie:</strong> {`[{ name: "A", value: 100 }]`}</p>
          <p><strong>Line:</strong> {`[{ month: "Jan", sales: 100, expenses: 50 }]`}</p>
          <p><strong>Area:</strong> {`[{ time: "00:00", visitors: 100 }]`}</p>
          <p><strong>Radar:</strong> {`[{ subject: "Math", value: 100, fullMark: 150 }]`}</p>
        </div>
      </div>
    </div>
  );
};
