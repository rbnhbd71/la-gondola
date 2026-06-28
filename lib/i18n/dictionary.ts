export type Locale = 'en' | 'it' | 'fr' | 'es'

export type Dictionary = {
  nav: {
    dashboard: string
    reservations: string
    floorPlan: string
    customers: string
    campaigns: string
    stats: string
    settings: string
    logOut: string
  }
  language: { label: string }
  common: {
    backToDashboard: string
    noRestaurantFound: string
    errorPrefix: string
    edit: string
    save: string
    saving: string
    cancel: string
  }
  dashboard: {
    heading: string
    greetingMorning: string
    greetingAfternoon: string
    greetingEvening: string
    statReservationsToday: string
    statNewCustomers: string
    statOccupancy: string
    statAiHandled: string
    estimateNote: string
    upcomingHeading: string
    noUpcoming: string
    floorTonightHeading: string
    floorLunch: string
    floorDinner: string
    viewFloorPlan: string
    legendBooked: string
    legendFree: string
    birthdaySentLabel: string
    topCustomersHeading: string
    visits: string
    perfOccupancy: string
    perfFulfillment: string
    perfRepeatCustomers: string
    perfAiHandled: string
  }
  reservations: {
    heading: string
    noReservationsFound: string
    colNome: string
    colData: string
    colOra: string
    colOspiti: string
    colStato: string
    statoCancellata: string
    colTable: string
    unassigned: string
  }
  customers: {
    heading: string
    noCustomersFound: string
    colNome: string
    colTelefono: string
    colVisite: string
    colUltimaVisita: string
    colCompleanno: string
    colNote: string
  }
  birthday: {
    saving: string
    edit: string
  }
  floorPlan: {
    heading: string
    noTablesFound: string
    addTable: string
    done: string
    bookingView: string
    editLayout: string
    lunch: string
    dinner: string
    guests: string
  }
  campaigns: {
    heading: string
    birthdayMessages: string
    templateLabel: string
    savedSuccessfully: string
    winbackTitle: string
    winbackDescription: string
    seasonalTitle: string
    seasonalDescription: string
    comingSoon: string
  }
  settings: {
    heading: string
    savedSuccessfully: string
    confirmSave: string
    mustBePositiveInt: string
    labelNomeRistorante: string
    labelIndirizzo: string
    labelNumeroTwilioFrom: string
    labelNumeroManager: string
    labelOrariApertura: string
    labelAccessibilita: string
    labelCapacitaTotale: string
    labelMaxGruppoSingolo: string
    labelFinestraOre: string
  }
  login: {
    heading: string
    emailLabel: string
    passwordLabel: string
    signIn: string
    signingIn: string
  }
  stats: {
    heading: string
    lastMonth: string
    last3Months: string
    last6Months: string
    totalReservations: string
    newCustomers: string
    cancellationRate: string
    chartHeading: string
    vsPrevPeriod: string
    noDataYet: string
  }
}

const en: Dictionary = {
  nav: {
    dashboard: 'Dashboard',
    reservations: 'Reservations',
    floorPlan: 'Floor Plan',
    customers: 'Customers',
    campaigns: 'Campaigns',
    stats: 'Statistics',
    settings: 'Settings',
    logOut: 'Log out',
  },
  language: { label: 'Language' },
  common: {
    backToDashboard: '← Dashboard',
    noRestaurantFound: 'No restaurant found for this account.',
    errorPrefix: 'Error:',
    edit: 'Edit',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
  },
  dashboard: {
    heading: 'Overview',
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    statReservationsToday: "Today's reservations",
    statNewCustomers: 'New customers this month',
    statOccupancy: 'Avg. occupancy',
    statAiHandled: 'Handled by AI',
    estimateNote: 'Estimate — full tracking coming soon',
    upcomingHeading: 'Upcoming reservations',
    noUpcoming: 'No upcoming reservations.',
    floorTonightHeading: 'Floor plan — tonight',
    floorLunch: 'Lunch service',
    floorDinner: 'Dinner service',
    viewFloorPlan: 'View full floor plan →',
    legendBooked: 'Booked',
    legendFree: 'Free',
    birthdaySentLabel: 'customers reached via birthday messages',
    topCustomersHeading: 'Top customers',
    visits: 'visits',
    perfOccupancy: 'Occupancy',
    perfFulfillment: 'Fulfillment',
    perfRepeatCustomers: 'Repeat guests',
    perfAiHandled: 'AI handled',
  },
  reservations: {
    heading: 'Reservations',
    noReservationsFound: 'No reservations found.',
    colNome: 'Nome',
    colData: 'Data',
    colOra: 'Ora',
    colOspiti: 'Ospiti',
    colStato: 'Stato',
    statoCancellata: 'Cancellata',
    colTable: 'Table',
    unassigned: 'Unassigned',
  },
  customers: {
    heading: 'Customers',
    noCustomersFound: 'No customers found.',
    colNome: 'Nome',
    colTelefono: 'Telefono',
    colVisite: 'Visite',
    colUltimaVisita: 'Ultima Visita',
    colCompleanno: 'Compleanno',
    colNote: 'Note',
  },
  birthday: { saving: 'Saving…', edit: 'Edit' },
  floorPlan: {
    heading: 'Floor Plan',
    noTablesFound: 'No tables configured yet.',
    addTable: 'Add Table',
    done: 'Done',
    bookingView: 'Booking View',
    editLayout: 'Edit Layout',
    lunch: 'Lunch',
    dinner: 'Dinner',
    guests: 'guests',
  },
  campaigns: {
    heading: 'Campaigns',
    birthdayMessages: 'Birthday Messages',
    templateLabel: 'Message Template',
    savedSuccessfully: 'Birthday message saved.',
    winbackTitle: 'Win-back Messages',
    winbackDescription: "Re-engage customers who haven't visited in a while",
    seasonalTitle: 'Seasonal Campaigns',
    seasonalDescription: 'Send promotions for holidays and special occasions',
    comingSoon: 'Coming soon',
  },
  settings: {
    heading: 'Settings',
    savedSuccessfully: 'Settings saved successfully.',
    confirmSave:
      'This will update the live restaurant settings used by the WhatsApp bot. Continue?',
    mustBePositiveInt: 'Must be a positive whole number',
    labelNomeRistorante: 'Restaurant Name',
    labelIndirizzo: 'Address',
    labelNumeroTwilioFrom: 'Twilio Number (From)',
    labelNumeroManager: 'Manager Number',
    labelOrariApertura: 'Opening Hours',
    labelAccessibilita: 'Accessibility',
    labelCapacitaTotale: 'Total Capacity',
    labelMaxGruppoSingolo: 'Max Group Size',
    labelFinestraOre: 'Time Window (Hours)',
  },
  login: {
    heading: 'Sign in',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
  },
  stats: {
    heading: 'Statistics',
    lastMonth: 'Last month',
    last3Months: 'Last 3 months',
    last6Months: 'Last 6 months',
    totalReservations: 'Total reservations',
    newCustomers: 'New customers',
    cancellationRate: 'Cancellation rate',
    chartHeading: 'Reservations over time',
    vsPrevPeriod: 'vs previous period',
    noDataYet: 'No data for this period yet.',
  },
}

const it: Dictionary = {
  nav: {
    dashboard: 'Dashboard',
    reservations: 'Prenotazioni',
    floorPlan: 'Pianta Sala',
    customers: 'Clienti',
    campaigns: 'Campagne',
    stats: 'Statistiche',
    settings: 'Impostazioni',
    logOut: 'Esci',
  },
  language: { label: 'Lingua' },
  common: {
    backToDashboard: '← Dashboard',
    noRestaurantFound: 'Nessun ristorante trovato per questo account.',
    errorPrefix: 'Errore:',
    edit: 'Modifica',
    save: 'Salva',
    saving: 'Salvataggio…',
    cancel: 'Annulla',
  },
  dashboard: {
    heading: 'Panoramica',
    greetingMorning: 'Buongiorno',
    greetingAfternoon: 'Buon pomeriggio',
    greetingEvening: 'Buonasera',
    statReservationsToday: 'Prenotazioni di oggi',
    statNewCustomers: 'Nuovi clienti questo mese',
    statOccupancy: 'Occupazione media',
    statAiHandled: "Gestite dall'IA",
    estimateNote: 'Stima — tracciamento completo in arrivo',
    upcomingHeading: 'Prossime prenotazioni',
    noUpcoming: 'Nessuna prenotazione imminente.',
    floorTonightHeading: 'Pianta sala — stasera',
    floorLunch: 'Servizio pranzo',
    floorDinner: 'Servizio cena',
    viewFloorPlan: 'Vedi pianta completa →',
    legendBooked: 'Occupato',
    legendFree: 'Libero',
    birthdaySentLabel: 'clienti raggiunti con messaggi di compleanno',
    topCustomersHeading: 'Clienti top',
    visits: 'visite',
    perfOccupancy: 'Occupazione',
    perfFulfillment: 'Conferme',
    perfRepeatCustomers: 'Abituali',
    perfAiHandled: 'Gestiti AI',
  },
  reservations: {
    heading: 'Prenotazioni',
    noReservationsFound: 'Nessuna prenotazione trovata.',
    colNome: 'Nome',
    colData: 'Data',
    colOra: 'Ora',
    colOspiti: 'Ospiti',
    colStato: 'Stato',
    statoCancellata: 'Cancellata',
    colTable: 'Tavolo',
    unassigned: 'Non assegnato',
  },
  customers: {
    heading: 'Clienti',
    noCustomersFound: 'Nessun cliente trovato.',
    colNome: 'Nome',
    colTelefono: 'Telefono',
    colVisite: 'Visite',
    colUltimaVisita: 'Ultima Visita',
    colCompleanno: 'Compleanno',
    colNote: 'Note',
  },
  birthday: { saving: 'Salvataggio…', edit: 'Modifica' },
  floorPlan: {
    heading: 'Pianta Sala',
    noTablesFound: 'Nessun tavolo configurato.',
    addTable: 'Aggiungi tavolo',
    done: 'Fatto',
    bookingView: 'Vista Prenotazioni',
    editLayout: 'Modifica Pianta',
    lunch: 'Pranzo',
    dinner: 'Cena',
    guests: 'ospiti',
  },
  campaigns: {
    heading: 'Campagne',
    birthdayMessages: 'Messaggi di Compleanno',
    templateLabel: 'Template Messaggio',
    savedSuccessfully: 'Messaggio di compleanno salvato.',
    winbackTitle: 'Messaggi di Recupero',
    winbackDescription: "Riconquista i clienti che non visitano da un po'",
    seasonalTitle: 'Campagne Stagionali',
    seasonalDescription: 'Invia promozioni per festività e occasioni speciali',
    comingSoon: 'Prossimamente',
  },
  settings: {
    heading: 'Impostazioni',
    savedSuccessfully: 'Impostazioni salvate con successo.',
    confirmSave:
      'Questo aggiornerà le impostazioni del ristorante utilizzate dal bot WhatsApp. Continuare?',
    mustBePositiveInt: 'Deve essere un numero intero positivo',
    labelNomeRistorante: 'Nome Ristorante',
    labelIndirizzo: 'Indirizzo',
    labelNumeroTwilioFrom: 'Numero Twilio (Da)',
    labelNumeroManager: 'Numero Manager',
    labelOrariApertura: 'Orari di Apertura',
    labelAccessibilita: 'Accessibilità',
    labelCapacitaTotale: 'Capacità Totale',
    labelMaxGruppoSingolo: 'Max Gruppo Singolo',
    labelFinestraOre: 'Finestra Orario (Ore)',
  },
  login: {
    heading: 'Accedi',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    signIn: 'Accedi',
    signingIn: 'Accesso in corso…',
  },
  stats: {
    heading: 'Statistiche',
    lastMonth: 'Ultimo mese',
    last3Months: 'Ultimi 3 mesi',
    last6Months: 'Ultimi 6 mesi',
    totalReservations: 'Prenotazioni totali',
    newCustomers: 'Nuovi clienti',
    cancellationRate: 'Tasso di cancellazione',
    chartHeading: 'Prenotazioni nel tempo',
    vsPrevPeriod: 'vs periodo precedente',
    noDataYet: 'Nessun dato per questo periodo.',
  },
}

const fr: Dictionary = {
  nav: {
    dashboard: 'Tableau de bord',
    reservations: 'Réservations',
    floorPlan: 'Plan de Salle',
    customers: 'Clients',
    campaigns: 'Campagnes',
    stats: 'Statistiques',
    settings: 'Paramètres',
    logOut: 'Déconnexion',
  },
  language: { label: 'Langue' },
  common: {
    backToDashboard: '← Tableau de bord',
    noRestaurantFound: 'Aucun restaurant trouvé pour ce compte.',
    errorPrefix: 'Erreur :',
    edit: 'Modifier',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    cancel: 'Annuler',
  },
  dashboard: {
    heading: 'Aperçu',
    greetingMorning: 'Bonjour',
    greetingAfternoon: 'Bon après-midi',
    greetingEvening: 'Bonsoir',
    statReservationsToday: "Réservations d'aujourd'hui",
    statNewCustomers: 'Nouveaux clients ce mois',
    statOccupancy: 'Occupation moyenne',
    statAiHandled: "Géré par l'IA",
    estimateNote: 'Estimation — suivi complet bientôt disponible',
    upcomingHeading: 'Réservations à venir',
    noUpcoming: 'Aucune réservation à venir.',
    floorTonightHeading: 'Plan de salle — ce soir',
    floorLunch: 'Service du déjeuner',
    floorDinner: 'Service du dîner',
    viewFloorPlan: 'Voir le plan complet →',
    legendBooked: 'Réservée',
    legendFree: 'Libre',
    birthdaySentLabel: "clients atteints via messages d'anniversaire",
    topCustomersHeading: 'Meilleurs clients',
    visits: 'visites',
    perfOccupancy: 'Occupation',
    perfFulfillment: 'Confirmations',
    perfRepeatCustomers: 'Fidèles',
    perfAiHandled: 'Géré par IA',
  },
  reservations: {
    heading: 'Réservations',
    noReservationsFound: 'Aucune réservation trouvée.',
    colNome: 'Nome',
    colData: 'Data',
    colOra: 'Ora',
    colOspiti: 'Ospiti',
    colStato: 'Stato',
    statoCancellata: 'Cancellata',
    colTable: 'Table',
    unassigned: 'Non assignée',
  },
  customers: {
    heading: 'Clients',
    noCustomersFound: 'Aucun client trouvé.',
    colNome: 'Nome',
    colTelefono: 'Telefono',
    colVisite: 'Visite',
    colUltimaVisita: 'Ultima Visita',
    colCompleanno: 'Compleanno',
    colNote: 'Note',
  },
  birthday: { saving: 'Enregistrement…', edit: 'Modifier' },
  floorPlan: {
    heading: 'Plan de Salle',
    noTablesFound: 'Aucune table configurée.',
    addTable: 'Ajouter une table',
    done: 'Terminer',
    bookingView: 'Vue Réservations',
    editLayout: 'Modifier le Plan',
    lunch: 'Déjeuner',
    dinner: 'Dîner',
    guests: 'couverts',
  },
  campaigns: {
    heading: 'Campagnes',
    birthdayMessages: "Messages d'anniversaire",
    templateLabel: 'Modèle de message',
    savedSuccessfully: "Message d'anniversaire enregistré.",
    winbackTitle: 'Messages de reconquête',
    winbackDescription: 'Réengagez les clients qui ne sont pas venus depuis longtemps',
    seasonalTitle: 'Campagnes saisonnières',
    seasonalDescription: 'Envoyez des promotions pour les fêtes et occasions spéciales',
    comingSoon: 'Bientôt disponible',
  },
  settings: {
    heading: 'Paramètres',
    savedSuccessfully: 'Paramètres enregistrés avec succès.',
    confirmSave:
      'Cela mettra à jour les paramètres du restaurant utilisés par le bot WhatsApp. Continuer ?',
    mustBePositiveInt: 'Doit être un nombre entier positif',
    labelNomeRistorante: 'Nom du restaurant',
    labelIndirizzo: 'Adresse',
    labelNumeroTwilioFrom: 'Numéro Twilio (De)',
    labelNumeroManager: 'Numéro du gérant',
    labelOrariApertura: "Horaires d'ouverture",
    labelAccessibilita: 'Accessibilité',
    labelCapacitaTotale: 'Capacité totale',
    labelMaxGruppoSingolo: 'Taille max du groupe',
    labelFinestraOre: 'Fenêtre horaire (Heures)',
  },
  login: {
    heading: 'Connexion',
    emailLabel: 'E-mail',
    passwordLabel: 'Mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion…',
  },
  stats: {
    heading: 'Statistiques',
    lastMonth: 'Le mois dernier',
    last3Months: '3 derniers mois',
    last6Months: '6 derniers mois',
    totalReservations: 'Réservations totales',
    newCustomers: 'Nouveaux clients',
    cancellationRate: "Taux d'annulation",
    chartHeading: 'Réservations dans le temps',
    vsPrevPeriod: 'vs période précédente',
    noDataYet: 'Pas encore de données pour cette période.',
  },
}

const es: Dictionary = {
  nav: {
    dashboard: 'Panel',
    reservations: 'Reservas',
    floorPlan: 'Plano de Sala',
    customers: 'Clientes',
    campaigns: 'Campañas',
    stats: 'Estadísticas',
    settings: 'Ajustes',
    logOut: 'Cerrar sesión',
  },
  language: { label: 'Idioma' },
  common: {
    backToDashboard: '← Panel',
    noRestaurantFound: 'No se encontró ningún restaurante para esta cuenta.',
    errorPrefix: 'Error:',
    edit: 'Editar',
    save: 'Guardar',
    saving: 'Guardando…',
    cancel: 'Cancelar',
  },
  dashboard: {
    heading: 'Resumen',
    greetingMorning: 'Buenos días',
    greetingAfternoon: 'Buenas tardes',
    greetingEvening: 'Buenas noches',
    statReservationsToday: 'Reservas de hoy',
    statNewCustomers: 'Nuevos clientes este mes',
    statOccupancy: 'Ocupación media',
    statAiHandled: 'Gestionadas por IA',
    estimateNote: 'Estimación — seguimiento completo próximamente',
    upcomingHeading: 'Próximas reservas',
    noUpcoming: 'No hay próximas reservas.',
    floorTonightHeading: 'Plano de sala — esta noche',
    floorLunch: 'Servicio de almuerzo',
    floorDinner: 'Servicio de cena',
    viewFloorPlan: 'Ver plano completo →',
    legendBooked: 'Ocupada',
    legendFree: 'Libre',
    birthdaySentLabel: 'clientes alcanzados vía mensajes de cumpleaños',
    topCustomersHeading: 'Clientes top',
    visits: 'visitas',
    perfOccupancy: 'Ocupación',
    perfFulfillment: 'Confirmaciones',
    perfRepeatCustomers: 'Habituales',
    perfAiHandled: 'Gestionado IA',
  },
  reservations: {
    heading: 'Reservas',
    noReservationsFound: 'No se encontraron reservas.',
    colNome: 'Nome',
    colData: 'Data',
    colOra: 'Ora',
    colOspiti: 'Ospiti',
    colStato: 'Stato',
    statoCancellata: 'Cancellata',
    colTable: 'Mesa',
    unassigned: 'Sin asignar',
  },
  customers: {
    heading: 'Clientes',
    noCustomersFound: 'No se encontraron clientes.',
    colNome: 'Nome',
    colTelefono: 'Telefono',
    colVisite: 'Visite',
    colUltimaVisita: 'Ultima Visita',
    colCompleanno: 'Compleanno',
    colNote: 'Note',
  },
  birthday: { saving: 'Guardando…', edit: 'Editar' },
  floorPlan: {
    heading: 'Plano de Sala',
    noTablesFound: 'No hay mesas configuradas.',
    addTable: 'Añadir mesa',
    done: 'Listo',
    bookingView: 'Vista Reservas',
    editLayout: 'Editar Plano',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    guests: 'comensales',
  },
  campaigns: {
    heading: 'Campañas',
    birthdayMessages: 'Mensajes de cumpleaños',
    templateLabel: 'Plantilla del mensaje',
    savedSuccessfully: 'Mensaje de cumpleaños guardado.',
    winbackTitle: 'Mensajes de recuperación',
    winbackDescription: 'Vuelve a captar a clientes que no han visitado en un tiempo',
    seasonalTitle: 'Campañas estacionales',
    seasonalDescription: 'Envía promociones para festivos y ocasiones especiales',
    comingSoon: 'Próximamente',
  },
  settings: {
    heading: 'Ajustes',
    savedSuccessfully: 'Ajustes guardados correctamente.',
    confirmSave:
      'Esto actualizará los ajustes del restaurante utilizados por el bot de WhatsApp. ¿Continuar?',
    mustBePositiveInt: 'Debe ser un número entero positivo',
    labelNomeRistorante: 'Nombre del restaurante',
    labelIndirizzo: 'Dirección',
    labelNumeroTwilioFrom: 'Número de Twilio (De)',
    labelNumeroManager: 'Número del gerente',
    labelOrariApertura: 'Horario de apertura',
    labelAccessibilita: 'Accesibilidad',
    labelCapacitaTotale: 'Capacidad total',
    labelMaxGruppoSingolo: 'Tamaño máximo del grupo',
    labelFinestraOre: 'Ventana horaria (Horas)',
  },
  login: {
    heading: 'Iniciar sesión',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    signIn: 'Iniciar sesión',
    signingIn: 'Iniciando sesión…',
  },
  stats: {
    heading: 'Estadísticas',
    lastMonth: 'Último mes',
    last3Months: 'Últimos 3 meses',
    last6Months: 'Últimos 6 meses',
    totalReservations: 'Reservas totales',
    newCustomers: 'Nuevos clientes',
    cancellationRate: 'Tasa de cancelación',
    chartHeading: 'Reservas a lo largo del tiempo',
    vsPrevPeriod: 'vs período anterior',
    noDataYet: 'Sin datos para este período todavía.',
  },
}

export const dictionary: Record<Locale, Dictionary> = { en, it, fr, es }
