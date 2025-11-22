#!/usr/bin/env node
/**
 * Orb CLI
 * 
 * Multi-device orchestration CLI for Orb system.
 * Phase 7: Multi-device & Auto-Building Behavior
 * 
 * Usage:
 *   orb run demo-flow
 *   orb run agent-mission --agent=luna --task=persist-store
 *   orb insights
 *   orb events --filter=mode:forge
 */

import {
  runDemoFlow,
  type DemoFlowInput,
  getAdaptationEngine,
  getEventBus,
  runSystemReadiness,
  type ReadinessReport,
  OrbDevice,
  OrbMode,
  getConfig,
} from '@orb-system/core-orb';

const args = process.argv.slice(2);

async function main() {
  const command = args[0];

  switch (command) {
    case 'run':
      await handleRunCommand(args.slice(1));
      break;
    case 'insights':
      await handleInsightsCommand(args.slice(1));
      break;
    case 'events':
      await handleEventsCommand(args.slice(1));
      break;
    case 'readiness':
      await handleReadinessCommand();
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

async function handleRunCommand(subArgs: string[]) {
  const subCommand = subArgs[0];

  switch (subCommand) {
    case 'demo-flow':
      await runDemoFlowCommand(subArgs.slice(1));
      break;
    case 'agent-mission':
      await runAgentMissionCommand(subArgs.slice(1));
      break;
    default:
      console.error(`Unknown run command: ${subCommand}`);
      console.error('Available: demo-flow, agent-mission');
      process.exit(1);
  }
}

async function runDemoFlowCommand(subArgs: string[]) {
  const options = parseOptions(subArgs);
  const userId = options.userId || 'default-user';
  const sessionId = options.sessionId || `session-${Date.now()}`;
  const prompt = options.prompt || 'Hello, Orb!';
  const mode = options.mode as OrbMode | undefined;
  const deviceId = options.deviceId as OrbDevice | undefined;

  console.log('Running demo flow...');
  console.log(`  User: ${userId}`);
  console.log(`  Session: ${sessionId}`);
  console.log(`  Prompt: ${prompt}`);
  if (mode) console.log(`  Mode: ${mode}`);
  if (deviceId) console.log(`  Device: ${deviceId}`);
  console.log('');

  try {
    const result = await runDemoFlow({
      userId,
      sessionId,
      prompt,
      mode,
      deviceId,
    });

    console.log('✓ Demo flow completed');
    console.log(`  Luna decision: ${result.lunaDecision.type}`);
    if (result.solOutput) {
      console.log(`  Sol output: ${result.solOutput.substring(0, 100)}...`);
    }
    if (result.mavTaskResult) {
      console.log(`  Mav status: ${result.mavTaskResult.status}`);
    }
    if (result.teEvaluation) {
      console.log(`  Te score: ${result.teEvaluation.score}`);
    }
  } catch (error) {
    console.error('✗ Demo flow failed:', error);
    process.exit(1);
  }
}

async function runAgentMissionCommand(subArgs: string[]) {
  const options = parseOptions(subArgs);
  const agent = options.agent;
  const task = options.task;

  if (!agent || !task) {
    console.error('Missing required options: --agent and --task');
    console.error('Example: orb run agent-mission --agent=luna --task=persist-store');
    process.exit(1);
  }

  console.log(`Running agent mission: ${agent} / ${task}`);
  console.log('');
  console.log('Note: This would spawn a Cursor Ultra session in a real implementation.');
  console.log('For now, see docs/prompts/forge-agent-bootloader.md for manual execution.');
  console.log('');
  console.log(`Agent: ${agent}`);
  console.log(`Task: ${task}`);
  console.log(`Prompt file: docs/prompts/${agent}/${task}.md`);
}

async function handleInsightsCommand(subArgs: string[]) {
  const options = parseOptions(subArgs);
  const engine = getAdaptationEngine();

  console.log('Computing adaptation insights...');
  console.log('');

  const filter = options.filter ? parseFilter(options.filter) : undefined;
  const insights = await engine.computeInsights(filter);

  console.log('📊 Adaptation Insights');
  console.log('');

  console.log('Most Used Modes:');
  insights.mostUsedModes.slice(0, 5).forEach((item) => {
    console.log(`  ${item.mode}: ${item.count} (${(item.percentage * 100).toFixed(1)}%)`);
  });
  console.log('');

  if (insights.failingFeatures.length > 0) {
    console.log('Failing Features:');
    insights.failingFeatures.slice(0, 5).forEach((item) => {
      console.log(`  ${item.feature}: ${(item.errorRate * 100).toFixed(1)}% error rate (${item.errorCount} errors)`);
    });
    console.log('');
  }

  console.log('Device Usage:');
  insights.deviceUsage.forEach((item) => {
    console.log(`  ${item.device}: ${item.count} (${(item.percentage * 100).toFixed(1)}%)`);
  });
  console.log('');

  console.log('Role Activity:');
  insights.roleActivity.forEach((item) => {
    console.log(`  ${item.role}: ${item.count} (${(item.percentage * 100).toFixed(1)}%)`);
  });
  console.log('');

  console.log(`Error Rate: ${(insights.errorRate * 100).toFixed(1)}%`);
  console.log(`Success Rate: ${(insights.successRate * 100).toFixed(1)}%`);
  if (insights.averageTaskDuration) {
    console.log(`Average Task Duration: ${(insights.averageTaskDuration / 1000).toFixed(1)}s`);
  }
  console.log('');

  if (insights.patterns.length > 0) {
    console.log('Discovered Patterns:');
    insights.patterns.forEach((pattern) => {
      console.log(`  [${pattern.type}] ${pattern.description} (confidence: ${(pattern.confidence * 100).toFixed(1)}%)`);
    });
    console.log('');
  }

  const recommendations = await engine.getRecommendations(filter);
  if (recommendations.length > 0) {
    console.log('💡 Recommendations:');
    recommendations.forEach((rec) => {
      console.log(`  • ${rec}`);
    });
    console.log('');
  }
}

async function handleEventsCommand(subArgs: string[]) {
  const options = parseOptions(subArgs);
  const eventBus = getEventBus();

  const filter = options.filter ? parseFilter(options.filter) : undefined;
  const limit = options.limit ? parseInt(options.limit, 10) : 20;

  const events = await eventBus.query({ ...filter, limit });

  console.log(`Found ${events.length} events`);
  console.log('');

  events.forEach((event) => {
    const time = new Date(event.timestamp).toLocaleString();
    console.log(`[${time}] ${event.type}`);
    if (event.mode) console.log(`  Mode: ${event.mode}`);
    if (event.role) console.log(`  Role: ${event.role}`);
    if (event.deviceId) console.log(`  Device: ${event.deviceId}`);
    if (Object.keys(event.payload).length > 0) {
      console.log(`  Payload: ${JSON.stringify(event.payload, null, 2).split('\n').join('\n    ')}`);
    }
    console.log('');
  });
}

async function handleReadinessCommand(): Promise<void> {
  console.log('Running system readiness checks...');
  console.log('');

  const report: ReadinessReport = await runSystemReadiness();
  report.checks.forEach((check) => {
    const statusIcon =
      check.status === 'pass' ? '✓' : check.status === 'warn' ? '⚠️' : '✗';
    console.log(`${statusIcon} ${check.title} (${check.id})`);
    console.log(`   Status: ${check.status}`);
    console.log(`   Details: ${check.details}`);
    if (check.metadata) {
      console.log(`   Metadata: ${JSON.stringify(check.metadata)}`);
    }
    console.log('');
  });

  const overallIcon =
    report.overallStatus === 'pass' ? '✅' : report.overallStatus === 'warn' ? '⚠️' : '❌';
  console.log(`${overallIcon} Overall status: ${report.overallStatus}`);
  console.log(`Generated at: ${report.generatedAt}`);
}

function parseOptions(args: string[]): Record<string, string> {
  const options: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        options[key] = value;
        i++;
      } else {
        options[key] = 'true';
      }
    }
  }
  return options;
}

function parseFilter(filterStr: string): any {
  const filter: any = {};
  const parts = filterStr.split(',');
  for (const part of parts) {
    const [key, value] = part.split(':');
    if (key && value) {
      filter[key.trim()] = value.trim();
    }
  }
  return filter;
}

function printHelp() {
  console.log(`
Orb CLI - Multi-device orchestration

Usage:
  orb <command> [options]

Commands:
  run <subcommand>     Run flows or agent missions
    demo-flow          Run the demo flow
    agent-mission      Run an agent mission (spawns Cursor session)

  insights             Show adaptation insights and patterns
  events               Query and display events
  readiness            Run system readiness checks
  help                 Show this help message

Examples:
  orb run demo-flow --prompt="Hello" --mode=forge
  orb run agent-mission --agent=luna --task=persist-store
  orb insights --filter=mode:forge
  orb events --limit=50
  orb readiness

Options:
  --userId <id>        User ID (default: default-user)
  --sessionId <id>     Session ID (default: auto-generated)
  --prompt <text>      Prompt text
  --mode <mode>        Mode (default, forge, explorer, etc.)
  --deviceId <device>  Device (sol, luna, mars, earth)
  --filter <filter>    Filter string (e.g., "mode:forge,role:mav")
  --limit <number>     Limit results (default: 20)
  --agent <name>       Agent name for missions
  --task <name>        Task name for missions
`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

