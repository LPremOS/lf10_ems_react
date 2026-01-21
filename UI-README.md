# Employee Management System - UI

Dies ist eine 1:1 Frontend-Nachbildung der Mitarbeiterübersicht ohne Backend-Logik.

## Erstellte Komponenten

### 1. Layout (`src/components/Layout.tsx`)
- Hauptlayout mit Sidebar und Content-Bereich
- Footer mit "Made with 🔥"

### 2. Sidebar (`src/components/Sidebar.tsx`)
- Navigation mit:
  - Dashboard
  - Mitarbeiter (aktiv)
  - Qualifikationen
- Logout-Button unten

### 3. EmployeeOverview (`src/components/EmployeeOverview.tsx`)
- Überschrift "Mitarbeiterübersicht"
- "Neuen Mitarbeiter anlegen" Button (grün)
- Filter-Sektion mit Feldern für:
  - Vorname
  - Nachname
  - Ort
  - Qualifikation (Dropdown)
  - "Filter anwenden" Button
- Tabelle mit Mock-Daten:
  - 5 Beispiel-Mitarbeiter
  - Spalten: Vorname, Nachname, Ort, Qualifikationen, Aktionen
  - Qualifikationen als grüne Badges
  - Aktionsbuttons: Ansehen, Bearbeiten, Löschen
- Pagination (Previous, 1, 2, 3, Next)

## Design-Details

- **Farben:**
  - Grüner Button: #28a745
  - Qualifikation Badges: hellgrün (#d4edda mit Text #155724)
  - Hintergrund: weiß
  - Sidebar: hellgrau (#f8f9fa)
  - Rahmen: #e0e0e0

- **Schriften:**
  - System Font Stack (Segoe UI, Roboto, etc.)
  - Überschrift: 32px, bold
  - Normale Texte: 14px

## Verwendung

Die Komponente wird auf der Route `/employees` angezeigt.

```tsx
<Route path="/employees" element={
  <RequireAuth>
    <EmployeeTable/>
  </RequireAuth>
}/>
```

## Mock-Daten

Die Komponente enthält 5 Beispiel-Mitarbeiter:
- Anna Müller (Berlin) - Projektmanagement, Softwareentwicklung
- Max Schmidt (München) - Datenanalyse, Cloud Computing
- Lena Meier (Hamburg) - Projektmanagement, Marketing, Vertrieb
- Paul Wagner (Frankfurt) - Softwareentwicklung, Cloud Computing
- Sophie Schneider (Köln) - Datenanalyse, Vertrieb

## Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build
npm run build
```

## Hinweis

Dies ist eine reine Frontend-Implementierung ohne Logik. Alle Buttons und Filter sind noch nicht funktional.

