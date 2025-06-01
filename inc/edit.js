/**
 *
 * Frontend für den Inline-Editor
 * Copyright (c) 2025 netzmal GmbH
 *
 * Aufgaben:
 *  - Fügt drei Icons (Bearbeiten, Speichern, Abbrechen) in das Element #editIconHere ein.
 *  - Erstellt und steuert ein Login-Modal für geschützte Edit-Sitzungen.
 *  - Kommuniziert per fetch()/AJAX mit inc/edit.php:
 *      * action=check  → prüft Session-Status
 *      * action=login  → Authentifiziert den Benutzer
 *      * action=save   → Sendet Änderungen und löst Nachladen ohne Cache aus
 *  - Zeigt das „Logout“-Icon nur, wenn der Nutzer bereits eingeloggt ist.
 *  - Aktiviert contentEditable für alle Elemente mit der Klasse .edit.
 *  - Behandelt UI-Zustände (Ein-/Ausblenden der Icons, Hover-Effekte).
 *
 */

// Globale Variablen für die UI-Elemente
var editorEditIcon = null;
var editorLogoutIcon  = null;
var editorSaveIcon = null;
var editorCancelIcon = null;

var editorLoginModal = null;
var editorLoginBox = null;
var editorPasswordInput = null;
var editorLoginBtn = null;

// Erzeugt und hängt alle UI-Elemente an das Container-Element #editIconHere bzw. an <body>
function createEditorUI() {
    // Container für Icons (anpassbar im HTML: <div id="editIconHere"></div>)
    var container = document.getElementById('editIconHere');
    if (!container) {
        console.error('Container #editIconHere nicht gefunden!');
        return;
    }

    let uiButtons = `
        <span id="editorEditIcon" title="Seite bearbeiten">✏️</span>
        <span id="editorLogoutIcon" title="Abmelden" style="display:none; margin-right:8px; cursor:pointer;">🔒</span>
        <span id="editorSaveIcon" title="Speichern" style="display:none;">💾</span>
        <span id="editorCancelIcon" title="Abbrechen" style="display:none;">🗑️</span>
      `;
    container.insertAdjacentHTML('beforeend', uiButtons);

    var uiLoginModalDialog = `
        <div id="editorModalBackground" role="dialog" aria-modal="true">
          <div id="editorLoginBox">
            <button class="close-btn" aria-label="Schließen">&times;</button>
            <h2>Administrator Login</h2>
            <p>Bitte gib dein Passwort ein, um die Seite zu bearbeiten.</p>
            <form id="editorLoginForm" onsubmit="return false;">
              <input id="editorPasswordInput" type="password" placeholder="Passwort" required>
              <button id="editorLoginButton" type="submit">Anmelden</button>
            </form>
          </div>
        </div>
      `;
    document.body.insertAdjacentHTML('beforeend', uiLoginModalDialog);

    // Element-Referenzen
    editorEditIcon      = document.getElementById('editorEditIcon');
    editorLogoutIcon    = document.getElementById('editorLogoutIcon');
    editorSaveIcon      = document.getElementById('editorSaveIcon');
    editorCancelIcon    = document.getElementById('editorCancelIcon');
    editorLoginModal    = document.getElementById('editorModalBackground');
    editorPasswordInput = document.getElementById('editorPasswordInput');
    editorLoginBtn      = document.getElementById('editorLoginButton');

}

// Modal-Dialog
function editorShowModal() {
    editorLoginModal.classList.add('active');
    editorPasswordInput.focus();
}
function editorHideModal() {
    editorLoginModal.classList.remove('active');
}

// Neu laden und cache umgehen
function reloadNoCache() {
    // Basis-URL (ohne Query-String)
    const base = window.location.origin + window.location.pathname;
    // hänge Timestamp dran
    const url  = base + '?_=' + new Date().getTime();
    // navigiere dorthin ( ersetzt den aktuellen Eintrag im Verlauf )
    window.location.replace(url);
}

// Fetch-basierte AJAX-Hilfsfunktion
function ajaxPost(params) {
    return fetch('', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(params)
    }).then(function(res) { return res.json(); });
}

// Editor aktivieren
function activateEditing() {
    document.body.classList.add('editorActive');
    editorEditIcon.style.display   = 'none';
    editorLogoutIcon.style.display = 'none';
    editorSaveIcon.style.display   = 'inline-block';
    editorCancelIcon.style.display = 'inline-block';

    // Alle edit-Bereiche wirklich bearbeitbar machen
    document.querySelectorAll('.edit').forEach(function(div) {
        div.setAttribute('contenteditable', 'true');
        // Bei Klick den Cursor ans Ende setzen
        div.addEventListener('focus', function(e) {
            var range = document.createRange();
            range.selectNodeContents(div);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });
    });
}

// Haupt-Logik nach DOM-Ready
document.addEventListener('DOMContentLoaded', function() {
    createEditorUI();

    // Zunächst prüfen, ob schon eingeloggt
    ajaxPost({action: 'check'}).then(function(data) {
        if (data.loggedIn) {
            // Wenn eingeloggt: Logout-Icon einblenden, Edit-Icon weiterhin sichtbar
            editorLogoutIcon.style.display = 'inline-block';
        }
    });

    // Klick auf Edit-Icon
    editorEditIcon.addEventListener('click', function() {
        ajaxPost({action:'check'}).then(function(data) {
            console.log('check', data);
            if (data.loggedIn) {
                activateEditing();
            } else {
                editorShowModal();
            }
        });
    });

    // Klick auf Logout-Icon
    editorLogoutIcon.addEventListener('click', function() {
        ajaxPost({action:'logout'}).then(function(data) {
            reloadNoCache();
        });
    });

    // Speichern
    editorSaveIcon.addEventListener('click', function() {
        var changes = {};
        document.querySelectorAll('.edit').forEach(function(div) {
            changes[div.id] = div.innerHTML;
        });
        ajaxPost({action:'save', changes: JSON.stringify(changes)}).then(function(data) {
            console.log('save', data);
            if (data.saved) {
                if (data.missingIds.length > 0) {
                    alert(
                        'Einige Edit-Blöcke heben keine ID und konnten damit nicht eindeutig zugeordnet werden. ' +
                        'Bitte überprüfe die TAGS mit "edit"-Klasse auf das Vorhandensein einer eindeutigen id. ' +
                        'Es gibt folgende Problemstellen: ' +
                        data.missingIds.join(', ')
                    );
                }
                reloadNoCache();
            } else {
                alert('Fehler beim Speichern');
            }
        });
    });

    // Login-Button
    editorLoginBtn.addEventListener('click', function() {
        var pw = editorPasswordInput.value;
        ajaxPost({action:'login', password: pw}).then(function(data) {
            console.log('login', data);
            if (data.loggedIn) {
                editorHideModal();
                activateEditing();
            } else {
                alert('Falsches Passwort');
                editorHideModal();
            }
        });
    });

    // Abbrechen & Logout
    editorCancelIcon.addEventListener('click', function() {
        reloadNoCache();
    });

});
