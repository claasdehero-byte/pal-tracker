const initialCompetencies = [
    // A. AUSSCHEIDUNG & KATHETERISIERUNG
    { id: "A.1", bereich: "A. Ausscheidung", beschreibung: "Transurethralen Dauerkatheter legen (Mann)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "A.2", bereich: "A. Ausscheidung", beschreibung: "Transurethralen Dauerkatheter legen (Frau)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "A.3", bereich: "A. Ausscheidung", beschreibung: "Transurethralen Dauerkatheter wechseln", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "A.4", bereich: "A. Ausscheidung", beschreibung: "Dauerkatheter entfernen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "A.5", bereich: "A. Ausscheidung", beschreibung: "Einmalkatheterisierung (Mann)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "A.6", bereich: "A. Ausscheidung", beschreibung: "Einmalkatheterisierung (Frau)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "A.7", bereich: "A. Ausscheidung", beschreibung: "Suprapubischen Katheter versorgen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "A.8", bereich: "A. Ausscheidung", beschreibung: "Urinbeutel wechseln (sterile Technik)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "A.9", bereich: "A. Ausscheidung", beschreibung: "Blasenspülung durchführen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // B. WUNDMANAGEMENT
    { id: "B.1", bereich: "B. Wundmanagement", beschreibung: "Verbandswechsel an aseptischen Wunden", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "B.2", bereich: "B. Wundmanagement", beschreibung: "Verbandswechsel an septischen Wunden", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "B.3", bereich: "B. Wundmanagement", beschreibung: "Verbandswechsel bei chronischen Wunden (Dekubitus)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "B.4", bereich: "B. Wundmanagement", beschreibung: "Verbandswechsel bei Ulcus cruris", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "B.5", bereich: "B. Wundmanagement", beschreibung: "Wunddokumentation nach Expertenstandard", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "B.6", bereich: "B. Wundmanagement", beschreibung: "VAC-Therapie (Vakuumversiegelung) überwachen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "B.7", bereich: "B. Wundmanagement", beschreibung: "Kompressionsbandagen anlegen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "B.8", bereich: "B. Wundmanagement", beschreibung: "Nahtmaterial/Klammern entfernen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "B.9", bereich: "B. Wundmanagement", beschreibung: "Wundbeurteilung nach Wundheilungsphasen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // C. INJEKTIONEN & INFUSIONEN
    { id: "C.1", bereich: "C. Injektionen", beschreibung: "Subkutane Injektion", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "C.2", bereich: "C. Injektionen", beschreibung: "Intramuskuläre Injektion", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "C.3", bereich: "C. Injektionen", beschreibung: "Venöse Blutentnahme", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "C.4", bereich: "C. Injektionen", beschreibung: "Kapilläre Blutentnahme (BZ-Messung)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "C.5", bereich: "C. Injektionen", beschreibung: "Periphere Venenverweilkanüle legen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "C.6", bereich: "C. Injektionen", beschreibung: "Infusion vorbereiten und anschließen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "C.7", bereich: "C. Injektionen", beschreibung: "Infusionsgeschwindigkeit berechnen und einstellen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "C.8", bereich: "C. Injektionen", beschreibung: "Portversorgung (Zugang/Pflege)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "C.9", bereich: "C. Injektionen", beschreibung: "Medikamentengabe über PEG-Sonde", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // D. ATEMWEGE & SAUERSTOFF
    { id: "D.1", bereich: "D. Atemwege", beschreibung: "Sauerstoffgabe per Nasensonde", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "D.2", bereich: "D. Atemwege", beschreibung: "Sauerstoffgabe per Maske", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "D.3", bereich: "D. Atemwege", beschreibung: "Absaugen über Tubus/Trachealkanüle", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "D.4", bereich: "D. Atemwege", beschreibung: "Trachealkanüle pflegen/wechseln", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "D.5", bereich: "D. Atemwege", beschreibung: "Inhalation durchführen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "D.6", bereich: "D. Atemwege", beschreibung: "Atemgymnastik anleiten", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "D.7", bereich: "D. Atemwege", beschreibung: "Pulsoxymetrie durchführen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // E. ERNÄHRUNG
    { id: "E.1", bereich: "E. Ernährung", beschreibung: "Magensonde legen (transnasal)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "E.2", bereich: "E. Ernährung", beschreibung: "PEG-Versorgung/Pflege", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "E.3", bereich: "E. Ernährung", beschreibung: "Sondennahrung verabreichen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "E.4", bereich: "E. Ernährung", beschreibung: "Nahrungskarenz überwachen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "E.5", bereich: "E. Ernährung", beschreibung: "Schluckstörungen erkennen und dokumentieren", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // F. VITALZEICHENKONTROLLE & MONITORING
    { id: "F.1", bereich: "F. Vitalzeichen", beschreibung: "Blutdruck messen (manuell)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "F.2", bereich: "F. Vitalzeichen", beschreibung: "Blutdruck messen (automatisch)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "F.3", bereich: "F. Vitalzeichen", beschreibung: "Puls tasten und beurteilen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "F.4", bereich: "F. Vitalzeichen", beschreibung: "Atemfrequenz zählen und beurteilen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "F.5", bereich: "F. Vitalzeichen", beschreibung: "Körpertemperatur messen (verschiedene Messorte)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "F.6", bereich: "F. Vitalzeichen", beschreibung: "EKG-Monitoring anlegen und überwachen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "F.7", bereich: "F. Vitalzeichen", beschreibung: "Schmerzerfassung mit Schmerzskalen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "F.8", bereich: "F. Vitalzeichen", beschreibung: "Bewusstseinslage beurteilen (GCS)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "F.9", bereich: "F. Vitalzeichen", beschreibung: "Flüssigkeitsbilanzierung", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // G. PROPHYLAXEN
    { id: "G.1", bereich: "G. Prophylaxen", beschreibung: "Dekubitusprophylaxe durchführen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "G.2", bereich: "G. Prophylaxen", beschreibung: "Thromboseprophylaxe (s.c. Heparin)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "G.3", bereich: "G. Prophylaxen", beschreibung: "Pneumonieprophylaxe", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "G.4", bereich: "G. Prophylaxen", beschreibung: "Kontrakturenprophylaxe", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "G.5", bereich: "G. Prophylaxen", beschreibung: "Sturzprophylaxe", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "G.6", bereich: "G. Prophylaxen", beschreibung: "Aspirationsprophylaxe", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "G.7", bereich: "G. Prophylaxen", beschreibung: "Soor- und Parotitisprophylaxe", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // H. HYGIENE & DESINFEKTION
    { id: "H.1", bereich: "H. Hygiene", beschreibung: "Hygienische Händedesinfektion", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "H.2", bereich: "H. Hygiene", beschreibung: "Sterile Handschuhe anziehen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "H.3", bereich: "H. Hygiene", beschreibung: "Steriles Arbeiten", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "H.4", bereich: "H. Hygiene", beschreibung: "Flächendesinfektion", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "H.5", bereich: "H. Hygiene", beschreibung: "Instrumentenaufbereitung", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "H.6", bereich: "H. Hygiene", beschreibung: "Isolationsmaßnahmen umsetzen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "H.7", bereich: "H. Hygiene", beschreibung: "PSA (Persönliche Schutzausrüstung) korrekt anwenden", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // I. MOBILISATION & LAGERUNG
    { id: "I.1", bereich: "I. Mobilisation", beschreibung: "Rückenschonende Arbeitsweise (Kinästhetik)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "I.2", bereich: "I. Mobilisation", beschreibung: "Patienten im Bett mobilisieren", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "I.3", bereich: "I. Mobilisation", beschreibung: "Transfer Bett-Stuhl mit 2 Personen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "I.4", bereich: "I. Mobilisation", beschreibung: "Transfer mit Lifter", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "I.5", bereich: "I. Mobilisation", beschreibung: "30°-Lagerung", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "I.6", bereich: "I. Mobilisation", beschreibung: "135°-Lagerung", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "I.7", bereich: "I. Mobilisation", beschreibung: "A-Lagerung bei Hemiplegie", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "I.8", bereich: "I. Mobilisation", beschreibung: "Bauchlagerung", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // J. KÖRPERPFLEGE
    { id: "J.1", bereich: "J. Körperpflege", beschreibung: "Ganzwaschung im Bett", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "J.2", bereich: "J. Körperpflege", beschreibung: "Teilwaschung", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "J.3", bereich: "J. Körperpflege", beschreibung: "Intimhygiene", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "J.4", bereich: "J. Körperpflege", beschreibung: "Mundpflege bei bewusstlosen Patienten", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "J.5", bereich: "J. Körperpflege", beschreibung: "Haarwäsche im Bett", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "J.6", bereich: "J. Körperpflege", beschreibung: "Rasur", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "J.7", bereich: "J. Körperpflege", beschreibung: "Nagelpflege", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // K. MEDIKAMENTENMANAGEMENT
    { id: "K.1", bereich: "K. Medikamente", beschreibung: "Medikamente richten (5-R-Regel)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "K.2", bereich: "K. Medikamente", beschreibung: "Medikamente verabreichen (oral)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "K.3", bereich: "K. Medikamente", beschreibung: "Augentropfen/Salben verabreichen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "K.4", bereich: "K. Medikamente", beschreibung: "Pflaster applizieren", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "K.5", bereich: "K. Medikamente", beschreibung: "BTM-Medikamente handhaben", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "K.6", bereich: "K. Medikamente", beschreibung: "Arzneimittelwechselwirkungen erkennen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // L. NOTFALLMANAGEMENT
    { id: "L.1", bereich: "L. Notfall", beschreibung: "Vitalfunktionen kontrollieren", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "L.2", bereich: "L. Notfall", beschreibung: "Notfallsituationen erkennen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "L.3", bereich: "L. Notfall", beschreibung: "Reanimation (Basic Life Support)", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "L.4", bereich: "L. Notfall", beschreibung: "Schockzeichen erkennen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "L.5", bereich: "L. Notfall", beschreibung: "Stabile Seitenlage", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "L.6", bereich: "L. Notfall", beschreibung: "Blutzuckerentgleisung erkennen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },

    // M. DOKUMENTATION & KOMMUNIKATION
    { id: "M.1", bereich: "M. Dokumentation", beschreibung: "Pflegeplanung erstellen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "M.2", bereich: "M. Dokumentation", beschreibung: "Pflegebericht schreiben", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "M.3", bereich: "M. Dokumentation", beschreibung: "Pflegevisite durchführen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "M.4", bereich: "M. Dokumentation", beschreibung: "Übergabe strukturiert gestalten", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "M.5", bereich: "M. Dokumentation", beschreibung: "Patientengespräche führen", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" },
    { id: "M.6", bereich: "M. Dokumentation", beschreibung: "Angehörigenberatung", gesehen: false, unterAufsicht: false, selbststaendig: false, status: "rot", datum: "", note: "" }
];

const initialAssignments = [];

const initialUserData = {
    name: "",
    kurs: "",
    zeitraumVon: "",
    zeitraumBis: "",
    einsatzbereich: "",
    praxisanleitung: ""
};

if (typeof window !== 'undefined') {
    window.PFLEGE_DATA = { initialCompetencies, initialAssignments, initialUserData };
}
