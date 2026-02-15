/**
 * Google Sheets API Integration für PAL Tracker
 * Ersetzt localStorage durch zentrale Google Sheets Datenbank
 * 
 * Kommuniziert mit Google Apps Script Web-App (Code.gs)
 */

// ============================================
// KONFIGURATION — DIESE WERTE ANPASSEN!
// ============================================
const SHEETS_CONFIG = {
    // Web-App URL aus Google Apps Script Bereitstellung einfügen:
    webAppUrl: 'DEINE_WEBAPP_URL_HIER',
    // Sync-Intervall in Millisekunden (30 Sekunden)
    syncInterval: 30000,
    // Aktiviert/deaktiviert Google Sheets (false = nur localStorage)
    enabled: true
};

// ============================================
// Interner State
// ============================================
let _syncTimer = null;
let _onSyncStatus = null;
let _onDataRefresh = null;
let _isSyncing = false;

// ============================================
// Basis-API Funktionen
// ============================================

/**
 * GET-Request an Google Apps Script
 */
async function sheetsGet(params) {
    const url = `${SHEETS_CONFIG.webAppUrl}?${new URLSearchParams(params)}`;
    const response = await fetch(url, { redirect: 'follow' });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
}

/**
 * POST-Request an Google Apps Script
 */
async function sheetsPost(body) {
    const response = await fetch(SHEETS_CONFIG.webAppUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
}

/**
 * Prüfe ob die API erreichbar und konfiguriert ist
 */
function isConfigured() {
    return SHEETS_CONFIG.enabled &&
        SHEETS_CONFIG.webAppUrl &&
        SHEETS_CONFIG.webAppUrl !== 'DEINE_WEBAPP_URL_HIER';
}

// ============================================
// HIGH-LEVEL API — Arbeitet mit flachen Student-Objekten
// (wie sie main.js erwartet)
// ============================================

const GoogleSheetsAPI = {

    /**
     * Alle Studenten mit allen Unterdaten laden und als flache Objekte zurückgeben
     */
    async loadAllStudents() {
        if (!isConfigured()) return null;

        if (_onSyncStatus) _onSyncStatus('syncing');

        try {
            // Alle 5 Sheets parallel laden
            const [azubis, gespraeche, auftraege, nachweise, eintraege] = await Promise.all([
                sheetsGet({ sheet: 'Auszubildende' }),
                sheetsGet({ sheet: 'Gespraeche' }),
                sheetsGet({ sheet: 'Arbeitsauftraege' }),
                sheetsGet({ sheet: 'Anleitungsnachweise' }),
                sheetsGet({ sheet: 'AnleitungsEintraege' })
            ]);

            // Nur aktive Azubis
            const activeAzubis = azubis.filter(a => a.Status === 'Aktiv');

            // Flache Student-Objekte zusammenbauen
            const students = activeAzubis.map(azubi => {
                const id = String(azubi.ID);

                // Gespräche für diesen Azubi
                const myGespraeche = gespraeche.filter(g => String(g.AzubiID) === id);
                const findGespraech = (typ) => myGespraeche.find(g => g.GespraechsTyp === typ) || {};

                const intro = findGespraech('Einführung');
                const zwischen = findGespraech('Zwischen');
                const abschluss = findGespraech('Abschluss');

                // Arbeitsaufträge
                const myAuftraege = auftraege.filter(a => String(a.AzubiID) === id);

                // Anleitungsnachweis
                const myNachweis = nachweise.find(n => String(n.AzubiID) === id) || {};
                const nachweisId = myNachweis.ID ? String(myNachweis.ID) : null;

                // Einträge für diesen Nachweis
                const myEintraege = nachweisId
                    ? eintraege.filter(e => String(e.NachweisID) === nachweisId)
                    : [];

                return {
                    id: id,
                    _sheetId: azubi.ID,
                    vorname: azubi.Vorname || '',
                    nachname: azubi.Nachname || '',
                    farbe: azubi.Farbe || '#3b82f6',
                    lehrjahr: parseInt(azubi.Lehrjahr) || 1,
                    einsatzStart: azubi.EinsatzStart || '',
                    einsatzEnde: azubi.EinsatzEnde || '',
                    gespraeche: {
                        einfuehrung: {
                            _sheetId: intro.ID || null,
                            erledigt: intro.Erledigt === true || intro.Erledigt === 'TRUE',
                            datum: intro.DurchgefuehrtAm || '',
                            praxisanleiter: intro.Praxisanleiter || '',
                            geplantAm: intro.GeplantAm || '',
                            notizen: intro.Notizen || ''
                        },
                        zwischen: {
                            _sheetId: zwischen.ID || null,
                            erledigt: zwischen.Erledigt === true || zwischen.Erledigt === 'TRUE',
                            datum: zwischen.DurchgefuehrtAm || '',
                            praxisanleiter: zwischen.Praxisanleiter || '',
                            geplantAm: zwischen.GeplantAm || '',
                            notizen: zwischen.Notizen || ''
                        },
                        abschluss: {
                            _sheetId: abschluss.ID || null,
                            erledigt: abschluss.Erledigt === true || abschluss.Erledigt === 'TRUE',
                            datum: abschluss.DurchgefuehrtAm || '',
                            praxisanleiter: abschluss.Praxisanleiter || '',
                            geplantAm: abschluss.GeplantAm || '',
                            notizen: abschluss.Notizen || ''
                        }
                    },
                    arbeitsauftraege: myAuftraege.map(a => ({
                        _sheetId: a.ID,
                        aufgabe: a.Aufgabe || '',
                        erledigt: a.Erledigt === true || a.Erledigt === 'TRUE',
                        zugewiesenAm: a.ZugewiesenAm || '',
                        notizen: a.Notizen || ''
                    })),
                    anleitungsnachweis: {
                        _sheetId: myNachweis.ID || null,
                        bereich: myNachweis.Bereich || 'MIN-148 Pulmologie u. Infektiologie',
                        monat_jahr: myNachweis.MonatJahr || '',
                        kurs_nr: myNachweis.KursNr || '',
                        bemerkung: myNachweis.Bemerkung || '',
                        eintraege: myEintraege.map(e => ({
                            _sheetId: e.ID,
                            datum: e.Datum || '',
                            anleitungszeit_minuten: parseInt(e.AnleitungszeitMinuten) || 0,
                            praxisanleiter: e.Praxisanleiter || '',
                            anleitungssituation: e.Anleitungssituation || ''
                        }))
                    }
                };
            });

            if (_onSyncStatus) _onSyncStatus('synced');
            return students;

        } catch (error) {
            console.error('[Sheets] Laden fehlgeschlagen:', error);
            if (_onSyncStatus) _onSyncStatus('error');
            throw error;
        }
    },

    /**
     * Neuen Studenten erstellen (in allen relevanten Sheets)
     */
    async createStudent(student) {
        if (!isConfigured()) return null;

        // 1. Azubi-Stammdaten
        const azubiResult = await sheetsPost({
            action: 'create',
            sheet: 'Auszubildende',
            data: {
                Vorname: student.vorname,
                Nachname: student.nachname,
                Farbe: student.farbe,
                Lehrjahr: student.lehrjahr,
                EinsatzStart: student.einsatzStart,
                EinsatzEnde: student.einsatzEnde,
                Status: 'Aktiv'
            }
        });

        const azubiId = azubiResult.id;
        student.id = String(azubiId);
        student._sheetId = azubiId;

        // 2. Standard-Gespräche (3 Typen)
        const gespraechTypes = ['Einführung', 'Zwischen', 'Abschluss'];
        await Promise.all(gespraechTypes.map(typ =>
            sheetsPost({
                action: 'create',
                sheet: 'Gespraeche',
                data: {
                    AzubiID: azubiId,
                    GespraechsTyp: typ,
                    GeplantAm: '',
                    DurchgefuehrtAm: '',
                    Praxisanleiter: '',
                    Erledigt: false,
                    Notizen: ''
                }
            })
        ));

        // 3. Anleitungsnachweis (leer)
        await sheetsPost({
            action: 'create',
            sheet: 'Anleitungsnachweise',
            data: {
                AzubiID: azubiId,
                Bereich: 'MIN-148 Pulmologie u. Infektiologie',
                MonatJahr: '',
                KursNr: '',
                Bemerkung: ''
            }
        });

        return azubiResult;
    },

    /**
     * Studenten-Daten speichern (alle geänderten Sheets aktualisieren)
     */
    async saveStudent(student) {
        if (!isConfigured() || !student._sheetId) return;

        if (_onSyncStatus) _onSyncStatus('syncing');

        try {
            const azubiId = student._sheetId;

            // 1. Stammdaten aktualisieren
            await sheetsPost({
                action: 'update',
                sheet: 'Auszubildende',
                id: azubiId,
                data: {
                    Vorname: student.vorname,
                    Nachname: student.nachname,
                    Farbe: student.farbe,
                    Lehrjahr: student.lehrjahr,
                    EinsatzStart: student.einsatzStart,
                    EinsatzEnde: student.einsatzEnde
                }
            });

            // 2. Gespräche aktualisieren
            const gespraecheMap = {
                'Einführung': student.gespraeche.einfuehrung,
                'Zwischen': student.gespraeche.zwischen,
                'Abschluss': student.gespraeche.abschluss
            };

            for (const [typ, data] of Object.entries(gespraecheMap)) {
                if (data._sheetId) {
                    await sheetsPost({
                        action: 'update',
                        sheet: 'Gespraeche',
                        id: data._sheetId,
                        data: {
                            GeplantAm: data.geplantAm || data.datum || '',
                            DurchgefuehrtAm: data.datum || '',
                            Praxisanleiter: data.praxisanleiter || '',
                            Erledigt: data.erledigt || false,
                            Notizen: data.notizen || ''
                        }
                    });
                } else {
                    // Gespräch existiert noch nicht → erstellen
                    const result = await sheetsPost({
                        action: 'create',
                        sheet: 'Gespraeche',
                        data: {
                            AzubiID: azubiId,
                            GespraechsTyp: typ,
                            GeplantAm: data.geplantAm || '',
                            DurchgefuehrtAm: data.datum || '',
                            Praxisanleiter: data.praxisanleiter || '',
                            Erledigt: data.erledigt || false,
                            Notizen: data.notizen || ''
                        }
                    });
                    data._sheetId = result.id;
                }
            }

            // 3. Arbeitsaufträge synchronisieren
            // Bestehende Aufträge in Sheets für diesen Azubi laden
            const existingAuftraege = await sheetsGet({ sheet: 'Arbeitsauftraege', azubiId: azubiId });
            const existingIds = existingAuftraege.map(a => a.ID);

            // Neue Aufträge erstellen (ohne _sheetId)
            for (const auftrag of student.arbeitsauftraege) {
                if (!auftrag._sheetId) {
                    const result = await sheetsPost({
                        action: 'create',
                        sheet: 'Arbeitsauftraege',
                        data: {
                            AzubiID: azubiId,
                            Aufgabe: auftrag.aufgabe,
                            Erledigt: auftrag.erledigt || false,
                            ZugewiesenAm: auftrag.zugewiesenAm || '',
                            Notizen: auftrag.notizen || ''
                        }
                    });
                    auftrag._sheetId = result.id;
                } else {
                    // Bestehende aktualisieren
                    await sheetsPost({
                        action: 'update',
                        sheet: 'Arbeitsauftraege',
                        id: auftrag._sheetId,
                        data: {
                            Erledigt: auftrag.erledigt || false,
                            Notizen: auftrag.notizen || ''
                        }
                    });
                }
            }

            // Gelöschte Aufträge erkennen und löschen
            const currentIds = student.arbeitsauftraege.filter(a => a._sheetId).map(a => a._sheetId);
            const deletedIds = existingIds.filter(id => !currentIds.includes(id));
            if (deletedIds.length) {
                await sheetsPost({ action: 'bulkDelete', sheet: 'Arbeitsauftraege', ids: deletedIds });
            }

            // 4. Anleitungsnachweis aktualisieren
            const nachweis = student.anleitungsnachweis;
            if (nachweis._sheetId) {
                await sheetsPost({
                    action: 'update',
                    sheet: 'Anleitungsnachweise',
                    id: nachweis._sheetId,
                    data: {
                        Bereich: nachweis.bereich || '',
                        MonatJahr: nachweis.monat_jahr || '',
                        KursNr: nachweis.kurs_nr || '',
                        Bemerkung: nachweis.bemerkung || ''
                    }
                });

                // Einträge synchronisieren
                const existingEintraege = await sheetsGet({ sheet: 'AnleitungsEintraege', nachweisId: nachweis._sheetId });
                const existingEintragIds = existingEintraege.map(e => e.ID);

                for (const eintrag of nachweis.eintraege) {
                    if (!eintrag._sheetId) {
                        const result = await sheetsPost({
                            action: 'create',
                            sheet: 'AnleitungsEintraege',
                            data: {
                                NachweisID: nachweis._sheetId,
                                Datum: eintrag.datum || '',
                                AnleitungszeitMinuten: eintrag.anleitungszeit_minuten || 0,
                                Praxisanleiter: eintrag.praxisanleiter || '',
                                Anleitungssituation: eintrag.anleitungssituation || ''
                            }
                        });
                        eintrag._sheetId = result.id;
                    } else {
                        await sheetsPost({
                            action: 'update',
                            sheet: 'AnleitungsEintraege',
                            id: eintrag._sheetId,
                            data: {
                                Datum: eintrag.datum || '',
                                AnleitungszeitMinuten: eintrag.anleitungszeit_minuten || 0,
                                Praxisanleiter: eintrag.praxisanleiter || '',
                                Anleitungssituation: eintrag.anleitungssituation || ''
                            }
                        });
                    }
                }

                // Gelöschte Einträge
                const currentEintragIds = nachweis.eintraege.filter(e => e._sheetId).map(e => e._sheetId);
                const deletedEintragIds = existingEintragIds.filter(id => !currentEintragIds.includes(id));
                if (deletedEintragIds.length) {
                    await sheetsPost({ action: 'bulkDelete', sheet: 'AnleitungsEintraege', ids: deletedEintragIds });
                }
            }

            if (_onSyncStatus) _onSyncStatus('synced');
        } catch (error) {
            console.error('[Sheets] Speichern fehlgeschlagen:', error);
            if (_onSyncStatus) _onSyncStatus('error');
            throw error;
        }
    },

    /**
     * Student archivieren (Status = Gelöscht)
     */
    async deleteStudent(student) {
        if (!isConfigured() || !student._sheetId) return;
        await sheetsPost({
            action: 'delete',
            sheet: 'Auszubildende',
            id: student._sheetId
        });
    },

    /**
     * Lokale Daten nach Google Sheets importieren (einmaliger Import)
     */
    async importFromLocalStorage() {
        const raw = localStorage.getItem('praxisanleiterTracker') || localStorage.getItem('azubi_tracker_state');
        if (!raw) throw new Error('Keine lokalen Daten gefunden');

        const data = JSON.parse(raw);
        if (!data.students || data.students.length === 0) throw new Error('Keine Azubis in lokalen Daten');

        let imported = 0;
        let skipped = 0;

        for (const student of data.students) {
            try {
                // Erstelle Azubi
                const result = await this.createStudent(student);
                const azubiId = result.id;

                // Gespräche mit Daten aktualisieren
                if (student.gespraeche) {
                    // Lade die gerade erstellten Gespräche
                    const newGespraeche = await sheetsGet({ sheet: 'Gespraeche', azubiId: azubiId });

                    const updateGespraech = async (typ, data) => {
                        const entry = newGespraeche.find(g => g.GespraechsTyp === typ);
                        if (entry && (data.datum || data.praxisanleiter || data.notizen || data.erledigt)) {
                            await sheetsPost({
                                action: 'update',
                                sheet: 'Gespraeche',
                                id: entry.ID,
                                data: {
                                    GeplantAm: data.geplantAm || '',
                                    DurchgefuehrtAm: data.datum || '',
                                    Praxisanleiter: data.praxisanleiter || '',
                                    Erledigt: data.erledigt || false,
                                    Notizen: data.notizen || ''
                                }
                            });
                        }
                    };

                    await updateGespraech('Einführung', student.gespraeche.einfuehrung || {});
                    await updateGespraech('Zwischen', student.gespraeche.zwischen || {});
                    await updateGespraech('Abschluss', student.gespraeche.abschluss || {});
                }

                // Arbeitsaufträge
                if (student.arbeitsauftraege && student.arbeitsauftraege.length) {
                    for (const auftrag of student.arbeitsauftraege) {
                        await sheetsPost({
                            action: 'create',
                            sheet: 'Arbeitsauftraege',
                            data: {
                                AzubiID: azubiId,
                                Aufgabe: auftrag.aufgabe || '',
                                Erledigt: auftrag.erledigt || false,
                                ZugewiesenAm: auftrag.zugewiesenAm || '',
                                Notizen: auftrag.notizen || ''
                            }
                        });
                    }
                }

                // Anleitungsnachweis-Einträge
                if (student.anleitungsnachweis && student.anleitungsnachweis.eintraege) {
                    const nachweise = await sheetsGet({ sheet: 'Anleitungsnachweise', azubiId: azubiId });
                    const nachweis = nachweise[0];
                    if (nachweis) {
                        // Header-Daten aktualisieren
                        await sheetsPost({
                            action: 'update',
                            sheet: 'Anleitungsnachweise',
                            id: nachweis.ID,
                            data: {
                                Bereich: student.anleitungsnachweis.bereich || '',
                                MonatJahr: student.anleitungsnachweis.monat_jahr || '',
                                KursNr: student.anleitungsnachweis.kurs_nr || '',
                                Bemerkung: student.anleitungsnachweis.bemerkung || ''
                            }
                        });

                        // Einträge
                        for (const eintrag of student.anleitungsnachweis.eintraege) {
                            if (eintrag.datum || eintrag.praxisanleiter || eintrag.anleitungssituation) {
                                await sheetsPost({
                                    action: 'create',
                                    sheet: 'AnleitungsEintraege',
                                    data: {
                                        NachweisID: nachweis.ID,
                                        Datum: eintrag.datum || '',
                                        AnleitungszeitMinuten: eintrag.anleitungszeit_minuten || 0,
                                        Praxisanleiter: eintrag.praxisanleiter || '',
                                        Anleitungssituation: eintrag.anleitungssituation || ''
                                    }
                                });
                            }
                        }
                    }
                }

                imported++;
            } catch (error) {
                console.error('[Import] Fehler bei Azubi:', student.vorname, student.nachname, error);
                skipped++;
            }
        }

        return { imported, skipped };
    },

    // ============================================
    // Auto-Refresh (Polling)
    // ============================================

    setSyncStatusCallback(fn) { _onSyncStatus = fn; },
    setDataRefreshCallback(fn) { _onDataRefresh = fn; },

    startAutoRefresh(interval) {
        if (!isConfigured()) return;
        this.stopAutoRefresh();
        _syncTimer = setInterval(async () => {
            if (_isSyncing) return;
            _isSyncing = true;
            try {
                const students = await this.loadAllStudents();
                if (students && _onDataRefresh) {
                    _onDataRefresh(students);
                }
            } catch (error) {
                console.warn('[Sheets] Auto-Refresh fehlgeschlagen:', error);
            } finally {
                _isSyncing = false;
            }
        }, interval || SHEETS_CONFIG.syncInterval);
    },

    stopAutoRefresh() {
        if (_syncTimer) {
            clearInterval(_syncTimer);
            _syncTimer = null;
        }
    }
};

// Exportiere als global
window.GoogleSheetsAPI = GoogleSheetsAPI;
