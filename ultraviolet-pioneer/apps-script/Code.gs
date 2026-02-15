/**
 * PAL Tracker API — Google Apps Script Backend
 * Diesen Code in Google Apps Script einfügen:
 * Google Sheet öffnen → Erweiterungen → Apps Script → Code.gs ersetzen
 *
 * Bereitstellung: Bereitstellen → Neue Bereitstellung → Web-App
 *   - Ausführen als: Ich
 *   - Zugriff: Jeder
 */

// ============================================
// GET-Anfragen — Daten abrufen
// ============================================

function doGet(e) {
  try {
    const params = e.parameter;
    const sheetName = params.sheet;
    const id = params.id;
    const azubiId = params.azubiId;
    const nachweisId = params.nachweisId;

    if (!sheetName) {
      return jsonResponse({ error: 'Parameter "sheet" fehlt' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ error: 'Tabellenblatt nicht gefunden: ' + sheetName });
    }

    const data = getSheetData(sheet);

    // Filter by foreign keys if provided
    let result = data;
    if (id) {
      result = data.filter(row => String(row.ID) === String(id));
    } else if (azubiId) {
      result = data.filter(row => String(row.AzubiID) === String(azubiId));
    } else if (nachweisId) {
      result = data.filter(row => String(row.NachweisID) === String(nachweisId));
    }

    return jsonResponse(result);

  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

// ============================================
// POST-Anfragen — Daten erstellen/ändern/löschen
// ============================================

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const sheetName = body.sheet;
    const data = body.data;
    const id = body.id;

    if (!sheetName || !action) {
      return jsonResponse({ error: 'Parameter "sheet" und "action" fehlen' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ error: 'Tabellenblatt nicht gefunden: ' + sheetName });
    }

    let result;

    switch (action) {
      case 'create':
        result = createRow(sheet, data);
        break;
      case 'update':
        result = updateRow(sheet, id, data);
        break;
      case 'delete':
        result = deleteRow(sheet, id);
        break;
      case 'bulkCreate':
        result = bulkCreate(sheet, body.items);
        break;
      case 'bulkDelete':
        result = bulkDelete(sheet, body.ids);
        break;
      default:
        result = { error: 'Unbekannte Aktion: ' + action };
    }

    return jsonResponse(result);

  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

// ============================================
// CRUD-Hilfsfunktionen
// ============================================

function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1)
    .filter(row => row[0] !== '' && row[0] !== null)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        // Convert Date objects to dd.mm.yyyy strings
        if (val instanceof Date) {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd.MM.yyyy');
        }
        obj[h] = val;
      });
      return obj;
    });
}

function createRow(sheet, data) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  // Generate next ID
  const lastRow = sheet.getLastRow();
  let newId = 1;
  if (lastRow > 1) {
    const ids = sheet.getRange(1, 1, lastRow, 1).getValues()
      .slice(1)
      .map(r => parseInt(r[0]) || 0);
    newId = Math.max(...ids) + 1;
  }

  const values = headers.map(h => {
    if (h === 'ID') return newId;
    return data[h] !== undefined ? data[h] : '';
  });

  sheet.appendRow(values);

  return { success: true, id: newId };
}

function updateRow(sheet, id, data) {
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];

  const rowIndex = allData.findIndex((row, i) => i > 0 && String(row[0]) === String(id));
  if (rowIndex === -1) {
    return { error: 'Eintrag mit ID ' + id + ' nicht gefunden' };
  }

  headers.forEach((h, colIndex) => {
    if (h !== 'ID' && data[h] !== undefined) {
      sheet.getRange(rowIndex + 1, colIndex + 1).setValue(data[h]);
    }
  });

  return { success: true };
}

function deleteRow(sheet, id) {
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];

  // If sheet has a Status column, archive instead of deleting
  const statusCol = headers.indexOf('Status');
  const rowIndex = allData.findIndex((row, i) => i > 0 && String(row[0]) === String(id));

  if (rowIndex === -1) {
    return { error: 'Eintrag mit ID ' + id + ' nicht gefunden' };
  }

  if (statusCol !== -1) {
    sheet.getRange(rowIndex + 1, statusCol + 1).setValue('Gelöscht');
  } else {
    sheet.deleteRow(rowIndex + 1);
  }

  return { success: true };
}

function bulkCreate(sheet, items) {
  if (!items || !items.length) return { success: true, created: 0 };
  const results = items.map(item => createRow(sheet, item));
  return { success: true, created: results.length, ids: results.map(r => r.id) };
}

function bulkDelete(sheet, ids) {
  if (!ids || !ids.length) return { success: true, deleted: 0 };
  // Delete from bottom to top to preserve row indices
  const allData = sheet.getDataRange().getValues();
  const rowIndices = ids
    .map(id => allData.findIndex((row, i) => i > 0 && String(row[0]) === String(id)))
    .filter(i => i !== -1)
    .sort((a, b) => b - a);

  rowIndices.forEach(idx => sheet.deleteRow(idx + 1));
  return { success: true, deleted: rowIndices.length };
}

// ============================================
// JSON-Response Hilfsfunktion
// ============================================

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// Test-Funktion (im Script Editor ausführen)
// ============================================

function testGetAuszubildende() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Auszubildende');
  const data = getSheetData(sheet);
  Logger.log(JSON.stringify(data, null, 2));
}

function setupSheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ---- Auszubildende ----
  let s = ss.getSheetByName('Auszubildende') || ss.insertSheet('Auszubildende');
  if (s.getLastRow() === 0) {
    s.appendRow(['ID', 'Vorname', 'Nachname', 'Farbe', 'Lehrjahr', 'EinsatzStart', 'EinsatzEnde', 'Status']);
    formatHeader(s);
    // Status-Dropdown
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Aktiv', 'Abgeschlossen', 'Gelöscht'], true).build();
    s.getRange('H2:H1000').setDataValidation(statusRule);
  }

  // ---- Gespraeche ----
  s = ss.getSheetByName('Gespraeche') || ss.insertSheet('Gespraeche');
  if (s.getLastRow() === 0) {
    s.appendRow(['ID', 'AzubiID', 'GespraechsTyp', 'GeplantAm', 'DurchgefuehrtAm', 'Praxisanleiter', 'Erledigt', 'Notizen']);
    formatHeader(s);
    const typRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Einführung', 'Zwischen', 'Abschluss'], true).build();
    s.getRange('C2:C1000').setDataValidation(typRule);
    const palRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Katrin Schulze', 'Dominique Büttner', 'Armand Murataj', 'Claus Clemens', 'Gilles Willet', 'Almedina Pilav'], true).build();
    s.getRange('F2:F1000').setDataValidation(palRule);
  }

  // ---- Arbeitsauftraege ----
  s = ss.getSheetByName('Arbeitsauftraege') || ss.insertSheet('Arbeitsauftraege');
  if (s.getLastRow() === 0) {
    s.appendRow(['ID', 'AzubiID', 'Aufgabe', 'Erledigt', 'ZugewiesenAm', 'Notizen']);
    formatHeader(s);
  }

  // ---- Anleitungsnachweise ----
  s = ss.getSheetByName('Anleitungsnachweise') || ss.insertSheet('Anleitungsnachweise');
  if (s.getLastRow() === 0) {
    s.appendRow(['ID', 'AzubiID', 'Bereich', 'MonatJahr', 'KursNr', 'Bemerkung']);
    formatHeader(s);
  }

  // ---- AnleitungsEintraege ----
  s = ss.getSheetByName('AnleitungsEintraege') || ss.insertSheet('AnleitungsEintraege');
  if (s.getLastRow() === 0) {
    s.appendRow(['ID', 'NachweisID', 'Datum', 'AnleitungszeitMinuten', 'Praxisanleiter', 'Anleitungssituation']);
    formatHeader(s);
    const palRule2 = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Katrin Schulze', 'Dominique Büttner', 'Armand Murataj', 'Claus Clemens', 'Gilles Willet', 'Almedina Pilav'], true).build();
    s.getRange('E2:E1000').setDataValidation(palRule2);
  }

  Logger.log('✅ Alle Tabellenblätter wurden eingerichtet!');
}

function formatHeader(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285F4');
  headerRange.setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
}
