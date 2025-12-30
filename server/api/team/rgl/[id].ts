import { enqueueFetch } from "@@/server/lib/queue";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    return createError({ statusCode: 400, statusMessage: "Missing id" });
  }

  try {
    const res = await enqueueFetch("rgl_team", id);

    return { ok: true, enqueued: res.enqueued, member: res.member };
  } catch (err) {
    console.error("Failed to enqueue RGL team fetch", err);
    throw createError({ statusCode: 500, statusMessage: "Enqueue failed" });
  }
});
