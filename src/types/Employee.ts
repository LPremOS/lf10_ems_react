// Zentrales Datenmodell fuer einen Mitarbeiter in der Frontend-Anwendung.
// Diese Struktur wird in Formularen, API-Hooks und Views wiederverwendet.
export interface Employee {
  // String, weil IDs aus URLs und Formular-Kontext oft als Text verarbeitet werden.
  id: string;
  // Vorname des Mitarbeiters.
  vorname: string;
  // Nachname des Mitarbeiters.
  nachname: string;
  // Telefonnummer im Anzeige-/Eingabeformat.
  telefonnummer: string;
  // Einsatzort / Stadt.
  standort: string;
  // Strassenangabe.
  street: string;
  // Postleitzahl als String, damit fuehrende Nullen erhalten bleiben.
  postcode: string;
  // Liste der Qualifikations-Namen (nicht IDs).
  qualifikationen: string[];
}

