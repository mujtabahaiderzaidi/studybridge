import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, activityTable, opportunitiesTable, sessionsTable } from "@workspace/db";
import {
  CompleteSessionParams,
  CompleteSessionResponse,
  CreateSessionBody,
  CreateSessionResponse,
  GetDashboardResponse,
  ListActivityResponse,
  ListOpportunitiesQueryParams,
  ListOpportunitiesResponse,
  ListSessionsResponse,
  ToggleOpportunitySavedParams,
  ToggleOpportunitySavedResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
let seedPromise: Promise<void> | undefined;

async function seedIfEmpty(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const existing = await db.select({ id: opportunitiesTable.id }).from(opportunitiesTable).limit(1);
    if (existing.length > 0) return;

    await db.insert(opportunitiesTable).values([
      {
        title: "Global Scholars Challenge",
        organization: "Future Leaders Network",
        type: "Competition",
        deadline: "2026-09-18",
        tags: ["Essay", "Leadership"],
        description: "A writing and community-impact challenge for students building solutions that matter beyond the classroom.",
        saved: true,
        featured: true,
      },
      {
        title: "Women in STEM Fellowship",
        organization: "Northstar Foundation",
        type: "Fellowship",
        deadline: "2026-10-02",
        tags: ["STEM", "Mentorship"],
        description: "Mentorship, project funding, and a global peer network for the next generation of technical leaders.",
        saved: false,
        featured: true,
      },
      {
        title: "Open Source Summer Lab",
        organization: "Civic Code Collective",
        type: "Program",
        deadline: "2026-10-21",
        tags: ["Open source", "Remote"],
        description: "A guided six-week program pairing students with maintainers to ship useful open-source contributions.",
        saved: false,
        featured: false,
      },
      {
        title: "Young Researchers Grant",
        organization: "Atlas Research Trust",
        type: "Grant",
        deadline: "2026-11-05",
        tags: ["Research", "Science"],
        description: "Small project grants and feedback for students turning a serious question into a well-designed investigation.",
        saved: true,
        featured: false,
      },
    ]);

    await db.insert(sessionsTable).values([
      {
        title: "Calculus deep work",
        subject: "Mathematics",
        durationMinutes: 50,
        scheduledAt: new Date("2026-08-30T15:00:00.000Z"),
        participantCount: 18,
        status: "live",
      },
      {
        title: "Portfolio project sprint",
        subject: "Computer science",
        durationMinutes: 90,
        scheduledAt: new Date("2026-08-30T17:30:00.000Z"),
        participantCount: 11,
        status: "upcoming",
      },
      {
        title: "Application essay circle",
        subject: "University applications",
        durationMinutes: 45,
        scheduledAt: new Date("2026-08-31T16:00:00.000Z"),
        participantCount: 9,
        status: "upcoming",
      },
      {
        title: "Physics problem set",
        subject: "Physics",
        durationMinutes: 60,
        scheduledAt: new Date("2026-08-29T14:00:00.000Z"),
        participantCount: 7,
        status: "completed",
      },
    ]);

    await db.insert(activityTable).values([
      {
        actor: "Maya R.",
        action: "completed a session",
        detail: "Physics problem set · 60 minutes",
        createdAt: new Date("2026-08-30T09:20:00.000Z"),
      },
      {
        actor: "Aarav K.",
        action: "joined the community",
        detail: "Welcome to StudyBridge",
        createdAt: new Date("2026-08-30T08:05:00.000Z"),
      },
      {
        actor: "Noor S.",
        action: "saved an opportunity",
        detail: "Women in STEM Fellowship",
        createdAt: new Date("2026-08-29T18:40:00.000Z"),
      },
      {
        actor: "Leo T.",
        action: "started a session",
        detail: "Calculus deep work",
        createdAt: new Date("2026-08-29T16:12:00.000Z"),
      },
    ]);
  })();

  try {
    await seedPromise;
  } catch (error) {
    seedPromise = undefined;
    throw error;
  }
}

router.get("/dashboard", async (_req, res): Promise<void> => {
  await seedIfEmpty();
  const [opportunities, sessions] = await Promise.all([
    db.select().from(opportunitiesTable),
    db.select().from(sessionsTable),
  ]);
  const completed = sessions.filter((session) => session.status === "completed");
  const weeklyMinutes = completed.reduce((total, session) => total + session.durationMinutes, 0) + 115;

  res.json(
    GetDashboardResponse.parse({
      streak: 7,
      focusMinutes: 640,
      sessionsCompleted: completed.length + 12,
      opportunitiesSaved: opportunities.filter((opportunity) => opportunity.saved).length,
      weeklyMinutes,
      weeklyGoalMinutes: 300,
    }),
  );
});

router.get("/opportunities", async (req, res): Promise<void> => {
  await seedIfEmpty();
  const parsed = ListOpportunitiesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const filters = [];
  if (parsed.data.query) {
    const search = `%${parsed.data.query}%`;
    filters.push(or(ilike(opportunitiesTable.title, search), ilike(opportunitiesTable.organization, search)));
  }
  if (parsed.data.type && parsed.data.type !== "All opportunities") {
    filters.push(eq(opportunitiesTable.type, parsed.data.type));
  }

  const opportunities = await db
    .select()
    .from(opportunitiesTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(opportunitiesTable.featured), opportunitiesTable.deadline);

  res.json(ListOpportunitiesResponse.parse(opportunities));
});

router.patch("/opportunities/:id/save", async (req, res): Promise<void> => {
  await seedIfEmpty();
  const params = ToggleOpportunitySavedParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [current] = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  const [updated] = await db
    .update(opportunitiesTable)
    .set({ saved: !current.saved })
    .where(eq(opportunitiesTable.id, params.data.id))
    .returning();

  res.json(ToggleOpportunitySavedResponse.parse(updated));
});

router.get("/sessions", async (_req, res): Promise<void> => {
  await seedIfEmpty();
  const sessions = await db.select().from(sessionsTable).orderBy(sessionsTable.scheduledAt);
  res.json(ListSessionsResponse.parse(sessions));
});

router.post("/sessions", async (req, res): Promise<void> => {
  await seedIfEmpty();
  const parsed = CreateSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [session] = await db
    .insert(sessionsTable)
    .values({
      title: parsed.data.title,
      subject: parsed.data.subject,
      durationMinutes: parsed.data.durationMinutes,
      scheduledAt: parsed.data.scheduledAt,
      participantCount: 1,
      status: "upcoming",
    })
    .returning();

  res.status(201).json(CreateSessionResponse.parse(session));
});

router.patch("/sessions/:id/complete", async (req, res): Promise<void> => {
  await seedIfEmpty();
  const params = CompleteSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .update(sessionsTable)
    .set({ status: "completed" })
    .where(eq(sessionsTable.id, params.data.id))
    .returning();
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  res.json(CompleteSessionResponse.parse(session));
});

router.get("/activity", async (_req, res): Promise<void> => {
  await seedIfEmpty();
  const activity = await db.select().from(activityTable).orderBy(desc(activityTable.createdAt)).limit(8);
  res.json(ListActivityResponse.parse(activity));
});

export default router;