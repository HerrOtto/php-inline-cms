# Inline PHP-Editor

**Kurzbeschreibung:**  
Ein leichtgewichtiger, passwortgeschützter Inline-Editor für PHP-Seiten.  
Erlaubt das direkte Bearbeiten von bestimmten `<div class="edit">`-Blöcken im Browser und speichert Änderungen per AJAX direkt in die Quell-PHP.

## Dateien und Ordner
test.php         - Beispielseite, die den Editor einbindet.
inc/edit.php     - Backend (AJAX-Endpunkte login, logout, check, save).
inc/edit.css     - Styling für Edit-Modus, Icons und Login-Modal.
inc/edit.js      - Frontend-Logik: Icons, Login, Edit-Modus, AJAX-Aufrufe.

## Voraussetzungen
* PHP auf dem Server (mindestens Version 7).
* Schreibrechte für die bearbeitete PHP-Datei.
* Session-Unterstützung (session_start()).

## Installation

1. Verzeichnisstruktur beibehalten oder anpassen:
`
/dein-webroot/
  ├── test.php
  └── inc/
      ├── edit.php
      ├── edit.css
      └── edit.js
`

2. Zugriffsrechte prüfen: edit.php muss Schreibzugriff auf die bearbeitete PHP-Datei haben.

## Konfiguration

**Passwort festlegen**  
* In `inc/edit.php` findest du ganz oben folgenden Abschnitt:
     ```php
     $password = 'Geheimes Passwort!';
     ```
     Ändere den Wert in dein gewünschtes Passwort.

**Bearbeitbare PHP‐Dateien vorbereiten**  
- Jeder `<div class="edit">`‐Block muss eine **eindeutige `id="uniqueID"`** haben.  
     - Unmittelbar nach jedem bearbeitbaren Div muss ein Kommentar `<!-- /uniqueID -->` stehen.  
       Dadurch erkennt das Backend, wo der Block endet.  
     - Beispiel:
       ```html
       <div id="block1" class="edit">
         <!-- hier steht der Inhalt, den man im Browser direkt ändern kann -->
       </div>
       <!-- /block1 -->
       ```
## Nutzung

1. **Seite im Browser öffnen**  
   Rufe z. B. `http://dein-server/test.php` auf.

2. **Edit-Icon anklicken (✏️)**  
   - Wenn du noch nicht eingeloggt bist, erscheint ein Login‐Modal.
   - Gib dort das Passwort ein und klicke „Anmelden“.

3. **Edit-Modus**  
   - Alle `<div class="edit">`‐Blöcke werden gelb umrandet und sind nun `contenteditable`.  
   - Du kannst den Text direkt ändern.  
   - Icons:  
     - **💾 Save:** Speichert alle geänderten Blöcke in der PHP-Datei.  
     - **🗑️ Cancel:** Verwirft Änderungen (Seiten-Reload ohne Cache).  
     - **🔒 Logout:** Meldet dich ab und versteckt Edit/Save/Cancel.

4. **Speichern (💾)**  
   - Klick auf 💾, um die Änderungen ans Backend zu senden.  
   - Das PHP‐Skript `inc/edit.php` liest alle `.edit`-Blöcke aus, sucht per Regex nach den zugehörigen `<!-- /ID -->`-Kommentaren und ersetzt den HTML-Inhalt.  
   - Anschließend wird die Seite mit einem Timestamp neu geladen (Cache-Bypass).

5. **Fehlermeldungen**  
   - Wenn ein Block keine passende `id` oder keinen `<!-- /ID -->`-Kommentar hat, liefert das Backend im JSON-Feld `missingIds` eine Liste aller problematischen IDs.  
   - Dann erscheint ein `alert(...)` mit den fehlenden IDs und du kannst die HTML-Quelltext‐Tags entsprechend korrigieren.

## Troubleshooting

### 1. Datei wird nach dem Speichern leer
- **Ursache:** Regex konnte die Markierung nicht finden (fehlende oder falsche ID/comment-Syntax).  
- **Abhilfe:**  
  - Überprüfe, dass **ID** und **Kommentar** exakt übereinstimmen.  
  - Achte auf Groß/​Kleinschreibung, Leerzeichen und Zeilenumbrüche.  
  - Beispiel:
    ```html
    <div id="meinBlock" class="edit">
      …Inhalt…
    </div>
    <!-- /meinBlock -->
    ```

### 2. `missingIds` listet alle Blöcke auf
- **Ursache:** Backend-Regex sucht nach 
  ```regex
  <div … id="ID" … class="…edit…" …> … </div>\s*<!-- /ID -->
  
# Kontakt und Lizenz

Copyright (c) 2025 netzmal GmbH
