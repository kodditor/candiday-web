import { CaretLeftIcon, CaretRightIcon, CircleNotchIcon, MagnifyingGlassIcon, StickerIcon } from "@phosphor-icons/react"
import lodash from 'lodash';
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import SelectInput from "../form/select";
import { Button } from "./button";

type Props<T> = {
  name?: string,
  docs?: T[],
  totalDocs?: number,
  hasPrevPage?: boolean,
  hasNextPage?: boolean,
  loading: boolean,
  renderHeader: () => React.ReactNode,
  renderItem: (item: T, idx: number) => React.ReactNode,
  renderLoader?: () => React.ReactNode,
  renderExtra?: () => React.ReactNode,
  hasSearch?: boolean,
  paramsPrefix?: string,
  hasFooter?: boolean,
}

export function DataTable<T>({
  docs,
  name = "Records",
  loading,
  renderHeader,
  renderItem,
  renderLoader,
  renderExtra,
  hasSearch = true,
  paramsPrefix = "",
  hasFooter = true,
  totalDocs,
  hasPrevPage,
  hasNextPage,
}: Props<T>) {

  const [, setQuery] = useQueryState(paramsPrefix + 'query', parseAsString);
  const [tempQuery, setTempQuery] = useState<string>("");
  const [page, setPage] = useQueryState(paramsPrefix + 'page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(paramsPrefix + 'limit', parseAsInteger.withDefault(10));

  const debouncedSearch = lodash.debounce((text: string) => {
    setQuery(text)
  }, 700)

  useEffect(() => {
    if (tempQuery) {
      debouncedSearch(tempQuery);
    } else {
      setQuery(null)
    }
  }, [tempQuery])


  return (
    <div className="flex flex-col flex-1">
      {/* Search Stuff */}
      {
        hasSearch && (
          <>
            <div className="flex gap-3 items-center">
              <div>
                <div
                  className={`min-w-75 flex rounded-md items-center border border-gray-300 bg-white px-3`}
                >
                  {/* Left Icon */}
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    id={"search"}
                    name={"search"}
                    placeholder={`Search ${name}...`}
                    value={tempQuery || ""}
                    onChange={(e) => {
                      setTempQuery(e.target.value)
                    }}
                    className="flex-1 py-2 outline-none text-sm text-gray-900"
                  />
                </div>
              </div>
              <div className="flex-1">
                {renderExtra?.()}
              </div>
              <div className="">
                <SelectInput
                  id={"limit"}
                  values={{ limit }}
                  handleChange={(e) => {
                    setLimit(Number(e.target.value))
                  }}
                  options={[
                    { label: "10 / page", value: 10 },
                    { label: "25 / page", value: 25 },
                    { label: "50 / page", value: 50 },
                    { label: "100 / page", value: 100 },
                  ]}
                />
              </div>
            </div>
          </>
        )
      }
      <div className="mt-4 flex min-h-64 flex-1 flex-col max-w-full overflow-x-auto no-scrollbar rounded bg-white shadow">
        <table className="relative table-fixed min-w-full no-scrollbar">
          <thead className="w-full">
            {renderHeader()}
          </thead>
          {loading ? (
            renderLoader ? (
              renderLoader()
            ) : (
              <tbody>
                <tr>
                  <td colSpan={100} className="p-0">
                    <div className="flex min-h-48 flex-col items-center justify-center gap-4 py-12 text-gray-700">
                      <CircleNotchIcon className="animate-spin" size={25} strokeWidth={1.5} />
                      <p>Loading {name}...</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            )
          ) : docs?.length ? (
            <tbody className="max-w-full">
              {docs.map((datum, idx) => renderItem(datum, idx))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={100} className="p-0">
                  <div className="flex min-h-48 flex-col items-center justify-center gap-4 py-12 text-gray-700">
                    <StickerIcon size={25} strokeWidth={1.5} />
                    <p>No {name}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      {
        hasFooter && (
          <>
            <div className="flex gap-4 px-2 py-2 sm:px-6 sm:py-4 bg-white shadow rounded mt-4 justify-between items-center">
              <div className="text-sm pl-2 sm:pl-0">
                <span className="hidden sm:inline">Showing</span> {((page - 1) * limit) + 1} - {page * limit < (totalDocs || docs?.length || 0) ? page * limit : totalDocs} of {totalDocs || docs?.length}
              </div>
              <div className="flex gap-4">
                <Button variant={"outline"} disabled={!hasPrevPage} onClick={() => setPage(page - 1)}
                  className="flex items-center"
                >
                  <span className="sm:hidden">
                    <CaretLeftIcon size={15} strokeWidth={1.5} />
                  </span>
                  <span className="hidden sm:inline">Previous Page</span>
                </Button>
                <Button disabled={!hasNextPage} onClick={() => setPage(page + 1)}
                  className="flex items-center"
                >
                  <span className="hidden sm:inline">Next Page</span>
                  <span className="sm:hidden">
                    <CaretRightIcon size={15} strokeWidth={1.5} />
                  </span>
                </Button>
              </div>
            </div>
          </>
        )
      }
    </div>
  )


}