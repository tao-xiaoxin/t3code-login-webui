import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';

test('gateway renews active sessions, rejects expiry, and revokes on logout', async () => {
  const dir = await mkdtemp(join(tmpdir(), 't3-gw-'));
  const socketPath = join(dir, 'gateway.sock');
  const child = spawn(process.execPath, [fileURLToPath(new URL('./login-gateway.mjs', import.meta.url))], {
    env: {
      T3CODE_GATEWAY_SOCKET: socketPath,
      T3CODE_LOGIN_ORIGIN: 'https://test.example',
      T3CODE_LOGIN_USER: 'example',
      T3CODE_LOGIN_PASSWORD: 'test-password',
      T3CODE_CSRF_TOKEN: 'test-csrf',
      T3CODE_UPSTREAM_TOKEN: 'test-bearer',
      T3CODE_SESSION_TTL: '6',
      T3CODE_SESSION_RENEW: '3',
    },
    stdio: 'ignore',
  });
  const done = once(child, 'exit');
  function hit(path, headers = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = request({ socketPath, path, headers, method, timeout: 2000 }, (res) => {
        res.resume(); res.on('end', () => resolve(res));
      });
      req.on('error', reject); req.on('timeout', () => req.destroy(Error('gateway timed out'))); req.end();
    });
  }
  const signIn = (origin, login) => hit('/signin', { origin, 'x-csrf-token': 'test-csrf', 'x-t3code-login': login }, 'POST');
  try {
    for (let n = 0; ; n++) {
      try { if ((await stat(socketPath)).isSocket()) break; } catch (e) { if (e.code !== 'ENOENT') throw e; }
      assert.ok(n < 80 && child.exitCode === null, 'gateway socket did not start'); await delay(25);
    }
    assert.equal((await hit('/check')).statusCode, 401);
    assert.equal((await signIn('https://other.example', 'example:test-password')).statusCode, 403);
    assert.equal((await signIn('https://test.example', 'example:invalid')).statusCode, 401);
    const first = await signIn('https://test.example', 'example:test-password');
    assert.equal(first.statusCode, 201);
    const cookie = first.headers['set-cookie'][0].split(';', 1)[0];
    assert.ok(!first.headers['x-t3code-upstream']);
    assert.equal((await hit('/check', { cookie })).headers['x-t3code-upstream'], 'Bearer test-bearer');
    await delay(1100);
    assert.match((await hit('/check', { cookie, 'x-t3code-renew': 'yes' })).headers['set-cookie'][0], /Max-Age=3/);
    assert.equal((await hit('/logout', { cookie })).statusCode, 303);
    assert.equal((await hit('/check', { cookie })).statusCode, 401);
    const second = await signIn('https://test.example', 'example:test-password');
    const fresh = second.headers['set-cookie'][0].split(';', 1)[0];
    await delay(3200);
    const expired = await hit('/check', { cookie: fresh, 'x-t3code-renew': 'yes' });
    assert.equal(expired.statusCode, 401);
    assert.equal(expired.headers['set-cookie'], undefined);
    assert.equal(expired.headers['x-t3code-upstream'], undefined);
  } finally {
    if (child.exitCode === null) { child.kill(); await done; }
    await rm(dir, { recursive: true });
  }
});
