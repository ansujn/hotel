"use server";

// TODO: wire to `POST /v1/admin/batches/{toBatchId}/students/{studentId}` once
// the Go API exposes a batch-move endpoint. For now this is a stub that logs
// the attempted move so the kanban interaction is end-to-end on the web side.
export async function moveStudentAction(
  studentId: string,
  fromBatchId: string,
  toBatchId: string,
): Promise<{ ok: true }> {
  // eslint-disable-next-line no-console
  console.log("[moveStudentAction] stub move", {
    studentId,
    fromBatchId,
    toBatchId,
  });
  return { ok: true };
}
