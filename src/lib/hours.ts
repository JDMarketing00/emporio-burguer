import { store, type OpeningHours } from '../data/store';

export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const WEEKDAYS_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Dia da semana e minutos do dia no fuso da loja. */
export function storeNow(date = new Date()): { day: number; minutes: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: store.timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  } catch {
    return { day: date.getDay(), minutes: date.getHours() * 60 + date.getMinutes() };
  }
}

export interface OpenStatus {
  open: boolean;
  /** Frase curta: "Aberto · fecha às 23:45" / "Fechado · abre hoje às 18:00" */
  label: string;
  today: number;
}

function hoursFor(day: number): OpeningHours | undefined {
  return store.hours.find((h) => h.day === day);
}

export function getOpenStatus(date = new Date()): OpenStatus {
  const { day, minutes } = storeNow(date);
  const today = hoursFor(day);

  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (minutes >= open && minutes < close) {
      return { open: true, label: `Aberto agora · fecha às ${today.close}`, today: day };
    }
    if (minutes < open) {
      return { open: false, label: `Fechado · abre hoje às ${today.open}`, today: day };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const next = hoursFor((day + i) % 7);
    if (next) {
      const when = i === 1 ? 'amanhã' : WEEKDAYS[next.day].toLowerCase();
      return { open: false, label: `Fechado · abre ${when} às ${next.open}`, today: day };
    }
  }
  return { open: false, label: 'Fechado', today: day };
}
