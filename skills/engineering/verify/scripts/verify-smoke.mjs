#!/usr/bin/env node
// skills/engineering/verify/scripts/verify-smoke.mjs
// Generalized readiness probe and end-to-end smoke verification for HTTP & GraphQL stacks.
// Zero external dependencies (uses native fetch in Node 20+ and node:child_process).

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SLUG_RE = /^[a-zA-Z0-9._-]+$/;
const DEFAULT_CSRF_HEADER = { 'x-requested-with': 'XmlHttpRequest', 'content-type': 'application/json' };
const GQL_HEALTH_QUERY = JSON.stringify({ query: 'query HealthCheck { __typename }' });

export function parseCliArgs(argv = process.argv.slice(2)) {
  const parsed = {
    urls: [],
    graphqlUrls: [],
    csrfHeader: 'x-requested-with:XmlHttpRequest',
    timeoutMs: null,
    pollIntervalMs: null,
    configPath: null,
    selfTest: false,
    silent: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--self-test') {
      parsed.selfTest = true;
    } else if (arg === '--silent') {
      parsed.silent = true;
    } else if (arg === '--url' && argv[i + 1]) {
      parsed.urls.push(argv[++i]);
    } else if (arg === '--graphql-url' && argv[i + 1]) {
      parsed.graphqlUrls.push(argv[++i]);
    } else if (arg === '--csrf-header' && argv[i + 1]) {
      parsed.csrfHeader = argv[++i];
    } else if (arg === '--timeout' && argv[i + 1]) {
      parsed.timeoutMs = parseInt(argv[++i], 10) || null;
    } else if (arg === '--interval' && argv[i + 1]) {
      parsed.pollIntervalMs = parseInt(argv[++i], 10) || null;
    } else if (arg === '--config' && argv[i + 1]) {
      parsed.configPath = argv[++i];
    }
  }

  return parsed;
}

export function parseHeaderPair(headerStr) {
  if (!headerStr || typeof headerStr !== 'string') return { ...DEFAULT_CSRF_HEADER };
  const idx = headerStr.indexOf(':');
  if (idx === -1) return { ...DEFAULT_CSRF_HEADER };
  const key = headerStr.slice(0, idx).trim().toLowerCase();
  const val = headerStr.slice(idx + 1).trim();
  if (!key || !val) return { ...DEFAULT_CSRF_HEADER };
  return { [key]: val, 'content-type': 'application/json' };
}

export function resolveEndpoints(rootDir = process.cwd(), cliArgs = {}) {
  const smokeConfigPath = cliArgs.configPath
    ? resolve(rootDir, cliArgs.configPath)
    : resolve(rootDir, '.smoke.json');

  if (existsSync(smokeConfigPath)) {
    try {
      const cfg = JSON.parse(readFileSync(smokeConfigPath, 'utf8'));
      return {
        appName: cfg.appName || 'app',
        webBaseUrl: cfg.webBaseUrl || null,
        apiBaseUrl: cfg.apiBaseUrl || null,
        customProbes: Array.isArray(cfg.probes) ? cfg.probes : null,
        timeoutMs: cfg.timeoutMs || null,
        pollIntervalMs: cfg.pollIntervalMs || null,
      };
    } catch {
      // Fall back to .worktree.json / .env
    }
  }

  const wtPath = resolve(rootDir, '.worktree.json');
  let webPort = 3002;
  let apiPort = 3333;
  let appName = 'app-stack';

  if (existsSync(wtPath)) {
    try {
      const wt = JSON.parse(readFileSync(wtPath, 'utf8'));
      if (wt.name && SLUG_RE.test(wt.name)) {
        appName = wt.name;
      }
      if (wt.webPort && Number.isInteger(wt.webPort) && wt.webPort > 0 && wt.webPort < 65536) {
        webPort = wt.webPort;
      }
      if (wt.apiPort && Number.isInteger(wt.apiPort) && wt.apiPort > 0 && wt.apiPort < 65536) {
        apiPort = wt.apiPort;
      }
    } catch {
      // Fall back to .env
    }
  } else {
    const envPath = resolve(rootDir, '.env');
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf8');
        for (const line of envContent.split('\n')) {
          const match = line.match(/^\s*(PORT|API_PORT|DEV_PORT|WEB_PORT|APP_NAME)\s*=\s*(.*?)\s*$/);
          if (match) {
            const [, key, val] = match;
            const cleaned = val.replace(/^["']|["']$/g, '');
            if (key === 'PORT' || key === 'API_PORT') apiPort = parseInt(cleaned, 10) || apiPort;
            if (key === 'DEV_PORT' || key === 'WEB_PORT') webPort = parseInt(cleaned, 10) || webPort;
            if (key === 'APP_NAME' && SLUG_RE.test(cleaned)) appName = cleaned;
          }
        }
      } catch {
        // Fall back to defaults
      }
    }
  }

  const isDocker = existsSync('/.dockerenv');
  const defaultWebHost = isDocker && !existsSync(wtPath) ? 'web' : 'localhost';
  const defaultApiHost = isDocker && !existsSync(wtPath) ? 'api' : 'localhost';

  return {
    appName,
    webBaseUrl: process.env.WEB_BASE_URL || `http://${defaultWebHost}:${webPort}`,
    apiBaseUrl: process.env.API_BASE_URL || `http://${defaultApiHost}:${apiPort}`,
    customProbes: null,
    timeoutMs: null,
    pollIntervalMs: null,
  };
}

export function buildProbes({ webBaseUrl, apiBaseUrl, customProbes = null, cliArgs = {} }) {
  const csrfHeaders = parseHeaderPair(cliArgs.csrfHeader);

  if (
    (Array.isArray(cliArgs.urls) && cliArgs.urls.length > 0) ||
    (Array.isArray(cliArgs.graphqlUrls) && cliArgs.graphqlUrls.length > 0)
  ) {
    const probes = [];
    for (const url of cliArgs.urls || []) {
      probes.push({
        name: `HTTP GET ${url}`,
        url,
        method: 'GET',
        headers: {},
        validate: (res) => res.status >= 200 && res.status < 400,
      });
    }
    for (const gqlUrl of cliArgs.graphqlUrls || []) {
      probes.push({
        name: `GraphQL Introspection ${gqlUrl}`,
        url: gqlUrl,
        method: 'POST',
        headers: csrfHeaders,
        body: GQL_HEALTH_QUERY,
        validate: async (res) => {
          if (res.status !== 200) return false;
          const data = await res.json();
          return data?.data?.__typename !== undefined;
        },
      });
    }
    return probes;
  }

  if (Array.isArray(customProbes) && customProbes.length > 0) {
    return customProbes.map((p, idx) => {
      const isGql = p.type === 'graphql';
      const allowedStatuses = Array.isArray(p.expectStatus) ? p.expectStatus : [200, 302, 307];
      return {
        name: p.name || `Probe #${idx + 1} (${p.url})`,
        url: p.url,
        method: p.method || (isGql ? 'POST' : 'GET'),
        headers: isGql ? parseHeaderPair(p.csrfHeader || cliArgs.csrfHeader) : p.headers || {},
        body: isGql ? GQL_HEALTH_QUERY : p.body,
        validate: isGql
          ? async (res) => {
              if (res.status !== 200) return false;
              const data = await res.json();
              return data?.data?.__typename !== undefined;
            }
          : (res) => allowedStatuses.includes(res.status),
      };
    });
  }

  return [
    {
      name: 'Web Landing Page',
      url: `${webBaseUrl}/`,
      method: 'GET',
      headers: {},
      validate: (res) => res.status === 200 || res.status === 307 || res.status === 302,
    },
    {
      name: 'API GraphQL Schema Introspection',
      url: `${apiBaseUrl}/graphql`,
      method: 'POST',
      headers: csrfHeaders,
      body: GQL_HEALTH_QUERY,
      validate: async (res) => {
        if (res.status !== 200) return false;
        const data = await res.json();
        return data?.data?.__typename !== undefined;
      },
    },
    {
      name: 'Web Login Route',
      url: `${webBaseUrl}/login`,
      method: 'GET',
      headers: {},
      validate: (res) => res.status === 200,
    },
    {
      name: 'Web Proxy GraphQL Endpoint',
      url: `${webBaseUrl}/api/graphql`,
      method: 'POST',
      headers: csrfHeaders,
      body: GQL_HEALTH_QUERY,
      validate: async (res) => {
        if (res.status !== 200) return false;
        const data = await res.json();
        return data?.data?.__typename !== undefined;
      },
    },
  ];
}

export async function runSmokeCheck(options = {}, adapters = {}) {
  const cliArgs = options.cliArgs || {};
  const rootDir = options.rootDir || process.cwd();
  const resolved = resolveEndpoints(rootDir, cliArgs);

  const timeoutMs = options.timeoutMs || cliArgs.timeoutMs || resolved.timeoutMs || 120_000;
  const pollIntervalMs = options.pollIntervalMs || cliArgs.pollIntervalMs || resolved.pollIntervalMs || 1800;
  const silent = Boolean(options.silent || cliArgs.silent);

  const fetchFn = adapters.fetch || globalThis.fetch;
  const logFn = adapters.log || (silent ? () => {} : console.log);
  const errFn = adapters.error || console.error;
  const dumpLogsFn =
    adapters.dumpLogs ||
    (() => {
      try {
        logFn('\n--- Docker Container Logs on Failure ---');
        const logs = execFileSync('docker', ['compose', 'logs', '--tail=100'], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        errFn(logs);
      } catch (err) {
        errFn(`Failed to retrieve container logs: ${err.message}`);
      }
    });

  const probes = buildProbes({
    webBaseUrl: resolved.webBaseUrl,
    apiBaseUrl: resolved.apiBaseUrl,
    customProbes: resolved.customProbes,
    cliArgs,
  });

  logFn(`[verify-smoke] Targeting stack: ${resolved.appName} (${probes.length} probe(s))`);

  const startTime = Date.now();
  let round = 0;

  while (Date.now() - startTime < timeoutMs) {
    round++;
    let allPassed = true;
    const failures = [];

    for (const probe of probes) {
      try {
        const res = await fetchFn(probe.url, {
          method: probe.method,
          headers: probe.headers,
          body: probe.body,
        });
        const isValid = await probe.validate(res);
        if (!isValid) {
          allPassed = false;
          failures.push(`${probe.name} returned status ${res.status}`);
        }
      } catch (err) {
        allPassed = false;
        failures.push(`${probe.name} connection error: ${err.message}`);
      }
    }

    if (allPassed) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      logFn(`✅ [verify-smoke] All ${probes.length} readiness probe(s) succeeded in ${elapsed}s (round ${round})!`);
      return { success: true, elapsedSeconds: parseFloat(elapsed), rounds: round, probeCount: probes.length };
    }

    if (round % 5 === 1) {
      logFn(`[verify-smoke] Waiting for services... (${failures[0]})`);
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  errFn(`❌ [verify-smoke] Timed out after ${(timeoutMs / 1000).toFixed(0)}s waiting for services.`);
  dumpLogsFn();
  throw new Error(`Smoke verification failed: services did not become ready within ${timeoutMs / 1000}s`);
}

export async function runSelfTest() {
  console.log('Running verify-smoke self-test...');

  // Test 1: Default endpoint resolution
  const endpoints = resolveEndpoints('/tmp');
  if (!endpoints.webBaseUrl.includes(':3002') || !endpoints.apiBaseUrl.includes(':3333')) {
    throw new Error(`Self-test failed: endpoint defaults unexpected (${JSON.stringify(endpoints)})`);
  }

  // Test 2: CLI flag parsing & custom probe generation
  const cli = parseCliArgs([
    '--url',
    'http://localhost:8000/health',
    '--graphql-url',
    'http://localhost:8000/graphql',
    '--csrf-header',
    'x-csrf-token:test123',
    '--timeout',
    '5000',
  ]);
  const customProbes = buildProbes({
    webBaseUrl: endpoints.webBaseUrl,
    apiBaseUrl: endpoints.apiBaseUrl,
    cliArgs: cli,
  });
  if (customProbes.length !== 2 || customProbes[1].headers['x-csrf-token'] !== 'test123') {
    throw new Error(`Self-test failed: custom CLI probes mismatch (${JSON.stringify(customProbes)})`);
  }

  // Test 3: Successful probe execution with mock adapter
  const mockFetchSuccess = async (url, options) => {
    if (url.includes('/graphql')) {
      if (!options.headers['x-requested-with']) {
        return { status: 403, json: async () => ({ error: 'CSRF blocked' }) };
      }
      return { status: 200, json: async () => ({ data: { __typename: 'Query' } }) };
    }
    return { status: 200, json: async () => ({}) };
  };

  const successResult = await runSmokeCheck(
    { timeoutMs: 5000, pollIntervalMs: 10, silent: true, rootDir: '/tmp' },
    { fetch: mockFetchSuccess, log: () => {}, error: () => {} },
  );

  if (!successResult.success || successResult.rounds !== 1 || successResult.probeCount !== 4) {
    throw new Error(`Self-test failed: expected success on round 1, got ${JSON.stringify(successResult)}`);
  }

  // Test 4: Timeout handling and failure dump callback
  let dumpLogsCalled = false;
  const mockFetchFailure = async () => {
    throw new Error('Connection refused');
  };

  try {
    await runSmokeCheck(
      { timeoutMs: 80, pollIntervalMs: 15, silent: true, rootDir: '/tmp' },
      {
        fetch: mockFetchFailure,
        log: () => {},
        error: () => {},
        dumpLogs: () => {
          dumpLogsCalled = true;
        },
      },
    );
    throw new Error('Self-test failed: expected runSmokeCheck to throw on timeout');
  } catch {
    if (!dumpLogsCalled) {
      throw new Error('Self-test failed: dumpLogs was not called on timeout');
    }
  }

  console.log('✅ verify-smoke self-test passed (default probes, CLI custom probes, CSRF headers, and timeout diagnostics verified).');
}

const cliArgs = parseCliArgs();
if (cliArgs.selfTest) {
  runSelfTest().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else if (process.argv[1] && process.argv[1].endsWith('verify-smoke.mjs')) {
  runSmokeCheck({ cliArgs }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
