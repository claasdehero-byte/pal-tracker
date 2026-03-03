const UIManager = {
    renderUserData(userData) {
        document.getElementById('user-name').value = userData.name || '';
        document.getElementById('user-type').value = userData.type || 'apprentice';
        document.getElementById('user-kurs').value = userData.kurs || '';
        document.getElementById('user-start').value = userData.zeitraumVon || '';
        document.getElementById('user-end').value = userData.zeitraumBis || '';
        document.getElementById('user-bereich').value = userData.einsatzbereich || '';
        document.getElementById('user-pal').value = userData.praxisanleitung || '';
    },

    renderCompetencies(competencies) {
        const body = document.getElementById('competency-body');
        body.innerHTML = '';

        let currentBereich = '';

        competencies.forEach(comp => {
            if (comp.bereich !== currentBereich) {
                currentBereich = comp.bereich;
                const sectionTr = document.createElement('tr');
                sectionTr.innerHTML = `<td colspan="8" style="background: var(--primary-light); color: var(--primary); font-weight: 700; text-align: left; padding: 0.5rem 1rem;">${currentBereich}</td>`;
                body.appendChild(sectionTr);
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${comp.id}</strong></td>
                <td style="font-size: 0.85rem; max-width: 250px;">${comp.beschreibung}</td>
                <td><div class="check-marker seen ${comp.gesehen ? 'active' : ''}" data-id="${comp.id}" data-type="gesehen"></div></td>
                <td><div class="check-marker supervised ${comp.unterAufsicht ? 'active' : ''}" data-id="${comp.id}" data-type="unterAufsicht"></div></td>
                <td><div class="check-marker independent ${comp.selbststaendig ? 'active' : ''}" data-id="${comp.id}" data-type="selbststaendig"></div></td>
                <td><input type="date" class="mini-input data-entry" data-id="${comp.id}" data-field="datum" value="${comp.datum || ''}"></td>
                <td><input type="text" class="mini-input data-entry" data-id="${comp.id}" data-field="note" value="${comp.note || ''}" placeholder="..."></td>
                <td><span class="status-pill status-${comp.status}">${comp.status === 'gruen' ? '🟢' : '🔴'}</span></td>
            `;
            body.appendChild(tr);
        });
    },

    renderAssignments(assignments) {
        const list = document.getElementById('assignments-list');
        list.innerHTML = '';

        if (assignments.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Keine Arbeitsaufträge vorhanden.</p>';
            return;
        }

        assignments.forEach(assign => {
            const div = document.createElement('div');
            div.className = 'card flex justify-between items-center';
            div.style.marginBottom = '0.5rem';
            div.innerHTML = `
                <div>
                    <h3 style="font-size: 1rem;">${assign.erledigt ? '✅' : '⬜'} ${assign.titel}</h3>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${assign.beschreibung}</p>
                    <small>Fällig: ${assign.faelligkeitsdatum}</small>
                </div>
                <button class="tab-btn delete-btn" data-id="${assign.id}" style="color: var(--red); border-color: var(--red); padding: 0.25rem 0.5rem;">Löschen</button>
            `;
            list.appendChild(div);
        });
    },

    updateProgress(percentage) {
        document.getElementById('overall-percentage').innerText = `${percentage}%`;
        document.getElementById('overall-bar').style.width = `${percentage}%`;
    },

    populateFilter(competencies) {
        const filterArea = document.getElementById('filter-area');
        const areas = [...new Set(competencies.map(c => c.bereich))];

        filterArea.innerHTML = '<option value="all">Alle Bereiche</option>';
        areas.forEach(area => {
            const opt = document.createElement('option');
            opt.value = area;
            opt.innerText = area;
            filterArea.appendChild(opt);
        });
    },

    renderAssessments(assessments) {
        const list = document.getElementById('assessments-list');
        list.innerHTML = '<h3>Gespeicherte Beurteilungen</h3>';

        if (!assessments || assessments.length === 0) {
            list.innerHTML += '<p style="color: var(--text-muted); padding: 1rem;">Noch keine Beurteilungen vorhanden.</p>';
            return;
        }

        [...assessments].reverse().forEach(assessment => {
            const div = document.createElement('div');
            div.className = 'assessment-entry';
            div.innerHTML = `
                <div class="assessment-meta">
                    <span class="assessment-name">👤 ${assessment.name}</span>
                    <span>📅 ${new Date(assessment.date).toLocaleDateString('de-DE')} | 🕒 ${assessment.shift}</span>
                </div>
                <p class="assessment-text">"${assessment.text}"</p>
            `;
            list.appendChild(div);
        });
    }
};

window.UIManager = UIManager;
