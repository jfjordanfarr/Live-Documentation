#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const gitCommand = 'git';

function runStep(label, command, args, options = {}) {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const exitCode = typeof result.status === 'number' ? result.status : 1;
    throw new Error(`${label} failed with exit code ${exitCode}`);
  }
}

function runNpmScript(label, args, envOverrides = {}) {
  const npmArgs = Array.isArray(args) ? args : [args];
  const npmExecPath = process.env.npm_execpath;
  const useNodeShim = Boolean(npmExecPath && npmExecPath.endsWith('.js'));
  const options = {
    env: { ...process.env, ...envOverrides },
    shell: useNodeShim ? false : process.platform === 'win32'
  };

  if (useNodeShim && npmExecPath) {
    runStep(label, process.execPath, [npmExecPath, ...npmArgs], options);
  } else {
    runStep(label, npmCommand, npmArgs, options);
  }
}

function runSafeCommitCheck() {
  const flags = parseFlags(process.argv.slice(2));

  try {
    const verifyArgs = ['run', 'verify'];
    if (flags.mode || flags.generateReport) {
      verifyArgs.push('--');
      if (flags.mode) {
        verifyArgs.push('--mode', flags.mode);
      }
      if (flags.generateReport) {
        verifyArgs.push('--report');
      }
    }

    runNpmScript('Verify (lint + unit + integration)', verifyArgs);

    if (flags.includeBenchmarks) {
      runStep(
        'Regenerate benchmark fixtures',
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        [
          'tsx',
          '--tsconfig',
          './tsconfig.base.json',
          './scripts/fixture-tools/regenerate-benchmarks.ts',
          '--write'
        ],
        { shell: process.platform === 'win32' }
      );

      const benchmarkArgs = ['run', 'test:benchmarks'];
      if (flags.benchmarkArgs.length > 0) {
        benchmarkArgs.push('--', ...flags.benchmarkArgs);
      }
      const benchmarkEnv = {
        BENCHMARK_SKIP_REGENERATE: '1'
      };
      if (flags.mode) {
        benchmarkEnv.BENCHMARK_MODE = flags.mode;
      }
      runNpmScript('Benchmarks', benchmarkArgs, benchmarkEnv);

      if (
        flags.benchmarkArgs.length === 0 &&
        (!flags.mode || flags.mode === 'self-similarity')
      ) {
        runNpmScript(
          'Benchmarks (AST mode)',
          ['run', 'test:benchmarks', '--', '--suite', 'ast'],
          {
            BENCHMARK_MODE: 'ast',
            BENCHMARK_SKIP_REGENERATE: '1'
          }
        );
      }
    }
    runNpmScript('Live Docs regeneration', ['run', 'live-docs:generate']);
    runNpmScript('Graph snapshot', ['run', 'graph:snapshot', '--', '--quiet']);
    runNpmScript('Graph coverage audit', ['run', 'graph:audit']);
    runNpmScript('Fixture workspace verification', ['run', 'fixtures:verify'], {
      FIXTURES_VERIFY_QUIET: '1'
    });
    runNpmScript('Documentation link enforcement', ['run', 'docs:links:enforce']);
    runNpmScript('Live Docs pipeline (lint + report)', ['run', 'livedocs', '--', '--skip-generate', '--report']);
    runNpmScript('SlopCop markdown audit', ['run', 'slopcop:markdown']);
    runNpmScript('SlopCop asset audit', ['run', 'slopcop:assets']);
    runNpmScript('SlopCop symbol audit', ['run', 'slopcop:symbols']);
    runNpmScript('Technical debt detection', ['run', 'tech-debt', '--', '--stale-limit', '10']);

    if (flags.generateReport) {
      const reportModes = resolveReportModes(flags.mode);
      for (const reportMode of reportModes) {
        const reportEnv = { ...process.env };
        if (flags.mode) {
          reportEnv.BENCHMARK_MODE = flags.mode;
        }
        runStep(
          `Generate test report (${reportMode})`,
          process.platform === 'win32' ? 'npx.cmd' : 'npx',
          [
            'tsx',
            '--tsconfig',
            './tsconfig.base.json',
            './scripts/reporting/generateTestReport.ts',
            '--mode',
            reportMode
          ],
          {
            env: reportEnv,
            shell: process.platform === 'win32'
          }
        );
      }
    }
  } catch (error) {
    console.error('\nSafe to commit check failed.');
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }

  if (flags.skipGitStatus) {
    console.log('\nSkipping git status summary (CI mode).');
    console.log('Safe to commit? Tests and lint gates passed.');
    return;
  }

  const statusResult = spawnSync(gitCommand, ['status', '-sb'], { encoding: 'utf-8' });
  if (statusResult.error) {
    console.error('\nFailed to read git status.');
    console.error(statusResult.error.message);
    process.exit(1);
  }
  if (statusResult.status !== 0) {
    console.error('\nFailed to read git status.');
    process.exit(typeof statusResult.status === 'number' ? statusResult.status : 1);
  }

  const output = statusResult.stdout.trim();
  console.log('\n=== git status -sb ===');
  if (output.length === 0) {
    console.log('Working tree clean.');
    console.log('\nSafe to commit? YES — tests passed and the working tree is clean.');
  } else {
    console.log(output);
    console.log('\nSafe to commit? Tests passed. Review the working tree above before committing.');
  }
}

runSafeCommitCheck();

function parseFlags(argv) {
  let skipGitStatus = coerceBoolean(process.env.npm_config_skip_git_status) ?? false;
  let mode =
    normalizeMode(process.env.BENCHMARK_MODE ?? process.env.npm_config_mode) ??
    'self-similarity';
  let generateReport = coerceBoolean(process.env.npm_config_report) ?? false;
  let includeBenchmarks = coerceBoolean(process.env.npm_config_benchmarks) ?? false;
  const benchmarkArgs = [];
  let reportPreference = 'default';

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--skip-git-status' || token === '--ci') {
      skipGitStatus = true;
      continue;
    }

    if (token === '--no-skip-git-status') {
      skipGitStatus = false;
      continue;
    }

    if (token === '--mode') {
      const value = argv[index + 1];
      if (!value) {
        console.error('--mode requires a value');
        process.exit(1);
      }
      const resolved = normalizeMode(value);
      if (!resolved) {
        console.error(`Invalid mode: ${value}`);
        process.exit(1);
      }
      mode = resolved;
      index += 1;
      continue;
    }

    if (token.startsWith('--mode=')) {
      const [, value] = token.split('=', 2);
      if (!value) {
        console.error('--mode requires a value');
        process.exit(1);
      }
      const resolved = normalizeMode(value);
      if (!resolved) {
        console.error(`Invalid mode: ${value}`);
        process.exit(1);
      }
      mode = resolved;
      continue;
    }

    if (token === '--report') {
      generateReport = true;
      reportPreference = 'force';
      continue;
    }

    if (token === '--no-report') {
      generateReport = false;
      reportPreference = 'skip';
      continue;
    }

    if (token === '--benchmarks') {
      includeBenchmarks = true;
      continue;
    }

    if (token === '--no-benchmarks') {
      includeBenchmarks = false;
      continue;
    }

    if (token === '--suite' || token.startsWith('--suite=')) {
      const value = token.includes('=') ? token.split('=', 2)[1] : argv[index + 1];
      if (!value) {
        console.error('--suite requires a value');
        process.exit(1);
      }
      benchmarkArgs.push('--suite', value);
      if (!token.includes('=')) {
        index += 1;
      }
      continue;
    }

    if (!token.startsWith('-')) {
      const resolved = normalizeMode(token);
      if (!resolved) {
        console.error(`Unknown argument: ${token}`);
        process.exit(1);
      }
      mode = resolved;
      continue;
    }

    console.error(`Unknown argument: ${token}`);
    process.exit(1);
  }

  if (!skipGitStatus && process.env.CI === 'true') {
    skipGitStatus = true;
  }

  if (includeBenchmarks && reportPreference !== 'skip') {
    generateReport = true;
  }

  return { skipGitStatus, mode, generateReport, includeBenchmarks, benchmarkArgs, reportPreference };
}

function normalizeMode(candidate) {
  if (!candidate) {
    return undefined;
  }
  const normalized = String(candidate).toLowerCase();
  if (['self-similarity', 'ast', 'all'].includes(normalized)) {
    return normalized;
  }
  return undefined;
}

function resolveReportModes(mode) {
  if (!mode || mode === 'self-similarity') {
    return ['self-similarity'];
  }
  if (mode === 'ast') {
    return ['ast'];
  }
  if (mode === 'all') {
    return ['self-similarity', 'ast'];
  }
  return [mode];
}

function coerceBoolean(value) {
  if (value === undefined) {
    return undefined;
  }
  const normalized = String(value).toLowerCase();
  if (['1', 'true', 'yes', 'on', ''].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return undefined;
}
