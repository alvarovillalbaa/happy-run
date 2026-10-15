// This is the only source of truth for club links and proposed sessions.
// Set a session to confirmed only after its time and meeting point are agreed.
export const club = {
  name: 'Happy Run',
  city: 'Madrid',
  community: [], // { label: 'Instagram', url: 'https://www.instagram.com/your-handle/' }
  sessions: [
    {
      id: 'cafe', category: 'social', title: 'Café con kilómetros',
      day: 'Sábado', dayShort: 'SÁB', weekday: 6, time: '10:00',
      distance: '5 km', pace: '6:00–7:00 min/km', durationMinutes: 75,
      place: 'El Retiro', meetingPoint: 'Puerta de la Independencia, lado del parque',
      mapQuery: 'Puerta de la Independencia Parque del Retiro Madrid',
      description: 'Una vuelta tranquila por el Retiro, conversación sin mirar el reloj y un café al terminar. El plan para estrenarte con el club.',
      detail: 'Proponemos un recorrido de unos 5 km, con paradas para reagruparnos. El café es opcional y cada persona paga el suyo.',
      icon: 'coffee', confirmed: false,
    },
    {
      id: 'rio', category: 'social', title: 'Fuera de la oficina',
      day: 'Miércoles', dayShort: 'MIÉ', weekday: 3, time: '19:30',
      distance: '6 km', pace: '5:30–6:30 min/km', durationMinutes: 60,
      place: 'Madrid Río', meetingPoint: 'Puente de Segovia, paseo peatonal de la orilla este',
      mapQuery: 'Puente de Segovia Madrid Rio',
      description: 'Cambia las pantallas por el río. Un rodaje al caer la tarde para soltar las piernas y conocer gente entre semana.',
      detail: 'Proponemos una ida y vuelta junto al Manzanares, con puntos para reagruparnos. Trae algo reflectante cuando anochezca.',
      icon: 'sun', confirmed: false,
    },
    {
      id: 'largo', category: 'long', title: 'Un poquito más lejos',
      day: 'Domingo', dayShort: 'DOM', weekday: 0, time: '09:00',
      distance: '10 km', pace: '5:30–6:30 min/km', durationMinutes: 90,
      place: 'Casa de Campo', meetingPoint: 'Puerta del Rey, acceso a Casa de Campo',
      mapQuery: 'Puerta del Rey Casa de Campo Madrid',
      description: 'El domingo se estira un poco. Más verde, más kilómetros y el mismo ritmo de conversación.',
      detail: 'Una propuesta para quienes ya se sienten cómodos con 10 km. El recorrido y las posibles opciones más cortas se confirmarán antes de la salida.',
      icon: 'route', confirmed: false,
    },
  ],
};

export function filterSessions(sessions, category) {
  return category === 'all' ? sessions : sessions.filter((session) => session.category === category);
}

export function planText(session) {
  return [
    `Happy Run · Madrid — ${session.title}`,
    session.confirmed ? 'Sesión semanal confirmada' : 'PLAN PROPUESTO — no es una convocatoria confirmada',
    `${session.day} · ${session.time} (hora de Madrid)`,
    `${session.distance} · ${session.pace}`,
    `${session.place} · ${session.meetingPoint}`,
    session.description,
    session.confirmed ? 'Comprueba los avisos del club antes de salir.' : 'Espera la confirmación del club antes de acudir.',
  ].join('\n');
}

export function mapUrl(session) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.mapQuery)}`;
}

export function validateClub(config) {
  const ids = new Set();
  for (const session of config.sessions) {
    if (ids.has(session.id)) throw new Error(`Duplicate session: ${session.id}`);
    ids.add(session.id);
    if (!/^[a-z0-9-]+$/.test(session.id)) throw new Error(`Invalid session ID: ${session.id}`);
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(session.time)) throw new Error(`Invalid time: ${session.id}`);
    if (typeof session.confirmed !== 'boolean') throw new Error(`Missing confirmation: ${session.id}`);
    if (!session.meetingPoint || !session.mapQuery) throw new Error(`Missing meeting point: ${session.id}`);
  }
  for (const link of config.community) {
    if (!link.label || new URL(link.url).protocol !== 'https:') throw new Error('Community links must have a label and HTTPS URL');
  }
  return true;
}
