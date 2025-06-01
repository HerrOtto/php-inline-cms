# Inline PHP-Editor

**Einfacher, leichtgewichtiger Inline-Editor für PHP-Seiten:**  Dieser Editor erlaubt es, einzelne `<div class="edit">`-Blöcke direkt im Browser zu bearbeiten und die Änderungen per AJAX in die zugrunde liegende PHP-Datei zu schreiben. Er kommt dabei ohne jegliche externen Abhängigkeiten aus:  

- **Kein Framework** (kein jQuery, kein Bootstrap o. Ä.)  
- **Keine zusätzlichen PHP-Pakete** (nur Standard-PHP-Session und Dateizugriff)  
- **Nur Vanilla-JavaScript und CSS**  

Dadurch lässt er sich in jedes beliebige PHP-Projekt integrieren, ohne dass zusätzliche Bibliotheken oder Paketmanager (Composer/NPM) benötigt werden.  

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

1. Inc-Ordner in den Webseiten-Ordner laden. Das Projekt sieht dann in etwa so aus:

```
/dein-webroot/
  ├── index.php    ← PHP-Datei, die später bearbeitbar sein soll
  └── inc/
      ├── edit.php ← Backend-Skript für Login/Save/Check
      ├── edit.css ← CSS-Datei für den Edit-Modus und das Login-Modal
      └── edit.js  ← JavaScript für Icons, Modal und AJAX-Aufrufe
```

2. Stelle sicher, dass das Backend-Skript (`inc/edit.php`) Schreibrechte auf die bearbeitete PHP-Datei (z. B. `index.php`) hat.  

3. **Konfiguration starten**
   
## Konfiguration

**Passwort festlegen**  
In `inc/edit.php` findest du ganz oben folgenden Abschnitt:

```php
$password = 'Geheimes Passwort!';
```
Ändere den Wert in dein gewünschtes Passwort.

**Bearbeitbare PHP‐Dateien vorbereiten**  

a) Am Anfang der PHP-Dateien das "edit.php"-Script einbinden:

````php
include "inc/edit.php";
````

b) Im Head der PHP-Datei folgendes einbinden. Das CSS kann nach eigenen Wünschen angepasst werden:

````html
<head>

    ...
    <script src="inc/edit.js"></script>
    <link   href="inc/edit.css" rel="stylesheet">
    <style>
        /* Standard: Icon bleibt an seiner Position im Flow */
        #editIconHere {
            display: inline-block;
            position: static;
            font-size: 20px;
        }
        /* Sobald body.editorActive gesetzt ist, fixiere das Icon unten rechts */
        body.editorActive #editIconHere {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            margin: 0;
            background-color: lightblue;
            padding: 5px;
            font-size: 20px;
        }
    </style>
    ...

</head>
````

c) Platziere am Ende des <body>-Tags (oder an einer Stelle deiner Wahl) den Container für die Edit-Icons:

````html
<div id="editIconHere"></div>
````

d) Jeder `<div class="edit">`‐Block muss eine **eindeutige `id="uniqueID"`** haben.  
Unmittelbar nach jedem bearbeitbaren Div muss ein Kommentar `<!-- /uniqueID -->` stehen.  
Dadurch erkennt das Backend, wo der Block endet. Beispiel:

```html
<div id="block1" class="edit">
  <!-- hier steht der Inhalt, den man im Browser direkt ändern kann -->
</div>
<!-- /block1 -->
```
  
## Nutzung

1. **Seite im Browser öffnen**  
   - Rufe z. B. `http://dein-server/test.php` auf.

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

### Datei wird nach dem Speichern leer
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

### Beim Speichern wird auf fehlende IDs verwiesen
- **Ursache:** Backend-Regex sucht nach 

  ```regex
  <div … id="ID" … class="…edit…" …> … </div>\s*<!-- /ID -->
  ```

## Kontakt und Lizenz

Copyright (c) 2025 netzmal GmbH
