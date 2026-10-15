import test from 'node:test';
import assert from 'node:assert/strict';
import { club, filterSessions, mapUrl, planText, validateClub } from '../club.js';

test('published proposals clearly say they are not confirmed invitations when shared', () => {
  for (const session of club.sessions.filter((session) => !session.confirmed)) {
    const shared = planText(session);
    assert.match(shared, /no es una convocatoria confirmada/);
    assert.match(shared, /Espera la confirmación/);
    assert.ok(shared.includes(session.time));
    assert.ok(shared.includes(session.meetingPoint));
  }
});

test('social and long-run filters show the correct plans and preserve all plans', () => {
  assert.equal(filterSessions(club.sessions, 'all').length, 3);
  assert.deepEqual(filterSessions(club.sessions, 'social').map((session) => session.id), ['cafe', 'rio']);
  assert.deepEqual(filterSessions(club.sessions, 'long').map((session) => session.id), ['largo']);
  assert.deepEqual(filterSessions(club.sessions, 'unknown'), []);
});

test('map destinations retain the intended Madrid meeting-point query', () => {
  for (const session of club.sessions) {
    const url = new URL(mapUrl(session));
    assert.equal(url.origin, 'https://www.google.com');
    assert.equal(url.searchParams.get('query'), session.mapQuery);
  }
});

test('invalid configuration cannot publish duplicate plans or unsafe community links', () => {
  assert.equal(validateClub(club), true);
  assert.throws(() => validateClub({ ...club, sessions: [club.sessions[0], club.sessions[0]] }), /Duplicate/);
  assert.throws(() => validateClub({ ...club, community: [{ label: 'Test', url: 'javascript:alert(1)' }] }), /HTTPS/);
  assert.throws(() => validateClub({ ...club, sessions: [{ ...club.sessions[0], time: '25:00' }] }), /Invalid time/);
});
