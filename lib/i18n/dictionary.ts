export type Locale = 'en' | 'it' | 'fr' | 'es'

export type Dictionary = {
  nav: {
    dashboard: string
    reservations: string
    customers: string
    campaigns: string
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
    todaysReservations: string
    next7Days: string
    totalCustomers: string
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
}

const en: Dictionary = {
  nav: {
    dashboard: 'Dashboard',
    reservations: 'Reservations',
    customers: 'Customers',
    campaigns: 'Campaigns',
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
    todaysReservations: "Today's reservations",
    next7Days: 'Next 7 days',
    totalCustomers: 'Total customers',
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
}

const it: Dictionary = {
  nav: {
    dashboard: 'Dashboard',
    reservations: 'Prenotazioni',
    customers: 'Clienti',
    campaigns: 'Campagne',
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
    todaysReservations: 'Prenotazioni di oggi',
    next7Days: 'Prossimi 7 giorni',
    totalCustomers: 'Clienti totali',
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
}

const fr: Dictionary = {
  nav: {
    dashboard: 'Tableau de bord',
    reservations: 'Réservations',
    customers: 'Clients',
    campaigns: 'Campagnes',
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
    todaysReservations: "Réservations d'aujourd'hui",
    next7Days: '7 prochains jours',
    totalCustomers: 'Clients au total',
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
}

const es: Dictionary = {
  nav: {
    dashboard: 'Panel',
    reservations: 'Reservas',
    customers: 'Clientes',
    campaigns: 'Campañas',
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
    todaysReservations: 'Reservas de hoy',
    next7Days: 'Próximos 7 días',
    totalCustomers: 'Clientes totales',
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
}

export const dictionary: Record<Locale, Dictionary> = { en, it, fr, es }
