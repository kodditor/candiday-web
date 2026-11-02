import { useQueryState, parseAsStringEnum } from "nuqs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const DateFilterValues = [
  "day",
  "week",
  "month",
  "year",
  "custom",
  "all-time"
] as const;

type DateFilterValue = typeof DateFilterValues[number];

export function CustomDateFilter({ defaultValue = "month" }: { defaultValue?: DateFilterValue }) {
  // @ts-ignore
  const [viewType, setViewType] = useQueryState("viewType", parseAsStringEnum<DateFilterValue>(DateFilterValues).withDefault(defaultValue));
  const [fromDate, setFromDate] = useQueryState("fromDate");
  const [toDate, setToDate] = useQueryState("toDate");

  const [calendarYear, setCalendarYear] = useState(dayjs(fromDate || undefined).year())
  const [isOpen, setIsOpen] = useState(false);

  const displayLabel = useMemo(() => {
    if (viewType === "custom" && fromDate && toDate) {
      return `${dayjs(fromDate).format("D MMM, YYYY")} - ${dayjs(toDate).format("D MMM, YYYY")}`;
    }

    if (viewType === "custom") return "Select Custom Range";

    if (fromDate) {
      if (viewType === "day") return dayjs(fromDate).format("D MMM, YYYY");
      if (viewType === "week") return `Week of ${dayjs(fromDate).format("D MMM, YYYY")}`;
      if (viewType === "month") return dayjs(fromDate).format("MMMM YYYY");
      if (viewType === "year") return dayjs(fromDate).format("YYYY");
    }

    const baseMaps: Record<DateFilterValue, string> = {
      "day": "Today",
      "week": "This Week",
      "month": "This Month",
      "year": "This Year",
      "custom": "Custom Range",
      "all-time": "All Time",
    }

    return baseMaps[viewType] || "Select Date";
  }, [viewType, fromDate, toDate]);

  const handleSelectDate = (date: Date | undefined, type: DateFilterValue) => {
    if (!date) return;
    setViewType(type);

    if (type === "day") {
      setFromDate(dayjs(date).startOf("day").format("YYYY-MM-DD"));
      setToDate(dayjs(date).endOf("day").format("YYYY-MM-DD"));
    } else if (type === "week") {
      setFromDate(dayjs(date).startOf("week").format("YYYY-MM-DD"));
      setToDate(dayjs(date).endOf("week").format("YYYY-MM-DD"));
    } else if (type === "month") {
      setFromDate(dayjs(date).startOf("month").format("YYYY-MM-DD"));
      setToDate(dayjs(date).endOf("month").format("YYYY-MM-DD"));
    } else if (type === "year") {
      setFromDate(dayjs(date).startOf("year").format("YYYY-MM-DD"));
      setToDate(dayjs(date).endOf("year").format("YYYY-MM-DD"));
    }

    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={"outline"} className="justify-start w-full text-left text-sm font-normal px-3! py-4.5! gap-2 bg-white!">
          <CalendarIcon size={16} />
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex flex-col sm:flex-row h-auto bg-white rounded-xl shadow-lg border border-gray-100" align="end">
        <div className="flex flex-row overflow-x-auto sm:flex-col border-b sm:border-b-0 sm:border-r border-gray-100 p-2 gap-1 sm:w-35">
          {DateFilterValues.map((type) => (
            <Button
              key={type}
              variant={viewType === type ? "default" : "ghost"}
              className="justify-start w-full text-sm h-8 capitalize shrink-0"
              onClick={() => {
                setViewType(type);
                if (type !== "custom" && type !== "all-time") {
                  handleSelectDate(fromDate ? new Date(fromDate) : new Date(), type);
                } else {
                  setFromDate(null);
                  setToDate(null);
                  if (type === "all-time") setIsOpen(false);
                }
              }}
            >
              {type === "all-time" ? "All Time" : type}
            </Button>
          ))}
        </div>

        {viewType === "day" && (
          <div className="p-2">
            <Calendar
              mode="single"
              selected={fromDate ? dayjs(fromDate).toDate() : undefined}
              defaultMonth={fromDate ? dayjs(fromDate).toDate() : undefined}
              onSelect={(d) => handleSelectDate(d, "day")}
              autoFocus
              showOutsideDays={false}
            />
          </div>
        )}

        {viewType === "week" && (
          <div className="p-2">
            <Calendar
              mode="single"
              selected={fromDate ? dayjs(fromDate).toDate() : undefined}
              defaultMonth={fromDate ? dayjs(fromDate).toDate() : undefined}
              onSelect={(d) => handleSelectDate(d, "week")}
              modifiers={{
                selectedWeek: fromDate ? {
                  from: dayjs(fromDate).startOf("week").toDate(),
                  to: dayjs(fromDate).endOf("week").toDate()
                } : undefined
              }}
              modifiersClassNames={{
                selectedWeek: "bg-primary text-white  first:rounded-l-lg last:rounded-r-lg"
              }}
              autoFocus
            />
          </div>
        )}

        {viewType === "month" && (
          <div className="p-4 w-70">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCalendarYear(y => y - 1)}>
                <CaretLeftIcon className="h-4 w-4" />
              </Button>
              <div className="font-semibold text-sm">{calendarYear}</div>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCalendarYear(y => y + 1)}>
                <CaretRightIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const dateObj = dayjs().year(calendarYear).month(i).toDate();
                const isSelected = fromDate && dayjs(fromDate).isSame(dateObj, "month");
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectDate(dateObj, "month")}
                    className={cn(
                      "h-10 text-sm px-4 rounded-md py-2 duration-150",
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-white hover:bg-primary/10"
                    )}
                  >
                    {dayjs().month(i).format("MMM")}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {viewType === "year" && (
          <div className="p-4 w-70">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCalendarYear(y => y - 12)}>
                <CaretLeftIcon className="h-4 w-4" />
              </Button>
              <div className="font-semibold text-sm">{calendarYear - 11} - {calendarYear}</div>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCalendarYear(y => y + 12)}>
                <CaretRightIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const year = calendarYear - 11 + i;
                const dateObj = dayjs().year(year).startOf("year").toDate();
                const isSelected = fromDate && dayjs(fromDate).year() === year;
                return (
                  <Button
                    key={year}
                    variant={isSelected ? "default" : "ghost"}
                    onClick={() => handleSelectDate(dateObj, "year")}
                    className="h-10 text-sm"
                  >
                    {year}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {viewType === "custom" && (
          <div className="p-4 flex flex-col gap-4 w-75">
            <p className="text-sm font-medium">Custom Date Range</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">From</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm bg-transparent focus:ring-green-700"
                  value={fromDate ?? ""}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={toDate ?? undefined}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">To</label>
                <input
                  type="date"
                  className="border rounded px-2 py-1 text-sm bg-transparent"
                  value={toDate ?? ""}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate ?? undefined}
                />
              </div>
            </div>
            {(fromDate && toDate) && (
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={() => setIsOpen(false)}>Done</Button>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function useDateFilter(defaultValue = "month" as DateFilterValue) {
  // @ts-ignore
  const [viewType] = useQueryState("viewType", parseAsStringEnum<DateFilterValue>(DateFilterValues).withDefault(defaultValue));
  const [fromDate] = useQueryState("fromDate");
  const [toDate] = useQueryState("toDate");

  return { viewType, fromDate, toDate };
}

export function getDateRange(params: Partial<ReturnType<typeof useDateFilter>> | string) {
  // Backwards compat string argument
  if (typeof params === "string") {
    if (params === "today") return { fromDate: dayjs().startOf("day").format("YYYY-MM-DD"), toDate: dayjs().endOf("day").format("YYYY-MM-DD") };
    if (params === "yesterday") return { fromDate: dayjs().subtract(1, "day").startOf("day").format("YYYY-MM-DD"), toDate: dayjs().subtract(1, "day").endOf("day").format("YYYY-MM-DD") };
    if (params === "this-week") return { fromDate: dayjs().startOf("week").format("YYYY-MM-DD"), toDate: dayjs().endOf("week").format("YYYY-MM-DD") };
    if (params === "last-week") return { fromDate: dayjs().subtract(1, "week").startOf("week").format("YYYY-MM-DD"), toDate: dayjs().subtract(1, "week").endOf("week").format("YYYY-MM-DD") };
    if (params === "this-month") return { fromDate: dayjs().startOf("month").format("YYYY-MM-DD"), toDate: dayjs().endOf("month").format("YYYY-MM-DD") };
    if (params === "last-month") return { fromDate: dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD"), toDate: dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD") };
    if (params === "all-time") return {};
    return {};
  }

  // Exact dates — stored as YYYY-MM-DD, pass directly (already correct format for APIs expecting date strings)
  if (params.fromDate && params.toDate) {
    return {
      fromDate: params.fromDate,
      toDate: params.toDate,
    };
  }

  const { viewType } = params;

  // Defaults if no exact dates provided — derive from viewType
  if (!viewType || viewType === "all-time") return {};
  if (viewType === "month") return { fromDate: dayjs().startOf("month").format("YYYY-MM-DD"), toDate: dayjs().endOf("month").format("YYYY-MM-DD") };
  if (viewType === "day") return { fromDate: dayjs().startOf("day").format("YYYY-MM-DD"), toDate: dayjs().endOf("day").format("YYYY-MM-DD") };
  if (viewType === "week") return { fromDate: dayjs().startOf("week").format("YYYY-MM-DD"), toDate: dayjs().endOf("week").format("YYYY-MM-DD") };
  if (viewType === "year") return { fromDate: dayjs().startOf("year").format("YYYY-MM-DD"), toDate: dayjs().endOf("year").format("YYYY-MM-DD") };

  return {};
}