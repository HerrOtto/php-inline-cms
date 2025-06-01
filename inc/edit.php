<?php

$password = 'Geheimes Passwort!';

/**
 *
 * Inline-Editor für PHP-Seiten
 * Copyright (c) 2025 netzmal GmbH
 *
 * Dieses Skript stellt per AJAX folgende Endpunkte bereit:
 *  - login   : Vergleicht das eingegebene Passwort und startet die Session.
 *  - check   : Liefert zurück, ob der Nutzer eingeloggt ist.
 *  - save    : Liest alle Änderungen (innerHTML von <div class="edit">-Blöcken)
 *              und schreibt sie direkt in die aktuell ausgeführte PHP-Datei.
 *
 * Sicherheitsfeatures:
 *  - Speichert nur .php-Dateien im Document-Root.
 *
 */

session_start();
if (!array_key_exists('loggedIn', $_SESSION)) {
    $_SESSION['loggedIn'] = false;
}

// AJAX-Endpunkte: login, check, save
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'login') {
        // Login
        $_SESSION['loggedIn'] = (($_POST['password'] ?? '') === $password);
        header('Content-Type: application/json');
        echo json_encode(['loggedIn' => $_SESSION['loggedIn']]);
        exit;

    } else if ($action === 'logout') {
        // Session-Status abfragen
        session_destroy();
        header('Content-Type: application/json');
        echo json_encode(['loggedIn' => false]);
        exit;

    } else if ($action === 'check') {
        // Session-Status abfragen
        header('Content-Type: application/json');
        echo json_encode(['loggedIn' => $_SESSION['loggedIn']]);
        exit;

    } else if (($action === 'save') && $_SESSION['loggedIn']) {
        // Speichern
        $file    = realpath($_SERVER['SCRIPT_FILENAME']);
        $docRoot = realpath($_SERVER['DOCUMENT_ROOT']);

        // Nur Dateien unter DOCUMENT_ROOT
        if (strpos($file, $docRoot) !== 0) {
            http_response_code(403);
            exit;
        }

        // Nur PHP-Dateien
        if (pathinfo($file, PATHINFO_EXTENSION) !== 'php') {
            http_response_code(403);
            exit;
        }

        // Schreibrechte prüfen
        if (!is_writable($file)) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Datei ist nicht beschreibbar']);
            exit;
        }

        // Änderungen einlesen und ersetzen
        $changes = json_decode($_POST['changes'] ?? '[]', true);
        $source  = file_get_contents($file);
        $newSource = $source;
        $missingIds = [];

        // Für jede id prüfen, ob sie existiert und ersetzen
        foreach ($changes as $id => $html) {
            $trimmedId = trim($id);
            if ($trimmedId === '') {
                $missingIds[] = '(leere ID)';
                continue;
            }

            // Pattern:
            // - öffnendes <div … id="ID" … class="…edit…" …>
            // - gefolgt von beliebigem Inhalt (auch PHP)
            // - bis zum Kommentar <!-- /ID -->
            $pattern = '~(                             
                <div                                   
                   (?=[^>]*\bid="' . preg_quote($trimmedId, '~') . '"[^>]*)
                   (?=[^>]*\bclass="[^"]*edit[^"]*"[^>]*)
                   [^>]*>                               
                )                                     
                (.*?)                                  
                (<\/div>\s*<!--\s*\/' . preg_quote($trimmedId, '~') . '\s*-->) 
            ~six';

            // Ersetze genau einmal pro ID
            $replacement = '$1' . $html . '$3';
            $count = 0;
            $newSource = preg_replace($pattern, $replacement, $newSource, 1, $count);
            if ($count === 0) {
                $missingIds[] = $id; // ID wurde nicht gefunden
            }
        }

        // und Schreiben
        file_put_contents($file, $newSource);

        header('Content-Type: application/json');
        echo json_encode([
            'saved' => true,
            'missingIds' => $missingIds
        ]);
        exit;

    }

    // Ungültige Anfrage
    http_response_code(400);
    exit;
}
