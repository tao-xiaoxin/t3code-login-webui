import { createServer } from 'node:http';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { chmodSync } from 'node:fs';

const required = (key) => {
  if (!process.env[key]) throw new Error(`Missing configuration: ${key}`);
  return process.env[key];
};
const seconds = (key) => {
  const value = Number(required(key));
  if (!Number.isSafeInteger(value) || value < 1 || value > 2_592_000) throw new Error(`Invalid configuration: ${key}`);
  return value;
};
const socket = required('T3CODE_GATEWAY_SOCKET');
const origin = required('T3CODE_LOGIN_ORIGIN');
const csrf = required('T3CODE_CSRF_TOKEN');
const bearer = required('T3CODE_UPSTREAM_TOKEN');
if (!/^[A-Za-z0-9._~+/=-]+$/.test(bearer)) throw new Error('Invalid upstream token format');
const hash = (value) => createHash('sha256').update(value).digest();
const loginHash = hash(`${required('T3CODE_LOGIN_USER')}:${required('T3CODE_LOGIN_PASSWORD')}`);
const csrfHash = hash(csrf);
const ttl = seconds('T3CODE_SESSION_TTL');
const idle = seconds('T3CODE_SESSION_RENEW');
if (idle > ttl) throw new Error('Session renewal window exceeds maximum lifetime');
const name = '__Host-t3code_session';
const sessions = new Map();
const cookie = (value, maxAge) => `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
const reply = (res, status, body) => {
  res.setHeader('Cache-Control', 'no-store');
  if (body) res.setHeader('Content-Type', 'application/json');
  res.writeHead(status).end(body ? JSON.stringify(body) : undefined);
};
const idOf = (req) => /(?:^|;\s*)__Host-t3code_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie ?? '')?.[1];
const second = () => Math.floor(Date.now() / 1000);
const sweep = (now) => {
  for (const [id, session] of sessions) if (session.expires <= now) sessions.delete(id);
};
setInterval(() => sweep(second()), 60_000).unref();

const server = createServer({ requestTimeout: 5000, maxHeaderSize: 8192 }, (req, res) => {
  req.resume();
  const id = idOf(req), now = second();
  if (req.url === '/csrf' && req.method === 'GET') return reply(res, 200, { csrfToken: csrf });
  if (req.url === '/signin' && req.method === 'POST') {
    if (req.headers.origin !== origin || !timingSafeEqual(hash(req.headers['x-csrf-token'] ?? ''), csrfHash)) return reply(res, 403);
    if (!timingSafeEqual(hash(req.headers['x-t3code-login'] ?? ''), loginHash)) return reply(res, 401);
    sweep(now);
    if (id) sessions.delete(id);
    if (sessions.size >= 1024) return reply(res, 503);
    const next = randomBytes(32).toString('hex');
    sessions.set(next, { deadline: now + ttl, expires: now + idle });
    res.setHeader('Set-Cookie', cookie(next, idle));
    return reply(res, 201, { redirectTo: '/' });
  }
  if (req.url === '/check' && req.method === 'GET') {
    const session = sessions.get(id);
    if (!session || session.expires <= now) {
      if (id) sessions.delete(id);
      return reply(res, 401);
    }
    const remaining = Math.min(idle, session.deadline - now);
    if (req.headers['x-t3code-renew'] === 'yes' && now + remaining > session.expires) {
      session.expires = now + remaining;
      res.setHeader('Set-Cookie', cookie(id, remaining));
    }
    res.setHeader('X-T3Code-Upstream', `Bearer ${bearer}`);
    return reply(res, 204);
  }
  if (req.url === '/logout' && req.method === 'GET') {
    if (['cross-site', 'same-site'].includes(req.headers['sec-fetch-site'])) return reply(res, 403);
    if (id) sessions.delete(id);
    res.setHeader('Set-Cookie', cookie('', 0));
    res.setHeader('Location', '/login');
    return reply(res, 303);
  }
  return reply(res, 404);
});
server.listen(socket, () => chmodSync(socket, 0o660));
