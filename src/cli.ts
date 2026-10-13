#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs';
import { inferInvariants } from './domain/invariantInferrer.js';
import { generatePropertyTestScript } from './domain/propertyTestGenerator.js';
import { generateSmtLibProof } from './domain/smtGenerator.js';
import { StateModel } from './domain/types.js';
import { runMcpServer } from './mcp/server.js';

const program = new Command();

program
  .name('fva')
  .description('Formal Verification & Invariant Engineering Anything: Discover invariants & emit proofs.')
  .version('1.0.0');

program
  .command('inspect <file>')
  .description('Inspect state model and discover mathematical invariants')
  .action((file) => {
    const model: StateModel = JSON.parse(fs.readFileSync(file, 'utf8'));
    const invariants = inferInvariants(model);

    console.log(`\n🛡️ FVA Formal Invariant Inferrer: ${model.name}`);
    console.log(`===============================================`);
    console.log(`State Variables: ${model.stateVariables.length}`);
    console.log(`Transitions:     ${model.transitions.length}`);
    console.log(`Invariants:      ${invariants.length}\n`);

    for (const inv of invariants) {
      console.log(`  [${inv.kind.padEnd(12)}] ${inv.id}: ${inv.formula}`);
      console.log(`      └─ ${inv.description}`);
    }
    console.log();
  });

program
  .command('property-test <file>')
  .description('Synthesize property-based fuzz test suite')
  .option('-o, --output <path>', 'Output file', 'invariants.test.ts')
  .action((file, opts) => {
    const model: StateModel = JSON.parse(fs.readFileSync(file, 'utf8'));
    const invariants = inferInvariants(model);
    const code = generatePropertyTestScript(model, invariants);
    fs.writeFileSync(opts.output, code, 'utf8');
    console.log(`✅ Property-based test suite written to: ${opts.output}`);
  });

program
  .command('smt <file>')
  .description('Generate SMT-LIB 2.0 proof script for Z3')
  .option('-o, --output <path>', 'Output file', 'proof.smt2')
  .action((file, opts) => {
    const model: StateModel = JSON.parse(fs.readFileSync(file, 'utf8'));
    const invariants = inferInvariants(model);
    const smt = generateSmtLibProof(model, invariants);
    fs.writeFileSync(opts.output, smt, 'utf8');
    console.log(`✅ SMT-LIB 2.0 proof script written to: ${opts.output}`);
  });

program
  .command('mcp')
  .description('Start FVA Model Context Protocol (MCP) server over stdio')
  .action(() => {
    runMcpServer();
  });

program.parse(process.argv);
