import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { CircleNotchIcon, CloudWarningIcon } from "@phosphor-icons/react"

const chartConfig = {
  pending: {
    label: "Pending",
    color: "var(--chart-1)",
  },
  approved: {
    label: "Approved",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig


type Props = {
  data: { name: string, pending: number, approved: number, total: number }[],
  isLoading: boolean;
}

export function TopSpendersBarChart({ data, isLoading }: Props) {

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
      <BarChart accessibilityLayer data={data}>
        {/* <CartesianGrid vertical={false} /> */}
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={5}
          axisLine={false}
        />
        <YAxis
          dataKey="total"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="pending"
          stackId="a"
          fill="var(--color-pending)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="approved"
          stackId="a"
          width={15}
          fill="var(--color-approved)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
