// Zentrale Type-Definition für Mitarbeiter
// Alle Daten kommen vom Backend - keine Mock-Daten mehr!

export interface Employee {
  id: string;
  vorname: string;
  nachname: string;
  telefonnummer: string;
  standort: string;
  street: string;
  postcode: string;
  qualifikationen: string[];
}

