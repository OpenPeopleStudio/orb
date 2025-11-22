/**
 * Orb Web - Main Shell Application
 * 
 * Demonstrates Sol/Te/Mav/Luna views and basic interactions.
 */

import { OrbRole, createOrbContext, runSystemReadiness } from '@orb-system/core-orb';
import { modelClient } from '@orb-system/core-sol';
import { reflectionService, memoryService } from '@orb-system/core-te';
import { taskService, calendarService } from '@orb-system/core-mav';
import { modeService, personaClassifier, Mode, Persona } from '@orb-system/core-luna';

async function main() {
  console.log('=== Orb System Shell ===\n');
  
  const sessionId = 'demo-session-123';
  const deviceId = 'demo-device-456';
  
  // Create contexts for each role
  const solCtx = createOrbContext(OrbRole.SOL, sessionId, { deviceId });
  const teCtx = createOrbContext(OrbRole.TE, sessionId, { deviceId });
  const mavCtx = createOrbContext(OrbRole.MAV, sessionId, { deviceId });
  const lunaCtx = createOrbContext(OrbRole.LUNA, sessionId, { deviceId });
  
  console.log('1. SOL (Inference/Engine)');
  console.log('   Generating insight...');
  const insight = await modelClient.generateInsight(
    solCtx,
    [],
    [],
    [],
    [],
    { rawValue: 'Personal' },
    { rawValue: 'Sol' }
  );
  console.log(`   Insight: ${insight}\n`);
  
  console.log('2. TE (Reflection/Memory)');
  console.log('   Adding reflection...');
  await reflectionService.addReflection(teCtx, 'This is a test reflection', {
    persona: 'Personal',
    mode: 'Sol',
  });
  console.log('   Reflection added\n');
  
  console.log('3. MAV (Actions/Tools)');
  console.log('   Adding task...');
  await taskService.addTask(mavCtx, 'Complete Orb system migration', 'Personal');
  console.log('   Task added\n');
  
  console.log('4. LUNA (Preferences/Intent)');
  console.log('   Setting mode...');
  await modeService.setMode(lunaCtx, Mode.SOL, 'Personal');
  const currentMode = modeService.getCurrentMode();
  console.log(`   Current mode: ${currentMode}\n`);

  console.log('5. SYSTEM READINESS');
  const readiness = await runSystemReadiness();
  readiness.checks.forEach((check) => {
    console.log(`   - ${check.title}: ${check.status.toUpperCase()} (${check.details})`);
  });
  console.log(`   Overall: ${readiness.overallStatus.toUpperCase()}`);
  console.log(`   Generated at: ${readiness.generatedAt}\n`);
  
  console.log('=== Orb System Demo Complete ===');
}

main().catch(console.error);

