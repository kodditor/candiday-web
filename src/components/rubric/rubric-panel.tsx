import { RubricApprovedView } from "@/components/rubric/rubric-approved-view";
import { RubricDraftView } from "@/components/rubric/rubric-draft-view";
import { RubricEditModal } from "@/components/rubric/rubric-edit-modal";
import {
  RubricEmptyState,
  RubricFailedState,
  RubricGeneratingState,
} from "@/components/rubric/rubric-panel-states";
import { RubricStatusChip } from "@/components/rubric/rubric-status-chip";
import { Button } from "@/components/ui/button";
import {
  approveRubric,
  fetchRubricView,
  rubricQueryKeys,
  saveRubricItems,
  startRubricGeneration,
} from "@/lib/api/rubric";
import {
  RUBRIC_POLL_MS,
  canApprove,
  derivePanelPhase,
  shouldPollRubric,
} from "@/features/rubric-panel/machine";
import type { RoleDetailDto } from "@/lib/types/role.type";
import type { RubricSaveItemInput } from "@/lib/rubric/schema";
import type { RubricView } from "@/lib/types/rubric.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function idempotencyKey() {
  return crypto.randomUUID();
}

type RubricPanelProps = {
  role: RoleDetailDto;
};

export function RubricPanel({ role }: RubricPanelProps) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const rubricQuery = useQuery({
    queryKey: rubricQueryKeys.view(role.id),
    queryFn: () => fetchRubricView(role.id),
    refetchInterval: (query) =>
      shouldPollRubric(query.state.data) ? RUBRIC_POLL_MS : false,
  });

  const view = rubricQuery.data ?? null;
  const phase = derivePanelPhase(view);

  const invalidateRubric = () => {
    void queryClient.invalidateQueries({ queryKey: rubricQueryKeys.view(role.id) });
    void queryClient.invalidateQueries({ queryKey: ["roles", "detail", role.id] });
  };

  const refreshRubricQuery = async (updatedView?: RubricView) => {
    if (updatedView) {
      queryClient.setQueryData(rubricQueryKeys.view(role.id), updatedView);
    }
    await queryClient.refetchQueries({ queryKey: rubricQueryKeys.view(role.id) });
  };

  const generateMutation = useMutation({
    mutationFn: (replace: boolean) =>
      startRubricGeneration(role.id, idempotencyKey(), replace),
    onSuccess: () => {
      invalidateRubric();
      toast.success("Generating rubric…");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: (items: RubricSaveItemInput[]) =>
      saveRubricItems(view!.id, view!.revision, items),
    onSuccess: async (updatedView) => {
      await refreshRubricQuery(updatedView);
      void queryClient.invalidateQueries({ queryKey: ["roles", "detail", role.id] });
      setEditOpen(false);
      toast.success("Rubric saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      approveRubric(view!.id, view!.revision, role.version),
    onSuccess: () => {
      invalidateRubric();
      toast.success("Rubric approved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (phase !== "generating") {
      void queryClient.invalidateQueries({ queryKey: ["roles", "detail", role.id] });
    }
  }, [phase, queryClient, role.id]);

  const generateBusy = generateMutation.isPending;

  return (
    <section
      className="rounded-lg border border-hairline bg-white p-5"
      aria-labelledby="rubric-panel-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 id="rubric-panel-heading" className="text-base font-semibold text-ink">
            Evaluation rubric
          </h2>
          {phase === "approved" ? <RubricStatusChip /> : null}
        </div>
        {phase === "draft" && view?.items ? (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Edit rubric
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canApprove(view) || approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
            >
              Approve rubric
            </Button>
          </div>
        ) : null}
      </div>

      {phase === "approved" ? (
        <p className="mt-1.5 text-sm text-text-muted">
          These criteria are used when screening applicants.
        </p>
      ) : null}

      <div className="mt-4">
        {phase === "empty" ? (
          <RubricEmptyState
            onGenerate={() => generateMutation.mutate(false)}
            busy={generateBusy}
          />
        ) : null}

        {phase === "generating" ? <RubricGeneratingState /> : null}

        {phase === "failed" ? (
          <RubricFailedState
            message={view?.generationError ?? role.rubricGenerationError ?? "Generation failed"}
            onRetry={() => generateMutation.mutate(true)}
            busy={generateBusy}
          />
        ) : null}

        {phase === "draft" && view?.items ? (
          <RubricDraftView
            items={view.items}
            validation={view.validation}
            staleBanner={view.roleChangedSinceGeneration}
          />
        ) : null}

        {phase === "approved" && view?.items ? (
          <RubricApprovedView items={view.items} />
        ) : null}
      </div>

      {view?.items && phase === "draft" ? (
        <RubricEditModal
          open={editOpen}
          items={view.items}
          saving={saveMutation.isPending}
          onOpenChange={setEditOpen}
          onSave={async (items) => {
            await saveMutation.mutateAsync(items);
          }}
        />
      ) : null}
    </section>
  );
}