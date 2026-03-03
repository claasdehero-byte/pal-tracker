document.addEventListener('DOMContentLoaded', () => {
    // Merge logic to ensure new curriculum items are added even if data exists in LocalStorage
    const getInitialState = () => {
        const stored = StorageManager.load();
        const initial = {
            competencies: window.PFLEGE_DATA.initialCompetencies,
            assignments: window.PFLEGE_DATA.initialAssignments,
            userData: { ...window.PFLEGE_DATA.initialUserData, type: 'apprentice', createdAt: new Date().toISOString() },
            assessments: [],
            theme: 'light'
        };

        if (!stored) return initial;

        // Merge competencies: keep progress for existing ones, add new ones from curriculum
        const mergedCompetencies = initial.competencies.map(initComp => {
            const storedComp = stored.competencies.find(s => s.id === initComp.id);
            return storedComp ? { ...initComp, ...storedComp } : initComp;
        });

        return {
            ...initial,
            ...stored,
            competencies: mergedCompetencies,
            assessments: stored.assessments || []
        };
    };

    const checkAutoDeletion = (state) => {
        if (!state.userData.createdAt) return false;
        const createdDate = new Date(state.userData.createdAt);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (createdDate < sixMonthsAgo) {
            if (confirm('Die 6-monatige Aufbewahrungsfrist ist abgelaufen. Alle Daten werden nun automatisch gelöscht.')) {
                StorageManager.reset();
                return true;
            }
        }
        return false;
    };

    let state = getInitialState();

    // Initialize UI
    const init = () => {
        if (checkAutoDeletion(state)) return;
        document.body.setAttribute('data-theme', state.theme);
        document.body.setAttribute('data-type', state.userData.type || 'apprentice');
        UIManager.renderUserData(state.userData);
        UIManager.populateFilter(state.competencies);
        UIManager.renderCompetencies(state.competencies);
        UIManager.renderAssignments(state.assignments);
        UIManager.renderAssessments(state.assessments);
        calculateOverallProgress();
    };

    const calculateOverallProgress = () => {
        const total = state.competencies.length;
        const reached = state.competencies.filter(c => c.status === 'gruen').length;
        const percentage = Math.round((reached / total) * 100) || 0;
        UIManager.updateProgress(percentage);
    };

    const updateCompetencyInfo = (id, field, value) => {
        const comp = state.competencies.find(c => c.id === id);
        if (comp) {
            comp[field] = value;
            if (field === 'selbststaendig') {
                comp.status = value ? 'gruen' : 'rot';
            }
            StorageManager.save(state);
            calculateOverallProgress();

            if (['gesehen', 'unterAufsicht', 'selbststaendig'].includes(field)) {
                UIManager.renderCompetencies(filterAndSearch());
            }
        }
    };

    const filterAndSearch = () => {
        const area = document.getElementById('filter-area').value;
        const query = document.getElementById('search-input').value.toLowerCase();

        return state.competencies.filter(c => {
            const matchesArea = area === 'all' || c.bereich === area;
            const matchesSearch = (c.beschreibung || '').toLowerCase().includes(query) || (c.id || '').toLowerCase().includes(query);
            return matchesArea && matchesSearch;
        });
    };

    const handleExportPDF = () => {
        const element = document.body;
        const opt = {
            margin: 10,
            filename: `${state.userData.name || 'Ausbildungsnachweis'}_Pflegetracker.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    const handleExportCSV = () => {
        let csvContent = "ID;Bereich;Beschreibung;Gesehen;Auf Aufsicht;Selbstständig;Datum;Notiz;Status\n";
        state.competencies.forEach(c => {
            csvContent += `${c.id};${c.bereich};${c.beschreibung};${c.gesehen};${c.unterAufsicht};${c.selbststaendig};${c.datum};${c.note};${c.status}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${state.userData.name || 'nursing'}_competencies.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Event Listeners
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('check-marker')) {
            const { id, type } = e.target.dataset;
            const comp = state.competencies.find(c => c.id === id);
            updateCompetencyInfo(id, type, !comp[type]);
            e.target.classList.toggle('active');
        }

        if (e.target.classList.contains('tab-btn') && e.target.dataset.target) {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
            document.getElementById(`${e.target.dataset.target}-view`).style.display = 'block';
        }

        if (e.target.id === 'theme-toggle') {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            document.body.setAttribute('data-theme', state.theme);
            StorageManager.save(state);
        }

        if (e.target.id === 'export-pdf') handleExportPDF();
        if (e.target.id === 'export-csv') handleExportCSV();
        if (e.target.id === 'reset-all') {
            if (confirm('Wirklich alle Daten löschen?')) StorageManager.reset();
        }

        if (e.target.id === 'save-assessment') {
            const name = document.getElementById('eval-name').value;
            const date = document.getElementById('eval-date').value;
            const shift = document.getElementById('eval-shift').value;
            const text = document.getElementById('eval-text').value;

            if (!name || !date || !text) {
                alert('Bitte Name, Datum und Beurteilung ausfüllen.');
                return;
            }

            const newAssessment = {
                id: Date.now(),
                name,
                date,
                shift,
                text
            };

            state.assessments.push(newAssessment);
            StorageManager.save(state);
            UIManager.renderAssessments(state.assessments);

            // Clear fields
            document.getElementById('eval-name').value = '';
            document.getElementById('eval-text').value = '';
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('data-entry')) {
            updateCompetencyInfo(e.target.dataset.id, e.target.dataset.field, e.target.value);
        }

        if (e.target.closest('#user-info')) {
            state.userData = {
                name: document.getElementById('user-name').value,
                type: document.getElementById('user-type').value,
                kurs: document.getElementById('user-kurs').value,
                zeitraumVon: document.getElementById('user-start').value,
                zeitraumBis: document.getElementById('user-end').value,
                einsatzbereich: document.getElementById('user-bereich').value,
                praxisanleitung: document.getElementById('user-pal').value,
                createdAt: state.userData.createdAt || new Date().toISOString()
            };
            document.body.setAttribute('data-type', state.userData.type);
            StorageManager.save(state);
        }
    });

    // Mirroring change to input for text fields to ensure real-time save
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('data-entry')) {
            updateCompetencyInfo(e.target.dataset.id, e.target.dataset.field, e.target.value);
        }

        if (e.target.tagName === 'INPUT' && e.target.type === 'text' && e.target.closest('#user-info')) {
            state.userData[e.target.id.replace('user-', '')] = e.target.value; // Simplified mapping
            // More robust way:
            state.userData = {
                name: document.getElementById('user-name').value,
                kurs: document.getElementById('user-kurs').value,
                zeitraumVon: document.getElementById('user-start').value,
                zeitraumBis: document.getElementById('user-end').value,
                einsatzbereich: document.getElementById('user-bereich').value,
                praxisanleitung: document.getElementById('user-pal').value
            };
            StorageManager.save(state);
        }

        if (e.target.id === 'search-input') {
            UIManager.renderCompetencies(filterAndSearch());
        }
    });

    document.getElementById('filter-area').addEventListener('change', () => {
        UIManager.renderCompetencies(filterAndSearch());
    });

    init();
});
