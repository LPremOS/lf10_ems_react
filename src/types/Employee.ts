// Zentrale Type-Definition für Mitarbeiter
// Alle Daten kommen vom Backend - keine Mock-Daten mehr!

export interface Employee {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefonnummer: string;
  abteilung: string;
  position: string;
  standort: string;
  qualifikationen: string[];
}

