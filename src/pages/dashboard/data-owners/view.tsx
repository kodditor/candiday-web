import { DataOwnerContainer } from "@/components/containers/data-owner.container";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { archiveDataOwner, fetchDataOwner } from "@/lib/api/data-owners";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean,
  closeModal: () => void;
  refetch?: () => void;
}

export function ViewDataOwnerModal({
  open,
  closeModal,
  refetch,
}: Props) {
  const { getToken } = useAuth();
  const [id] = useQueryState("id");
  const [, setModal] = useQueryState("modal");
  const [archiveOpen, setArchiveOpen] = useState(false);

  const query = useQuery({
    enabled: Boolean(id && open),
    queryKey: ["data-owner", id],
    queryFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      if (!id) {
        throw new Error("Missing data owner id");
      }

      return fetchDataOwner(token, id);
    }),
  });

  const archiveMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      if (!id) {
        throw new Error("Missing data owner id");
      }

      await archiveDataOwner(token, id);
      setArchiveOpen(false);
      closeModal();
      refetch?.();
      toast.success("Data owner archived successfully");
    }),
  });

  return (
    <>
      <Modal
        open={open}
        closeModal={closeModal}
        loading={query.isLoading}
        error={query.error}
        title="Data owner details"
        size="xl"
        renderActions={() => (
          <>
            <Button
              variant="ghost"
              onClick={() => setModal("edit")}
            >
              Edit
            </Button>
            {query.data?.status === "active" ? (
              <Button
                variant="destructive"
                onClick={() => setArchiveOpen(true)}
              >
                Archive
              </Button>
            ) : null}
          </>
        )}
      >
        {Boolean(query.data) && <DataOwnerContainer datum={query.data!} />}
      </Modal>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive data owner?</AlertDialogTitle>
            <AlertDialogDescription>
              {query.data
                ? `Archive ${query.data.name}? They will no longer appear in the active list.`
                : "This data owner will no longer appear in the active list."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              loading={archiveMutation.isPending}
              onClick={() => archiveMutation.mutate()}
            >
              Archive
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
