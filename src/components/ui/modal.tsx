"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CloudWarningIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { type ReactNode } from "react";

type Props = {
  open: boolean,
  loading?: boolean,
  error?: Error | null,
  closeModal: () => void
  title: string,
  children?: ReactNode,
  renderActions?: () => ReactNode,
  size?: Size,
  hideActions?: boolean,
  variant?: "center" | "bottom",
}

const sizes = ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"];
type Size = (typeof sizes)[number];

const sizeToRemMap: Record<Size, string> = {
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "42rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
}

export default function Modal({
  open,
  closeModal,
  loading,
  children,
  title,
  renderActions,
  error,
  size,
  hideActions = false,
  variant = "center",
}: Props) {

  const modalSize = sizeToRemMap[size || "xl"];

  return (
    <Dialog open={open} onOpenChange={(val: boolean) => val ? null : closeModal()}>
      <DialogContent
        variant={variant}
        style={{
          maxWidth: modalSize || '95vw',
        }}
        className="z-90 flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-md p-0"
      >
        <DialogHeader className="shrink-0 border-b border-b-gray-300 px-6 py-4 pt-5 bg-gray-50 h-fit">
          <DialogTitle className="font-medium">{title}</DialogTitle>
        </DialogHeader>

        <div className="size-full min-h-0 flex-1 overflow-y-auto">
          {loading
            ? (
              <div className="w-full h-full grid place-items-center py-36">
                <CircleNotchIcon size={25} strokeWidth={1.5} className="animate-spin" />
              </div>
            ) : error
              ? (
                <div className="w-full h-full grid place-items-center py-36">
                  <div className="flex flex-col gap-4 items-center">
                    <CloudWarningIcon size={45} strokeWidth={1.5} />
                    {error?.message || "An error occurred"}
                  </div>
                </div>
              ) : children
          }
        </div>

        {
          !hideActions && (
            <div className="shrink-0 max-h-fit flex items-center justify-end border-t border-t-gray-300 p-4 space-x-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Close
                </Button>
              </DialogClose>
              {renderActions?.()}
            </div>
          )
        }
      </DialogContent>
    </Dialog>
  );
}
