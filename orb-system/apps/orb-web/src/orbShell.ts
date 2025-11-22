<<<<<<< Current (Your changes)
=======
import { createOrbContext, OrbRole } from "@orb/core-orb";
import { summarizeThread } from "@orb/core-sol";
import { buildReflectionSession } from "@orb/core-te";
import { listFlows, startGoldenFlow } from "@orb/core-mav";
import { listLunaModes, resolveModeForContext } from "@orb/core-luna";
import { createMemorySupabaseClient } from "./memorySupabase";

const DEVICE_ID = "device-demo";

export async function runOrbShellDemo(): Promise<void> {
  const supabase = createMemorySupabaseClient();

  const solContext = createOrbContext({ role: OrbRole.SOL, sessionId: "sol-demo", userId: "demo-user" });
  const teContext = createOrbContext({ role: OrbRole.TE, sessionId: "te-demo", userId: "demo-user" });
  const mavContext = createOrbContext({ role: OrbRole.MAV, sessionId: "mav-demo", userId: "demo-user" });
  const lunaContext = createOrbContext({ role: OrbRole.LUNA, sessionId: "luna-demo", userId: "demo-user" });

  const solSummary = await summarizeThread({
    context: solContext,
    persona: "Orb",
    mode: "Sol",
    messages: [
      { sender: "Alex", body: "Can we align on tomorrow's Mars shift?" },
      { sender: "You", body: "Yes, I'll prep a short brief." }
    ],
    memory: [{ content: "Mars shift requires 30 min prep." }],
    apiKey: "mock",
    fetchImpl: mockFetch
  });

  const reflectionSession = await buildReflectionSession({
    context: teContext,
    client: supabase,
    deviceId: DEVICE_ID
  });

  const startResult = await startGoldenFlow({
    context: mavContext,
    client: supabase,
    deviceId: DEVICE_ID,
    input: { source: "orb-web" }
  });

  const flows = await listFlows({
    context: mavContext,
    client: supabase,
    deviceId: DEVICE_ID
  });

  const currentMode = resolveModeForContext(lunaContext, {
    hour: 21,
    calendarContext: "personal"
  });

  renderSection("Sol · Engine", solSummary);
  renderSection("Te · Reflection", {
    reflections: reflectionSession.reflections,
    stats: reflectionSession.taskStats
  });
  renderSection("Mav · Actions", {
    startedFlow: startResult,
    availableFlows: flows.map(flow => ({ id: flow.id, name: flow.name }))
  });
  renderSection("Luna · Modes", {
    currentMode: currentMode.name,
    availableModes: listLunaModes().map(mode => ({ key: mode.key, intent: mode.intent }))
  });
}

function renderSection(title: string, payload: unknown) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(payload, null, 2));
}

async function mockFetch(_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> {
  const mockPayload = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            summary: "Tomorrow's Mars shift needs a quick prep brief.",
            intent: "Coordinate schedule",
            tone: "Practical",
            key_points: ["Confirm Mars shift", "Prepare recap"],
            should_reply: true
          })
        }
      }
    ]
  };

  return new Response(JSON.stringify(mockPayload), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
>>>>>>> Incoming (Background Agent changes)
