<?php

// ================================
// Beispielseite mit Inline-Editor
// ================================

// Einbindung des Backends:
// Passe den Pfad nach Bedarf an, falls das Skript in einem anderen Verzeichnis liegt.
include "inc/edit.php";

?>
<!DOCTYPE html>
<html lang="de">
<head>

    <meta charset="UTF-8">
    <title>Test Seite mit Editor</title>

    <!-- Einbindung von CSS & JS des Editors -->
    <script src="inc/edit.js"></script>
    <link   href="inc/edit.css" rel="stylesheet">

    <!-- Optionales Inline-CSS für das Edit-Icon: -->
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

</head>
<body>

<!--
 Deine editierbaren Bereiche:
 * Jeder DIV mit class="edit" wird im Edit-Modus inline bearbeitbar.
 * Gib jedem eine eindeutige ID, damit Änderungen gespeichert werden.
 * Am Ende die DIV-Endekennung als Kommentar, nicht vergessen: /ID
-->

<div id="block1" class="edit">
    <h2>Willkommen</h2>
    <p>Dies ist ein editierbarer Bereich.</p>
</div>
<!-- /block1 -->

<div id="block2" class="edit">
    <p>Noch ein Bereich zum Testen.</p>
</div>
<!-- /block2 -->

<!--
 Platzhalter für die Edit-/Save-/Cancel-Icons:
 * Wird per JS nach dem DOM-Ready gefüllt. Einfach an dieser Stelle lassen.
-->
<div id="editIconHere"></div>

</body>
</html>