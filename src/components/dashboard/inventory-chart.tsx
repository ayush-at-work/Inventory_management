
"use client"

import * as React from "react"
import { Pie, PieChart, Sector } from "recharts"
import { useInventory } from "@/context/inventory-context";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const generateChartConfig = (inventory: any[]): ChartConfig => {
    const config: ChartConfig = {
        quantity: {
            label: "Quantity (kg)",
        },
    };
    inventory.forEach((item, index) => {
        const key = item.materialType.toLowerCase().replace(/\s/g, '');
        if (!config[key]) {
            config[key] = {
                label: item.materialType,
                // Generate a dynamic and vibrant color for each item
                color: `hsl(${index * 137.5}, 70%, 50%)`,
            };
        }
    });
    return config;
};

export function InventoryChart() {
  const { inventory } = useInventory();
  
  const chartData = React.useMemo(() => {
    if (!inventory || inventory.length === 0) return [];

    const materialMap = new Map<string, number>();
    inventory.forEach(item => {
        if (item.unit.toLowerCase() === 'kg') {
            materialMap.set(item.materialType, (materialMap.get(item.materialType) || 0) + item.quantity);
        }
    });

    const config = generateChartConfig(Array.from(materialMap.keys()).map(material => ({ materialType: material })));
    
    return Array.from(materialMap.entries()).map(([material, quantity]) => {
      const key = material.toLowerCase().replace(/\s/g, '');
      return {
        material,
        quantity,
        fill: config[key]?.color || 'hsl(var(--muted))',
      }
    }).filter(d => d.quantity > 0);

  }, [inventory]);

  const chartConfig = React.useMemo(() => generateChartConfig(inventory), [inventory]);

  const id = "pie-interactive"
  const [activeMaterial, setActiveMaterial] = React.useState(chartData[0]?.material)

  React.useEffect(() => {
    if (chartData.length > 0 && !activeMaterial) {
      setActiveMaterial(chartData[0].material)
    }
  }, [chartData, activeMaterial]);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.material === activeMaterial),
    [activeMaterial, chartData]
  )
  const allQuantity = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.quantity, 0)
  }, [chartData])

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Inventory Overview</CardTitle>
        <CardDescription>By material type (in kg)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
        {allQuantity > 0 ? (
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="quantity"
              nameKey="material"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius}
                    innerRadius={outerRadius - 8}
                  />
                </g>
              )}
              onMouseOver={(_, index) => {
                setActiveMaterial(chartData[index].material)
              }}
            />
          </PieChart>
           ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No inventory data
            </div>
          )}
        </ChartContainer>
      </CardContent>
      {allQuantity > 0 && (
      <CardContent className="flex-1 justify-center flex pb-4 text-sm">
        <div
          className="grid grid-cols-2 gap-x-10 gap-y-1 text-sm sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 [&>div]:flex [&>div]:items-center [&>div]:gap-2"
        >
          {chartData.map((item) => {
            const percentage = allQuantity > 0 ? ((item.quantity / allQuantity) * 100).toFixed(1) : 0
            if (item.quantity === 0) return null;
            
            const colorKey = item.material.toLowerCase().replace(/\s/g, '') as keyof typeof chartConfig;
            const itemConfig = chartConfig[colorKey];

            return (
              <div key={item.material}>
                <div
                  className="size-2.5 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: itemConfig ? itemConfig.color : "hsl(var(--muted))",
                  }}
                />
                <div className="flex-1 truncate">{item.material}</div>
                <div className="text-right font-medium">{percentage}%</div>
              </div>
            )
          })}
        </div>
      </CardContent>
      )}
    </Card>
  )
}
