/**
 * State Management
 */
let state = {
    students: [],
    selectedStudentId: null,
    currentDate: new Date(),
};

let isOnline = false; // Whether Google Sheets is available

// ========================================
// Persistence — Hybrid (Google Sheets + localStorage)
// ========================================

/**
 * Save state to localStorage (always, as cache).
 */
const saveToLocalStorage = () => {
    const s = { ...state, currentDate: state.currentDate.toISOString() };
    localStorage.setItem('praxisanleiterTracker', JSON.stringify(s));
};

/**
 * Save student to Google Sheets (if online).
 */
async function syncStudentToSheets(student) {
    if (!isOnline || !student) return;
    try {
        await GoogleSheetsAPI.saveStudent(student);
    } catch (error) {
        console.error('[Sync] Speichern fehlgeschlagen:', error);
    }
}

/**
 * Save all state — local + optional Google Sheets sync.
 */
async function saveState(studentToSync = null) {
    saveToLocalStorage();
    if (studentToSync && isOnline) {
        await syncStudentToSheets(studentToSync);
    }
}

const loadFromLocalStorage = () => {
    // Check both old and new localStorage keys for backward compatibility
    const saved = localStorage.getItem('praxisanleiterTracker') || localStorage.getItem('azubi_tracker_state');
    if (saved) {
        let parsed = JSON.parse(saved);

        // Data Migration for MIN-148 structure
        if (parsed.students) {
            parsed.students = parsed.students.map(s => {
                // Migration: name -> vorname/nachname
                if (s.name && (!s.vorname || !s.nachname)) {
                    // Filter out literal 'undefined' strings
                    const parts = s.name.split(' ').filter(p => p !== 'undefined' && p !== 'null' && p !== '');
                    s.vorname = s.vorname || parts[0] || 'Unbekannt';
                    s.nachname = s.nachname || (parts.length > 1 ? parts.slice(1).join(' ') : 'Azubi');
                }

                // Cleanup: Check if fields are literal "undefined" strings
                if (s.vorname === 'undefined' || !s.vorname) s.vorname = 'Unbekannt';
                if (s.nachname === 'undefined' || !s.nachname) s.nachname = 'Azubi';

                // Migration: color -> farbe
                if (s.color && !s.farbe) {
                    s.farbe = s.color;
                }

                // Migration: milestones -> gespraeche
                if (s.milestones && !s.gespraeche) {
                    s.gespraeche = {
                        einfuehrung: { erledigt: s.milestones.intro || false, datum: '', praxisanleiter: '', notizen: '' },
                        zwischen: { erledigt: s.milestones.intermediate || false, datum: '', praxisanleiter: '', notizen: '' },
                        abschluss: { erledigt: s.milestones.final || false, datum: '', praxisanleiter: '', notizen: '' }
                    };
                }

                // Ensure essential structures exist
                if (!s.gespraeche) {
                    s.gespraeche = {
                        einfuehrung: { erledigt: false, datum: '', praxisanleiter: '', notizen: '' },
                        zwischen: { erledigt: false, datum: '', praxisanleiter: '', notizen: '' },
                        abschluss: { erledigt: false, datum: '', praxisanleiter: '', notizen: '' }
                    };
                }

                // Expansion: Add geplantAm fields if missing
                if (!s.gespraeche.zwischen.geplantAm) s.gespraeche.zwischen.geplantAm = '';
                if (!s.gespraeche.abschluss.geplantAm) s.gespraeche.abschluss.geplantAm = '';

                // Expansion: Default Lehrjahr
                if (s.lehrjahr === undefined) s.lehrjahr = 1;

                if (!s.arbeitsauftraege) s.arbeitsauftraege = [];
                if (!s.id) s.id = Date.now().toString() + Math.random();

                // Expansion: Anleitungsnachweis
                if (!s.anleitungsnachweis) {
                    s.anleitungsnachweis = {
                        bereich: "MIN-148 Pulmologie u. Infektiologie",
                        monat_jahr: "",
                        kurs_nr: "",
                        bemerkung: "",
                        eintraege: []
                    };
                }

                return s;
            });
        }

        state = {
            ...parsed,
            currentDate: new Date(parsed.currentDate || new Date())
        };
    }
};

/**
 * UI Selectors
 */
const studentList = document.getElementById('student-list');
const addStudentBtn = document.getElementById('add-student-btn');
const studentModal = document.getElementById('student-modal');
const saveStudentBtn = document.getElementById('save-student');
const cancelStudentBtn = document.getElementById('cancel-student');

// Modal Fields
const studentVorname = document.getElementById('student-vorname');
const studentNachname = document.getElementById('student-nachname');
const studentStart = document.getElementById('student-start');
const studentEnde = document.getElementById('student-ende');
const studentLehrjahr = document.getElementById('student-lehrjahr');
const colorOptions = document.querySelectorAll('.color-option');

// Content Areas
const monthDisplay = document.getElementById('month-display');
const calendarGrid = document.getElementById('calendar-grid');
const milestoneSection = document.getElementById('milestone-section');
const activeStudentBadge = document.getElementById('active-student-badge');
const activeStudentName = document.getElementById('active-student-name');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// Confirm Modal Selectors
const confirmModal = document.getElementById('confirm-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmOk = document.getElementById('confirm-ok');
const confirmCancel = document.getElementById('confirm-cancel');

/**
 * Confirm Dialog Logic
 */
let confirmCallback = null;

const openConfirmModal = (title, message, callback) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmCallback = callback;
    confirmModal.classList.remove('hidden');
};

const closeConfirmModal = () => {
    confirmModal.classList.add('hidden');
    confirmCallback = null;
};

confirmOk.onclick = () => {
    if (confirmCallback) confirmCallback();
    closeConfirmModal();
};

confirmCancel.onclick = closeConfirmModal;

// Milestones Details
const checkIntro = document.getElementById('check-intro');
const introDate = document.getElementById('intro-date');
const introMentor = document.getElementById('intro-mentor');
const introNotes = document.getElementById('intro-notes');

const checkIntermediate = document.getElementById('check-intermediate');
const interGeplant = document.getElementById('intermediate-geplant');
const interDate = document.getElementById('intermediate-date');
const interMentor = document.getElementById('intermediate-mentor');
const interNotes = document.getElementById('intermediate-notes');

const checkFinal = document.getElementById('check-final');
const finalGeplant = document.getElementById('final-geplant');
const finalDate = document.getElementById('final-date');
const finalMentor = document.getElementById('final-mentor');
const finalNotes = document.getElementById('final-notes');

// Assignments
const assignmentList = document.getElementById('assignment-list');
const assignmentDropdown = document.getElementById('assignment-dropdown');
const addAssignmentBtn = document.getElementById('add-assignment-btn');

// Progress
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');

// Actions
const saveAllBtn = document.getElementById('save-all-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');

// Anleitungsnachweis Selectors
const openDocBtn = document.getElementById('open-doc-btn');
const docModal = document.getElementById('doc-modal');
const closeDocBtn = document.getElementById('close-doc-btn');
const saveDocBtn = document.getElementById('save-doc-btn');
const printDocBtn = document.getElementById('print-doc-btn');
const addDocRowBtn = document.getElementById('add-doc-row-btn');
const docTableBody = document.getElementById('doc-table-body');

// Doc Form Fields
const docBereich = document.getElementById('doc-bereich');
const docStudentName = document.getElementById('doc-student-name');
const docMonatJahr = document.getElementById('doc-monat-jahr');
const docKursNr = document.getElementById('doc-kurs-nr');
const docBemerkung = document.getElementById('doc-bemerkung');

// Doc Stats
const statTotalMin = document.getElementById('stat-total-min');
const statTotalHrs = document.getElementById('stat-total-hrs');
const statWeeks = document.getElementById('stat-weeks');
const statSollHrs = document.getElementById('stat-soll-hrs');
const statSollMin = document.getElementById('stat-soll-min');
const docStatusMsg = document.getElementById('doc-status-msg');
const docProgressFill = document.getElementById('doc-progress-fill');

/**
 * Helper Functions
 */
const getInitials = (vorname, nachname) => {
    return `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase();
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
};

/**
 * Student Functions
 */
let selectedColor = '#3b82f6';

colorOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        colorOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedColor = opt.dataset.color;
    });
});

const renderStudents = () => {
    studentList.innerHTML = '';
    state.students.forEach(student => {
        const li = document.createElement('li');
        li.className = `student-item ${state.selectedStudentId === student.id ? 'active' : ''}`;

        // Fallbacks for display and robustness
        const displayVorname = student.vorname || 'Unbekannt';
        const displayNachname = student.nachname || 'Azubi';
        const displayFarbe = student.farbe || '#3b82f6';
        const lj = student.lehrjahr || 1;
        const initials = getInitials(displayVorname, displayNachname);

        li.innerHTML = `
            <div class="student-color-circle" style="background-color: ${displayFarbe}"></div>
            <span class="student-name">
                ${displayVorname} ${displayNachname}
                <span class="lj-badge lj-badge-${lj}" style="background-color: ${displayFarbe}">${initials} • LJ ${lj}</span>
            </span>
            <button class="delete-student" title="Löschen">✕</button>
        `;

        li.querySelector('.student-name').onclick = () => selectStudent(student.id);
        li.querySelector('.student-color-circle').onclick = () => selectStudent(student.id);

        li.querySelector('.delete-student').onclick = (e) => {
            e.stopPropagation();
            openConfirmModal(
                'Löschen bestätigen',
                `Möchten Sie Auszubildende(n) ${displayVorname} ${displayNachname} wirklich löschen?`,
                () => deleteStudent(student.id)
            );
        };

        studentList.appendChild(li);
    });
};

const deleteStudent = async (id) => {
    if (!id) return;
    const student = state.students.find(s => s.id === id);
    state.students = state.students.filter(s => s.id !== id);
    if (state.selectedStudentId === id) {
        state.selectedStudentId = null;
        milestoneSection.classList.add('hidden');
        activeStudentBadge.classList.add('hidden');
    }
    renderStudents();
    renderCalendar();
    saveToLocalStorage();
    // Delete from Google Sheets
    if (isOnline && student && student._sheetId) {
        try {
            await GoogleSheetsAPI.deleteStudent(student);
        } catch (error) {
            console.error('[Sheets] Löschen fehlgeschlagen:', error);
        }
    }
};

const selectStudent = (id) => {
    state.selectedStudentId = id;
    const student = state.students.find(s => s.id === id);

    if (student) {
        milestoneSection.classList.remove('hidden');
        activeStudentBadge.classList.remove('hidden');
        activeStudentName.textContent = `${student.vorname} ${student.nachname}`;

        // Update Milestones UI
        const loadMilestone = (type, data) => {
            document.getElementById(`check-${type}`).checked = data.erledigt || false;
            document.getElementById(`${type}-date`).value = data.datum || '';
            document.getElementById(`${type}-mentor`).value = data.praxisanleiter || '';
            document.getElementById(`${type}-notes`).value = data.notizen || '';

            const geplantEl = document.getElementById(`${type}-geplant`);
            if (geplantEl) geplantEl.value = data.geplantAm || '';
        };

        loadMilestone('intro', student.gespraeche.einfuehrung);
        loadMilestone('intermediate', student.gespraeche.zwischen);
        loadMilestone('final', student.gespraeche.abschluss);

        renderAssignments();
        updateProgressBar();
    } else {
        milestoneSection.classList.add('hidden');
        activeStudentBadge.classList.add('hidden');
    }

    renderStudents();
    renderCalendar();
    saveToLocalStorage();
};

const updateProgressBar = () => {
    const student = state.students.find(s => s.id === state.selectedStudentId);
    if (!student || !student.arbeitsauftraege) return;

    const total = student.arbeitsauftraege.length;
    const completed = student.arbeitsauftraege.filter(a => a.erledigt).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressBarFill.style.width = `${percentage}%`;
    progressText.textContent = `${completed}/${total} Arbeitsaufträge abgeschlossen (${percentage}%)`;

    // Color coding
    if (percentage <= 33) progressBarFill.style.backgroundColor = '#ef4444';
    else if (percentage <= 66) progressBarFill.style.backgroundColor = '#f59e0b';
    else progressBarFill.style.backgroundColor = '#10b981';
};

const addStudent = async () => {
    const vn = studentVorname.value.trim();
    const nn = studentNachname.value.trim();
    const start = studentStart.value;
    const end = studentEnde.value;
    const lj = studentLehrjahr.value;

    if (!vn || !nn || !start || !end || !lj) {
        alert('Bitte alle Pflichtfelder ausfüllen!');
        return;
    }

    const newStudent = {
        id: Date.now().toString(),
        vorname: vn,
        nachname: nn,
        farbe: selectedColor,
        lehrjahr: parseInt(lj),
        einsatzStart: start,
        einsatzEnde: end,
        gespraeche: {
            einfuehrung: { erledigt: false, datum: '', praxisanleiter: '', notizen: '' },
            zwischen: {
                geplantAm: '',
                erledigt: false, datum: '', praxisanleiter: '', notizen: ''
            },
            abschluss: {
                geplantAm: '',
                erledigt: false, datum: '', praxisanleiter: '', notizen: ''
            }
        },
        arbeitsauftraege: [],
        anleitungsnachweis: {
            bereich: "MIN-148 Pulmologie u. Infektiologie",
            monat_jahr: "",
            kurs_nr: "",
            bemerkung: "",
            eintraege: []
        },
        createdAt: new Date().toISOString()
    };

    state.students.push(newStudent);
    studentModal.classList.add('hidden');

    // Reset form
    studentVorname.value = '';
    studentNachname.value = '';
    studentStart.value = '';
    studentEnde.value = '';

    renderStudents();
    renderCalendar();
    saveToLocalStorage();

    // Sync to Google Sheets
    if (isOnline) {
        try {
            const result = await GoogleSheetsAPI.createStudent(newStudent);
            if (result) {
                newStudent._sheetId = result.id;
                newStudent.id = String(result.id);
                saveToLocalStorage();
                renderStudents();
            }
        } catch (error) {
            console.error('[Sheets] Azubi erstellen fehlgeschlagen:', error);
        }
    }
};

/**
 * Calendar Functions
 */
const renderCalendar = () => {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    const monthNames = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ];

    monthDisplay.textContent = `${monthNames[month]} ${year}`;
    calendarGrid.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    let startingDay = firstDayOfMonth.getDay();
    if (startingDay === 0) startingDay = 7;
    startingDay--;

    // Helper to get date string for a day in current month
    const getDateString = (day) => {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    };

    // Add empty slots for the first week
    for (let i = 0; i < startingDay; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day other-month';
        calendarGrid.appendChild(div);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        const dateStr = getDateString(i);

        div.innerHTML = `<span class="day-number">${i}</span>`;

        const barContainer = document.createElement('div');
        barContainer.className = 'calendar-bar-container';

        // Check for students active on this day
        state.students.forEach(student => {
            if (dateStr >= student.einsatzStart && dateStr <= student.einsatzEnde) {
                const bar = document.createElement('div');
                bar.className = 'deployment-bar';
                bar.style.backgroundColor = student.farbe;
                bar.textContent = getInitials(student.vorname, student.nachname);
                bar.title = `${student.vorname} ${student.nachname}\n${formatDate(student.einsatzStart)} - ${formatDate(student.einsatzEnde)}`;
                bar.onclick = () => selectStudent(student.id);

                // Marker Logic
                const addMarker = (label, talkKey) => {
                    const talk = student.gespraeche[talkKey];
                    const conducted = talk.datum;
                    const planned = talk.geplantAm;
                    const isDone = talk.erledigt;

                    // Logic: E only shows if conducted. Z/A show if conducted OR planned.
                    const displayDate = conducted || planned;

                    if (displayDate === dateStr) {
                        // Skip 'E' if not conducted (or at least if it's not marked done but we need a date to show it on calendar)
                        if (label === 'E' && !conducted) return;

                        const marker = document.createElement('div');
                        marker.className = `interview-marker marker-${label.toLowerCase()}`;
                        marker.textContent = label;

                        const today = new Date().toISOString().split('T')[0];

                        // Status visualization
                        if (isDone) {
                            marker.classList.add('marker-done');
                        } else if (planned && planned < today) {
                            marker.classList.add('marker-overdue');
                        } else if (planned) {
                            marker.classList.add('marker-planned');
                        }

                        // Tooltip construction
                        const talkTitle = label === 'E' ? 'Einführungsgespräch' : (label === 'Z' ? 'Zwischengespräch' : 'Abschlussgespräch');
                        const statusTxt = isDone ? '✓ Erledigt' : (planned && planned < today ? '! Überfällig' : '○ Geplant');

                        let tooltip = `${talkTitle}\n`;
                        if (planned) tooltip += `Geplant: ${formatDate(planned)}\n`;
                        if (conducted) tooltip += `Durchgeführt: ${formatDate(conducted)}\n`;
                        if (talk.praxisanleiter) tooltip += `Mit: ${talk.praxisanleiter}\n`;
                        tooltip += `Status: ${statusTxt}`;

                        marker.title = tooltip;
                        bar.appendChild(marker);
                    }
                };

                addMarker('E', 'einfuehrung');
                addMarker('Z', 'zwischen');
                addMarker('A', 'abschluss');

                barContainer.appendChild(bar);
            }
        });

        div.appendChild(barContainer);
        calendarGrid.appendChild(div);
    }
};

/**
 * Milestone & Assignment Handlers
 */
const saveAll = async () => {
    if (!state.selectedStudentId) return;
    const student = state.students.find(s => s.id === state.selectedStudentId);
    if (!student) return;

    const getMilestoneData = (type) => {
        const dateVal = document.getElementById(`${type}-date`).value;
        const mentorVal = document.getElementById(`${type}-mentor`).value;
        const geplantEl = document.getElementById(`${type}-geplant`);
        const geplantVal = geplantEl ? geplantEl.value : '';

        // Auto-Erledigt Logic: If Date AND Mentor are filled, it's done.
        const isAutoDone = dateVal !== '' && mentorVal !== '';

        return {
            erledigt: isAutoDone || document.getElementById(`check-${type}`).checked,
            datum: dateVal,
            praxisanleiter: mentorVal,
            geplantAm: geplantVal,
            notizen: document.getElementById(`${type}-notes`).value
        };
    };

    student.gespraeche = {
        einfuehrung: {
            ...getMilestoneData('intro'),
            geplantAm: '' // Intro has no planned date as per requirement
        },
        zwischen: getMilestoneData('intermediate'),
        abschluss: getMilestoneData('final')
    };

    await saveState(student);
    renderStudents();
    renderCalendar();
    alert('Daten wurden gespeichert.' + (isOnline ? ' ✓ Google Sheets synchronisiert' : ''));
};

const renderAssignments = () => {
    assignmentList.innerHTML = '';
    const student = state.students.find(s => s.id === state.selectedStudentId);
    if (!student) return;

    student.arbeitsauftraege.forEach((as, index) => {
        const div = document.createElement('div');
        div.className = 'assignment-item';
        div.innerHTML = `
            <div class="assignment-main">
                <label class="checkbox-container">
                    <input type="checkbox" ${as.erledigt ? 'checked' : ''} class="as-check" data-index="${index}">
                    <span class="checkmark"></span>
                    <span class="assignment-title">${as.aufgabe}</span>
                </label>
                <button class="delete-assign" data-index="${index}" style="background: none; border: none; cursor: pointer; color: #ef4444;">✕</button>
            </div>
            <div class="assignment-meta">
                <span>Zuweisung: ${formatDate(as.zugewiesenAm)}</span>
                <input type="text" placeholder="Bemerkung..." class="as-note" data-index="${index}" value="${as.notizen || ''}">
            </div>
        `;
        assignmentList.appendChild(div);
    });

    // Listeners for individual changes
    document.querySelectorAll('.as-check').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            student.arbeitsauftraege[idx].erledigt = e.target.checked;
            updateProgressBar();
            saveToLocalStorage();
        });
    });

    document.querySelectorAll('.as-note').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.dataset.index);
            student.arbeitsauftraege[idx].notizen = e.target.value;
            saveToLocalStorage();
        });
    });

    document.querySelectorAll('.delete-assign').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            student.arbeitsauftraege.splice(idx, 1);
            renderAssignments();
            updateProgressBar();
            saveToLocalStorage();
        });
    });
};

addAssignmentBtn.addEventListener('click', () => {
    if (!state.selectedStudentId) return;
    const val = assignmentDropdown.value;
    if (!val) {
        alert('Bitte eine Aufgabe auswählen!');
        return;
    }

    const student = state.students.find(s => s.id === state.selectedStudentId);
    student.arbeitsauftraege.push({
        aufgabe: val,
        erledigt: false,
        zugewiesenAm: new Date().toISOString().split('T')[0],
        notizen: ''
    });

    // Clear dropdown
    assignmentDropdown.value = '';
    renderAssignments();
    updateProgressBar();
    saveToLocalStorage();
    // Sync assignment to Sheets
    if (isOnline) {
        syncStudentToSheets(student);
    }
});

/**
 * Anleitungsnachweis Functions
 */
const openDocModal = () => {
    if (!state.selectedStudentId) return;
    const student = state.students.find(s => s.id === state.selectedStudentId);
    if (!student) return;

    docStudentName.value = `${student.vorname} ${student.nachname}`;
    docBereich.value = student.anleitungsnachweis.bereich || "MIN-148 Pulmologie u. Infektiologie";

    // Pre-fill month_jahr if empty
    if (!student.anleitungsnachweis.monat_jahr && student.einsatzStart && student.einsatzEnde) {
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(-2)}`;
        };
        const period = `${formatDate(student.einsatzStart)} - ${formatDate(student.einsatzEnde)}`;
        docMonatJahr.value = period;
    } else {
        docMonatJahr.value = student.anleitungsnachweis.monat_jahr || "";
    }

    docKursNr.value = student.anleitungsnachweis.kurs_nr || "";
    docBemerkung.value = student.anleitungsnachweis.bemerkung || "";

    renderDocTable();
    calculateDocStats();
    docModal.classList.remove('hidden');
};

const renderDocTable = () => {
    const student = state.students.find(s => s.id === state.selectedStudentId);
    docTableBody.innerHTML = '';

    // Sort by date
    student.anleitungsnachweis.eintraege.sort((a, b) => (a.datum > b.datum ? 1 : -1));

    // Ensure at least 15 rows for visual consistency if needed, but per-data is better.
    // User asked for "Mindestens 15 Zeilen standardmäßig anzeigen". 
    // We'll render existing data + empty rows if count < 15.
    const entries = student.anleitungsnachweis.eintraege;
    const count = Math.max(15, entries.length);

    for (let i = 0; i < count; i++) {
        const entry = entries[i] || { datum: '', anleitungszeit_minuten: '', praxisanleiter: '', anleitungssituation: '' };

        // Define "empty" for print
        const isEmpty = !entry.datum && (!entry.anleitungszeit_minuten || entry.anleitungszeit_minuten == 0) && !entry.praxisanleiter && !entry.anleitungssituation;

        const tr = document.createElement('tr');
        if (isEmpty) tr.className = 'zeile-leer';

        tr.innerHTML = `
            <td><input type="date" class="doc-row-date" value="${entry.datum}" data-index="${i}"></td>
            <td><input type="number" class="doc-row-min" value="${entry.anleitungszeit_minuten}" data-index="${i}" min="0"></td>
            <td>
                <select class="doc-row-mentor" data-index="${i}">
                    <option value="">Wählen...</option>
                    <option value="Katrin Schulze" ${entry.praxisanleiter === 'Katrin Schulze' ? 'selected' : ''}>Katrin Schulze</option>
                    <option value="Dominique Büttner" ${entry.praxisanleiter === 'Dominique Büttner' ? 'selected' : ''}>Dominique Büttner</option>
                    <option value="Armand Murataj" ${entry.praxisanleiter === 'Armand Murataj' ? 'selected' : ''}>Armand Murataj</option>
                    <option value="Claus Clemens" ${entry.praxisanleiter === 'Claus Clemens' ? 'selected' : ''}>Claus Clemens</option>
                    <option value="Gilles Willet" ${entry.praxisanleiter === 'Gilles Willet' ? 'selected' : ''}>Gilles Willet</option>
                    <option value="Almedina Pilav" ${entry.praxisanleiter === 'Almedina Pilav' ? 'selected' : ''}>Almedina Pilav</option>
                </select>
            </td>
            <td><textarea class="doc-row-situation autosize" data-index="${i}">${entry.anleitungssituation}</textarea></td>
            <td class="no-print"><button class="btn-delete-row" data-index="${i}">✕</button></td>
        `;
        docTableBody.appendChild(tr);
    }

    // Auto-resize handler for textareas
    const autoResize = (el) => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    document.querySelectorAll('.autosize').forEach(textarea => {
        textarea.addEventListener('input', () => autoResize(textarea));
        // Initial resize
        setTimeout(() => autoResize(textarea), 0);
    });

    // Attach listeners for live calculation
    document.querySelectorAll('.doc-row-min').forEach(input => {
        input.addEventListener('input', calculateDocStats);
    });

    document.querySelectorAll('.btn-delete-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.index);
            if (student.anleitungsnachweis.eintraege[idx]) {
                student.anleitungsnachweis.eintraege.splice(idx, 1);
                renderDocTable();
                calculateDocStats();
            } else {
                // If it's an empty placeholder row, just re-render to "clear" it conceptually 
                // but actually they are generated on the fly.
                renderDocTable();
            }
        });
    });
};

const calculateDocStats = () => {
    if (!state.selectedStudentId) return;
    const student = state.students.find(s => s.id === state.selectedStudentId);

    // Sum minutes from DOM (to handle unsaved live changes)
    let totalMin = 0;
    document.querySelectorAll('.doc-row-min').forEach(input => {
        totalMin += parseInt(input.value) || 0;
    });

    const totalHrs = (totalMin / 60).toFixed(1);

    // Calculate weeks
    const start = new Date(student.einsatzStart);
    const end = new Date(student.einsatzEnde);
    const diffTime = Math.abs(end - start);
    const weeks = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)));

    const sollHrs = (weeks * 5.7).toFixed(1);
    const sollMin = Math.round(weeks * 5.7 * 60);

    statTotalMin.textContent = totalMin;
    statTotalHrs.textContent = totalHrs;
    statWeeks.textContent = weeks;
    statSollHrs.textContent = sollHrs;
    statSollMin.textContent = sollMin;

    const progress = Math.min(100, Math.round((totalMin / sollMin) * 100));
    docProgressFill.style.width = `${progress}%`;

    docStatusMsg.className = 'doc-status-msg';
    if (totalMin >= sollMin) {
        docStatusMsg.textContent = '✓ Anforderung erfüllt';
        docStatusMsg.classList.add('status-valid');
    } else {
        const diffHrs = (sollHrs - totalHrs).toFixed(1);
        docStatusMsg.textContent = `⚠️ Noch ${diffHrs} Std. fehlen`;
        docStatusMsg.classList.add('status-warn');
    }
};

const saveDocData = async () => {
    if (!state.selectedStudentId) return;
    const student = state.students.find(s => s.id === state.selectedStudentId);

    student.anleitungsnachweis.bereich = docBereich.value;
    student.anleitungsnachweis.monat_jahr = docMonatJahr.value;
    student.anleitungsnachweis.kurs_nr = docKursNr.value;
    student.anleitungsnachweis.bemerkung = docBemerkung.value;

    // Collect entries
    const entries = [];
    const rows = docTableBody.querySelectorAll('tr');
    rows.forEach(tr => {
        const date = tr.querySelector('.doc-row-date').value;
        const min = parseInt(tr.querySelector('.doc-row-min').value);
        const mentor = tr.querySelector('.doc-row-mentor').value;
        const situation = tr.querySelector('.doc-row-situation').value;

        if (date || min || mentor || situation) {
            entries.push({
                datum: date,
                anleitungszeit_minuten: min || 0,
                praxisanleiter: mentor,
                anleitungssituation: situation
            });
        }
    });

    student.anleitungsnachweis.eintraege = entries;
    await saveState(student);
    alert('Anleitungsnachweis wurde gespeichert.' + (isOnline ? ' ✓ Google Sheets synchronisiert' : ''));
    renderDocTable(); // Refresh IDs/UI
};

/**
 * Event Listeners
 */
addStudentBtn.addEventListener('click', () => {
    studentModal.classList.remove('hidden');
});

cancelStudentBtn.addEventListener('click', () => {
    studentModal.classList.add('hidden');
});

saveStudentBtn.addEventListener('click', addStudent);
saveAllBtn.addEventListener('click', saveAll);
exportPdfBtn.addEventListener('click', () => window.print());

prevMonthBtn.addEventListener('click', () => {
    state.currentDate.setDate(1); // Avoid overflow when changing months
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
    saveToLocalStorage();
});

nextMonthBtn.addEventListener('click', () => {
    state.currentDate.setDate(1); // Avoid overflow when changing months
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
    saveToLocalStorage();
});

// Anleitungsnachweis Listeners
openDocBtn.addEventListener('click', openDocModal);
closeDocBtn.addEventListener('click', () => docModal.classList.add('hidden'));
saveDocBtn.addEventListener('click', saveDocData);
printDocBtn.addEventListener('click', () => printAnleitungsnachweis());
addDocRowBtn.addEventListener('click', () => {
    const student = state.students.find(s => s.id === state.selectedStudentId);
    student.anleitungsnachweis.eintraege.push({
        datum: '',
        anleitungszeit_minuten: '',
        praxisanleiter: '',
        anleitungssituation: ''
    });
    renderDocTable();
});

// ========================================
// App Initialization — Google Sheets
// ========================================

async function initializeApp() {
    console.log('[App] Initializing...');

    // Prüfe ob Google Sheets konfiguriert ist
    if (!isConfigured()) {
        console.log('[App] Google Sheets nicht konfiguriert, nur localStorage-Modus');
        updateSyncUI('offline');
        return;
    }

    // Versuche Daten von Google Sheets zu laden
    try {
        updateSyncUI('syncing');
        const students = await GoogleSheetsAPI.loadAllStudents();
        if (students && students.length > 0) {
            state.students = students;
            saveToLocalStorage();
            renderStudents();
            renderCalendar();
            if (state.selectedStudentId) selectStudent(state.selectedStudentId);
        }
        isOnline = true;
        updateSyncUI('synced');
    } catch (error) {
        console.warn('[App] Google Sheets Laden fehlgeschlagen:', error);
        updateSyncUI('error');
    }

    // Migration prüfen
    checkMigrationBanner();

    // Auto-Refresh starten (alle 30 Sekunden)
    if (isOnline) {
        GoogleSheetsAPI.setSyncStatusCallback((status) => updateSyncUI(status));
        GoogleSheetsAPI.setDataRefreshCallback((students) => {
            const currentSelected = state.selectedStudentId;
            state.students = students;
            saveToLocalStorage();
            renderStudents();
            renderCalendar();
            if (currentSelected) {
                state.selectedStudentId = currentSelected;
                const stillExists = state.students.find(s => s.id === currentSelected);
                if (stillExists) selectStudent(currentSelected);
            }
            // Update last sync time
            const timeEl = document.getElementById('last-sync-time');
            if (timeEl) {
                timeEl.textContent = 'Zuletzt: ' + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            }
        });
        GoogleSheetsAPI.startAutoRefresh(30000);
    }
}

// ========================================
// Sync Status UI
// ========================================

function updateSyncUI(status) {
    const indicator = document.getElementById('sync-indicator');
    const text = document.getElementById('sync-text');
    if (!indicator || !text) return;

    indicator.className = 'sync-indicator';

    switch (status) {
        case 'synced':
            indicator.classList.add('sync-connected');
            text.textContent = 'Synchronisiert';
            break;
        case 'syncing':
            indicator.classList.add('sync-syncing');
            text.textContent = 'Synchronisiere...';
            break;
        case 'error':
            indicator.classList.add('sync-error');
            text.textContent = 'Verbindungsfehler';
            break;
        case 'offline':
            indicator.classList.add('sync-offline');
            text.textContent = 'Nur lokal (Sheets nicht konfiguriert)';
            break;
        default:
            indicator.classList.add('sync-disconnected');
            text.textContent = 'Verbinde...';
    }
}

// ========================================
// Migration Banner
// ========================================

function checkMigrationBanner() {
    const raw = localStorage.getItem('praxisanleiterTracker') || localStorage.getItem('azubi_tracker_state');
    const dismissed = localStorage.getItem('migrationDismissed');
    if (raw && !dismissed && isOnline) {
        const data = JSON.parse(raw);
        if (data.students && data.students.length > 0) {
            document.getElementById('migration-banner').classList.remove('hidden');
        }
    }
}

const importBtn = document.getElementById('import-data-btn');
const dismissMigrationBtn = document.getElementById('dismiss-migration-btn');

if (importBtn) {
    importBtn.addEventListener('click', async () => {
        try {
            importBtn.disabled = true;
            importBtn.textContent = 'Importiere...';
            const result = await GoogleSheetsAPI.importFromLocalStorage();
            alert(`Import abgeschlossen: ${result.imported} importiert, ${result.skipped} übersprungen.`);
            document.getElementById('migration-banner').classList.add('hidden');
            localStorage.setItem('migrationDismissed', 'true');
            // Lade Daten neu von Google Sheets
            const students = await GoogleSheetsAPI.loadAllStudents();
            if (students) {
                state.students = students;
                saveToLocalStorage();
                renderStudents();
                renderCalendar();
            }
        } catch (error) {
            alert('Import fehlgeschlagen: ' + error.message);
            importBtn.disabled = false;
            importBtn.textContent = 'Importieren';
        }
    });
}

if (dismissMigrationBtn) {
    dismissMigrationBtn.addEventListener('click', () => {
        document.getElementById('migration-banner').classList.add('hidden');
        localStorage.setItem('migrationDismissed', 'true');
    });
}

// ========================================
// Initial Load
// ========================================

// Sofort aus localStorage laden (schnell)
loadFromLocalStorage();
renderStudents();
renderCalendar();
if (state.selectedStudentId) selectStudent(state.selectedStudentId);

// Dann asynchron Google Sheets verbinden
initializeApp();

/**
 * Print Anleitungsnachweis: Creates a temporary clean container that bypasses
 * the modal entirely, avoiding all CSS positioning issues.
 */
function printAnleitungsnachweis() {
    // 1. Collect data from the form
    const bereich = document.getElementById('doc-bereich')?.value || '';
    const studentName = document.getElementById('doc-student-name')?.value || '';
    const monatJahr = document.getElementById('doc-monat-jahr')?.value || '';
    const kursNr = document.getElementById('doc-kurs-nr')?.value || '';
    const bemerkung = document.getElementById('doc-bemerkung')?.value || '';

    // 2. Collect only filled table rows
    const rows = document.querySelectorAll('#doc-table-body tr');
    let tableRowsHTML = '';
    rows.forEach(row => {
        const datum = row.querySelector('input[type="date"]')?.value || '';
        const minuten = row.querySelector('input[type="number"]')?.value || '';
        const praxisanleiter = row.querySelector('select')?.value || '';
        const situation = row.querySelector('textarea')?.value || '';

        if (datum && minuten) {
            const formattedDate = new Date(datum).toLocaleDateString('de-DE');
            tableRowsHTML += `<tr>
                <td>${formattedDate}</td>
                <td>${minuten}</td>
                <td>${praxisanleiter}</td>
                <td style="white-space:pre-wrap">${situation}</td>
            </tr>`;
        }
    });

    // 3. Open a NEW clean window - bypasses ALL CSS issues
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    const headerImgUrl = baseUrl + 'charite-header.png';
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('Pop-up blockiert! Bitte Pop-ups für diese Seite erlauben.');
        return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Anleitungsnachweis</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 0;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            padding: 15mm;
            color: #000;
        }
        .header-img {
            max-width: 100%;
            height: auto;
            margin-bottom: 5mm;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 3mm 0;
        }
        td, th {
            border: 1px solid #000;
            padding: 2mm;
            font-size: 9pt;
            vertical-align: top;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: left;
        }
        .info-text {
            margin: 3mm 0;
            font-size: 9pt;
            font-style: italic;
        }
        .bemerkung-label {
            font-weight: bold;
            margin-top: 5mm;
            margin-bottom: 2mm;
            font-size: 10pt;
        }
        .bemerkung-text {
            border: 1px solid #000;
            padding: 2mm;
            min-height: 15mm;
            font-size: 9pt;
            white-space: pre-wrap;
        }
        .unterschriften {
            display: flex;
            justify-content: space-between;
            margin-top: 10mm;
            font-size: 9pt;
        }
        .unterschriften > div {
            text-align: center;
            width: 45%;
        }
        .sig-line {
            border-bottom: 1px solid #000;
            margin-bottom: 3mm;
            height: 20mm;
        }
    </style>
</head>
<body>
    <img src="${headerImgUrl}" alt="Charité Logo" class="header-img">
    <table>
        <tr><td style="width:120px;font-weight:bold">Bereich</td><td colspan="3">${bereich}</td></tr>
        <tr><td style="font-weight:bold">Auszubildende/r</td><td colspan="3">${studentName}</td></tr>
        <tr><td style="font-weight:bold">Monat / Jahr</td><td>${monatJahr}</td><td style="font-weight:bold">Kurs-Nr.</td><td>${kursNr}</td></tr>
    </table>
    <div class="info-text">Verpflichtend sind 15% Anleitung pro Auszubildender und Einsatz (entspricht 5,7h/ Woche)</div>
    <table>
        <thead>
            <tr>
                <th style="width:12%">Tag / Datum</th>
                <th style="width:10%">Minuten</th>
                <th style="width:22%">Praxisanleitung</th>
                <th>Anleitungssituation / Gespräche</th>
            </tr>
        </thead>
        <tbody>${tableRowsHTML}</tbody>
    </table>
    <div class="bemerkung-label">Bemerkung:</div>
    <div class="bemerkung-text">${bemerkung || '&nbsp;'}</div>
    <div class="unterschriften">
        <div><div class="sig-line"></div>Unterschrift Auszubildende/r</div>
        <div><div class="sig-line"></div>Unterschrift Praxisanleiter/in</div>
    </div>
</body>
</html>`);

    printWindow.document.close();

    // Wait for content and image to load, then print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
            // Don't auto-close - let user close after printing
        }, 300);
    };

    // Fallback: if onload doesn't fire (some browsers with local files)
    setTimeout(() => {
        if (!printWindow.closed) {
            printWindow.print();
        }
    }, 1000);
}




