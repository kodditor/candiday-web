import { SubprocessorHistoryAccordion } from "@/components/vendors/subprocessor-history-accordion";
import Modal from "@/components/ui/modal";
import type { ISubprocessorDiffEntry } from "@/lib/types/global-vendor.type";

type SubprocessorHistoryModalProps = {
  open: boolean;
  closeModal: () => void;
  history: ISubprocessorDiffEntry[];
};

export function SubprocessorHistoryModal({
  open,
  closeModal,
  history,
}: SubprocessorHistoryModalProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <Modal
      open={open}
      closeModal={closeModal}
      title="Subprocessor history"
      size="4xl"
    >
      <div className="px-6 py-4">
        <SubprocessorHistoryAccordion history={history} className="w-full" />
      </div>
    </Modal>
  );
}
