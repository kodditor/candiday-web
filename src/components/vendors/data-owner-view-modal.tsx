import { DataOwnerContainer } from "@/components/containers/data-owner.container";
import Modal from "@/components/ui/modal";
import type { IDataOwner } from "@/lib/types/data-owner.type";

type DataOwnerViewModalProps = {
  open: boolean;
  closeModal: () => void;
  datum: IDataOwner | null;
};

export function DataOwnerViewModal({
  open,
  closeModal,
  datum,
}: DataOwnerViewModalProps) {
  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Data owner details"
      size="xl"
    >
      {datum ? <DataOwnerContainer datum={datum} /> : null}
    </Modal>
  );
}
