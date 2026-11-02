"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import type { ComponentType } from "react";
import { cn } from "@/lib/cn";

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary-50/20 border-b-2 border-gray-200 text-gray-600 data-[state=active]:text-zinc-800 data-[state=active]:border-b-zinc-600",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName



type TabItem = {
  name: string;
  val: string;
  icon?: ComponentType<{ className?: string }>;
};

type AppTabsProps = {
  tabVal: string;
  setTabVal: (val: string) => void;
  tabs: TabItem[];
  className?: string;
};

function TabsComponent({
  tabVal,
  setTabVal,
  tabs,
  className,
}: AppTabsProps) {
  return (
    <Tabs value={tabVal} onValueChange={setTabVal}>
      <TabsList className={cn("flex gap-1", className)}>
        {tabs.map(({ name, val, icon: Icon }) => (
          <TabsTrigger
            key={val}
            value={val}
            className="flex items-center gap-3"
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}


export { Tabs, TabsList, TabsTrigger, TabsContent, TabsComponent }
