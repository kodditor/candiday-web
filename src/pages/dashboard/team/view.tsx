import { TeamMemberContainer } from "@/components/containers/team-member.container";
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
import { archiveTeamMember, restoreTeamMember } from "@/lib/api/team";
import {
  findTeamRow,
  type ITeamRow,
} from "@/lib/types/team-member.type";
import { wrapError } from "@/lib/utils/request";
import { useAuth } from "@clerk/react";
import { useMutation } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  closeModal: () => void;
  rows: ITeamRow[];
  loading?: boolean;
  isAdmin?: boolean;
  currentUserId?: string | null;
  onUpdated?: () => void;
};

export function ViewTeamMemberModal({
  open,
  closeModal,
  rows,
  loading = false,
  isAdmin = false,
  currentUserId,
  onUpdated,
}: Props) {
  const { getToken } = useAuth();
  const [encodedId] = useQueryState("id");
  const selectedRow = findTeamRow(rows, encodedId);
  const showLoading = open && Boolean(encodedId) && loading;
  const showError = open && Boolean(encodedId) && !loading && !selectedRow;
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const isSelf = Boolean(
    selectedRow?.clerkUserId &&
    currentUserId &&
    selectedRow.clerkUserId === currentUserId,
  );
  const canManageMember = isAdmin
    && selectedRow?.type === "member"
    && Boolean(selectedRow.clerkUserId)
    && !isSelf;

  const archiveMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      if (!selectedRow?.clerkUserId) {
        throw new Error("Missing team member id");
      }

      await archiveTeamMember(token, selectedRow.clerkUserId);
      setArchiveOpen(false);
      closeModal();
      onUpdated?.();
      toast.success("Team member archived successfully");
    }),
  });

  const restoreMutation = useMutation({
    mutationFn: async () => wrapError(async () => {
      const token = await getToken({ skipCache: true });

      if (!token) {
        throw new Error("Missing session token");
      }

      if (!selectedRow?.clerkUserId) {
        throw new Error("Missing team member id");
      }

      await restoreTeamMember(token, selectedRow.clerkUserId);
      setRestoreOpen(false);
      closeModal();
      onUpdated?.();
      toast.success("Team member restored successfully");
    }),
  });

  return (
    <>
      <Modal
        open={open}
        closeModal={closeModal}
        loading={showLoading}
        error={showError ? new Error("Team member not found") : null}
        title={selectedRow?.type === "invitation" ? "Invitation details" : "Team member details"}
        size="xl"
        renderActions={() => (
          <>
            {canManageMember && selectedRow?.status === "active" ? (
              <Button
                variant="destructive"
                onClick={() => setArchiveOpen(true)}
              >
                Archive
              </Button>
            ) : null}
            {canManageMember && selectedRow?.status === "archived" ? (
              <Button
                variant="outline"
                onClick={() => setRestoreOpen(true)}
              >
                Restore
              </Button>
            ) : null}
          </>
        )}
      >
        {selectedRow ? <TeamMemberContainer datum={selectedRow} /> : null}
      </Modal>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRow
                ? `Archive ${selectedRow.name}? They will lose access to ProcVault but remain visible in your team list.`
                : "This team member will lose access to ProcVault."}
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

      <AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRow
                ? `Restore access for ${selectedRow.name}? They will be able to use ProcVault again.`
                : "This team member will regain access to ProcVault."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoreMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              loading={restoreMutation.isPending}
              onClick={() => restoreMutation.mutate()}
            >
              Restore
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
