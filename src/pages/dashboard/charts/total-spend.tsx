
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { CircleNotchIcon, CloudWarningIcon } from "@phosphor-icons/react";

const chartConfig = {
  value: {
    label: "Total Spend",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig


type Props = {
  data: {
    title: string,
    value: number,
  }[];
  isLoading: boolean;
}

export function TotalSpendChart({ data, isLoading }: Props) {

  if(isLoading){
    return (
      <div className="w-full h-full grid place-items-center">
        <div className="animate-spin text-gray-600">
          <CircleNotchIcon size={25} />
        </div>
      </div>
    )
  }


  if(!data?.length){
    return (
      <div className="w-full h-full grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-gray-600">
            <CloudWarningIcon size={25} />
          </div>
          <p className="text-center">No Data Available</p>
        </div>
      </div>
    )
  }

  return (
  
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer 
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="title"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          dataKey="value"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" hideLabel />}
        />
        <Area
          dataKey="value"
          type="linear"
          fill="var(--color-value)"
          fillOpacity={0.4}
          stroke="var(--color-value)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
