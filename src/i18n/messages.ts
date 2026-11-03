export const messages = {
  en: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    greetingNight: 'Good night',
    searchPlaceholder: 'Search the web...',
    links: 'Links',
    addLink: 'Add link',
    settings: 'Settings',
    tasks: 'Tasks',
    weather: 'Weather',
  },
  es: {
    greetingMorning: 'Buenos días',
    greetingAfternoon: 'Buenas tardes',
    greetingEvening: 'Buenas tardes',
    greetingNight: 'Buenas noches',
    searchPlaceholder: 'Buscar en la web...',
    links: 'Enlaces',
    addLink: 'Añadir enlace',
    settings: 'Ajustes',
    tasks: 'Tareas',
    weather: 'Tiempo',
  },
} as const;

export type Lang = keyof typeof messages;
export type MessageKey = keyof (typeof messages)['en'];
