/**
 * script.js - OpenAtlas Feature #2156 Prototype Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let data = {
        begin_from: "",
        begin_to: "",
        end_from: "",
        end_to: "",
        begin_comment: "",
        end_comment: ""
    };

    let isAdvancedView = false;
    let suppressWarning = false;

    // --- DOM Elements ---
    const viewTabBtns = document.querySelectorAll('.view-tab-btn');
    const layoutTabBtns = document.querySelectorAll('.layout-tab-btn');
    const simpleView = document.getElementById('simpleView');
    const advancedView = document.getElementById('advancedView');
    const downgradeWarning = document.getElementById('downgradeWarning');
    const dismissWarningBtn = document.getElementById('dismissWarningBtn');
    const jsonPayload = document.getElementById('jsonPayload');

    const simpleBeginCol = document.getElementById('simpleBeginCol');
    const simpleEndCol = document.getElementById('simpleEndCol');
    const advancedBeginCol = document.getElementById('advancedBeginCol');
    const advancedEndCol = document.getElementById('advancedEndCol');

    const simpleBeginComment = document.getElementById('simpleBegin_Comment');
    const simpleEndComment = document.getElementById('simpleEnd_Comment');
    const advancedBeginComment = document.getElementById('advancedBegin_Comment');
    const advancedEndComment = document.getElementById('advancedEnd_Comment');

    const simpleBeginFeedback = document.getElementById('simpleBegin_Feedback');
    const simpleEndFeedback = document.getElementById('simpleEnd_Feedback');

    const simpleInputs = {
        begin: {
            Y: document.getElementById('simpleBegin_Y'),
            M: document.getElementById('simpleBegin_M'),
            D: document.getElementById('simpleBegin_D')
        },
        end: {
            Y: document.getElementById('simpleEnd_Y'),
            M: document.getElementById('simpleEnd_M'),
            D: document.getElementById('simpleEnd_D')
        }
    };

    const advInputs = {
        begin_from: {
            Y: document.getElementById('begin_from_Y'),
            M: document.getElementById('begin_from_M'),
            D: document.getElementById('begin_from_D')
        },
        begin_to: {
            Y: document.getElementById('begin_to_Y'),
            M: document.getElementById('begin_to_M'),
            D: document.getElementById('begin_to_D')
        },
        end_from: {
            Y: document.getElementById('end_from_Y'),
            M: document.getElementById('end_from_M'),
            D: document.getElementById('end_from_D')
        },
        end_to: {
            Y: document.getElementById('end_to_Y'),
            M: document.getElementById('end_to_M'),
            D: document.getElementById('end_to_D')
        }
    };

    const presetBtns = document.querySelectorAll('.preset-btn');

    // --- Presets Data ---
    const presets = {
        exact: { // Battle of Hastings: 1066-10-14
            begin_from: "1066-10-14", begin_to: "1066-10-14",
            end_from: "1066-10-14", end_to: "1066-10-14"
        },
        tpq: { // Terminus post quem / Earliest End
            begin_from: "", begin_to: "",
            end_from: "0833-01-01", end_to: ""
        },
        taq: { // Terminus ante quem / Latest End
            begin_from: "", begin_to: "",
            end_from: "", end_to: "0799-12-31"
        },
        a_quo: { // Terminus a quo (Earliest Begin)
            begin_from: "1200-01-01", begin_to: "",
            end_from: "", end_to: ""
        },
        ad_quem: { // Terminus ad quem (Latest Begin)
            begin_from: "", begin_to: "1200-12-31",
            end_from: "", end_to: ""
        },
        timespan: { // Peace of Westphalia
            begin_from: "1648-05-15", begin_to: "1648-05-15",
            end_from: "1648-10-24", end_to: "1648-10-24"
        },
        timespan_year: { // 824 to 825
            begin_from: "0824-01-01", begin_to: "0824-12-31",
            end_from: "0825-01-01", end_to: "0825-12-31"
        },
        timespan_month: { // April to May 2013
            begin_from: "2013-04-01", begin_to: "2013-04-30",
            end_from: "2013-05-01", end_to: "2013-05-31"
        },
        clear: {
            begin_from: "", begin_to: "",
            end_from: "", end_to: ""
        }
    };

    // --- Helpers ---
    function splitDate(dateStr) {
        if (!dateStr) return { Y: "", M: "", D: "" };
        const parts = dateStr.split('-');
        return {
            Y: parts[0] || "",
            M: parts[1] || "",
            D: parts[2] || ""
        };
    }

    function joinDate(Y, M, D) {
        if (!Y && !M && !D) return "";
        let res = Y || "";
        if (M) res += "-" + M.padStart(2, '0');
        if (D && M) res += "-" + D.padStart(2, '0');
        return res;
    }

    function setFields(fieldGroup, dateStr) {
        const parts = splitDate(dateStr);
        fieldGroup.Y.value = parts.Y;
        fieldGroup.M.value = parts.M;
        fieldGroup.D.value = parts.D;
    }

    function clearFields(fieldGroup) {
        fieldGroup.Y.value = "";
        fieldGroup.M.value = "";
        fieldGroup.D.value = "";
    }

    // --- Core Logic ---

    // Update UI based on data state
    function updateUI() {
        // Render JSON payload
        jsonPayload.textContent = JSON.stringify({
            begin_from: data.begin_from || null,
            begin_to: data.begin_to || null,
            begin_comment: data.begin_comment || null,
            end_from: data.end_from || null,
            end_to: data.end_to || null,
            end_comment: data.end_comment || null
        }, null, 2);

        // Update Advanced Inputs
        setFields(advInputs.begin_from, data.begin_from);
        setFields(advInputs.begin_to, data.begin_to);
        setFields(advInputs.end_from, data.end_from);
        setFields(advInputs.end_to, data.end_to);

        simpleBeginComment.value = data.begin_comment || "";
        simpleEndComment.value = data.end_comment || "";
        advancedBeginComment.value = data.begin_comment || "";
        advancedEndComment.value = data.end_comment || "";

        // Try to update Simple Inputs backwards (very basic mapping for prototype)
        if (data.begin_from === data.begin_to && data.begin_from !== "") {
            setFields(simpleInputs.begin, data.begin_from);
            simpleBeginFeedback.textContent = `Exact date: ${data.begin_from}`;
        } else if (data.begin_from && data.begin_from.endsWith("-01-01") && data.begin_to && data.begin_to.endsWith("-12-31")) {
            clearFields(simpleInputs.begin);
            simpleInputs.begin.Y.value = data.begin_from.substring(0, 4); // Just year
            simpleBeginFeedback.textContent = `Expanded to timespan: ${data.begin_from} — ${data.begin_to}`;
        } else if (data.begin_from && data.begin_to && data.begin_from.substring(0,7) === data.begin_to.substring(0,7) && data.begin_from.endsWith("-01")) {
             // simplified month mapping
             clearFields(simpleInputs.begin);
             simpleInputs.begin.Y.value = data.begin_from.substring(0, 4);
             simpleInputs.begin.M.value = data.begin_from.substring(5, 7);
             simpleBeginFeedback.textContent = `Expanded to timespan: ${data.begin_from} — ${data.begin_to}`;
        } else {
            clearFields(simpleInputs.begin); // Complex, can't map cleanly
            if (data.begin_from || data.begin_to) {
                let msg = [];
                if (data.begin_from) msg.push(`Earliest: ${data.begin_from}`);
                if (data.begin_to) msg.push(`Latest: ${data.begin_to}`);
                simpleBeginFeedback.textContent = `Advanced data available (${msg.join(', ')})`;
            } else {
                simpleBeginFeedback.textContent = "";
            }
        }

        if (data.end_from === data.end_to && data.end_from !== "") {
            setFields(simpleInputs.end, data.end_from);
            simpleEndFeedback.textContent = `Exact date: ${data.end_from}`;
        } else if (data.end_from && data.end_from.endsWith("-01-01") && data.end_to && data.end_to.endsWith("-12-31")) {
            clearFields(simpleInputs.end);
            simpleInputs.end.Y.value = data.end_from.substring(0, 4); // Just year
            simpleEndFeedback.textContent = `Expanded to timespan: ${data.end_from} — ${data.end_to}`;
        } else if (data.end_from && data.end_to && data.end_from.substring(0,7) === data.end_to.substring(0,7) && data.end_from.endsWith("-01")) {
             clearFields(simpleInputs.end);
             simpleInputs.end.Y.value = data.end_from.substring(0, 4);
             simpleInputs.end.M.value = data.end_from.substring(5, 7);
             simpleEndFeedback.textContent = `Expanded to timespan: ${data.end_from} — ${data.end_to}`;
        } else {
            clearFields(simpleInputs.end); // Complex
            if (data.end_from || data.end_to) {
                let msg = [];
                if (data.end_from) msg.push(`Earliest: ${data.end_from}`);
                if (data.end_to) msg.push(`Latest: ${data.end_to}`);
                simpleEndFeedback.textContent = `Advanced data available (${msg.join(', ')})`;
            } else {
                simpleEndFeedback.textContent = "";
            }
        }
    }

    // Heuristic checking if we have standard intervals
    function isStandardInterval(from, to) {
        if (!from && !to) return true; // Empty is standard
        if (from === to) return true; // Point in time
        if (from && to && from.substring(0, 4) === to.substring(0, 4)) {
            // Full year check
            if (from.endsWith("-01-01") && to.endsWith("-12-31")) return true;
            // Full month check (simplified - assumes month format)
            if (from.substring(5, 7) === to.substring(5, 7) && from.endsWith("-01") && (to.endsWith("-28") || to.endsWith("-29") || to.endsWith("-30") || to.endsWith("-31"))) {
                return true;
            }
        }
        return false;
    }

    function shouldShowAdvancedView(testData) {
        if (isStandardInterval(testData.begin_from, testData.begin_to) &&
            isStandardInterval(testData.end_from, testData.end_to)) {
            return false;
        }
        return true;
    }

    // Apply a preset
    function loadData(newData) {
        data = { ...newData };
        
        // Safety net / Heuristic check
        const needsAdvanced = shouldShowAdvancedView(data);
        
        if (needsAdvanced) {
            setAdvancedView(true);
        } else {
            setAdvancedView(false);
        }

        updateUI();
    }

    // --- Autocomplete Logic (Simple View) ---
    function parseSimpleDateGroup(group) {
        const Y = group.Y.value.trim();
        const M = group.M.value.trim();
        const D = group.D.value.trim();
        
        if (!Y) return { from: "", to: "" };
        const paddedYear = Y.padStart(4, '0');

        if (Y && M && D) {
            // Exact Date
            const paddedM = M.padStart(2, '0');
            const paddedD = D.padStart(2, '0');
            const dStr = `${paddedYear}-${paddedM}-${paddedD}`;
            return { from: dStr, to: dStr };
        } else if (Y && M) {
            // Year-Month
            const paddedM = M.padStart(2, '0');
            const lastDay = new Date(paddedYear, paddedM, 0).getDate();
            return { from: `${paddedYear}-${paddedM}-01`, to: `${paddedYear}-${paddedM}-${lastDay}` };
        } else {
            // Year only
            return { from: `${paddedYear}-01-01`, to: `${paddedYear}-12-31` };
        }
    }

    ['Y', 'M', 'D'].forEach(part => {
        simpleInputs.begin[part].addEventListener('input', () => {
            const parsed = parseSimpleDateGroup(simpleInputs.begin);
            data.begin_from = parsed.from;
            data.begin_to = parsed.to;
            updateUI();
        });

        simpleInputs.end[part].addEventListener('input', () => {
            const parsed = parseSimpleDateGroup(simpleInputs.end);
            data.end_from = parsed.from;
            data.end_to = parsed.to;
            updateUI();
        });
    });

    // --- Advanced View Inputs ---
    Object.keys(advInputs).forEach(key => {
        ['Y', 'M', 'D'].forEach(part => {
            advInputs[key][part].addEventListener('input', () => {
                const Y = advInputs[key].Y.value.trim();
                const M = advInputs[key].M.value.trim();
                const D = advInputs[key].D.value.trim();
                data[key] = joinDate(Y, M, D);
                updateUI();
            });
        });
    });

    [simpleBeginComment, advancedBeginComment].forEach(input => {
        input.addEventListener('input', (e) => {
            data.begin_comment = e.target.value;
            updateUI();
        });
    });

    [simpleEndComment, advancedEndComment].forEach(input => {
        input.addEventListener('input', (e) => {
            data.end_comment = e.target.value;
            updateUI();
        });
    });

    // --- View Toggling ---
    function setAdvancedView(showAdv, userInitiated = false) {
        isAdvancedView = showAdv;
        
        const simpleTabBtn = document.getElementById('tab-simple');
        const advancedTabBtn = document.getElementById('tab-advanced');
        
        if (showAdv) {
            simpleView.classList.add('d-none');
            advancedView.classList.remove('d-none');
            downgradeWarning.classList.add('d-none'); // Hide warning when going to advanced
            if (simpleTabBtn && advancedTabBtn) {
                simpleTabBtn.classList.remove('active');
                advancedTabBtn.classList.add('active');
            }
        } else {
            advancedView.classList.add('d-none');
            simpleView.classList.remove('d-none');
            if (simpleTabBtn && advancedTabBtn) {
                advancedTabBtn.classList.remove('active');
                simpleTabBtn.classList.add('active');
            }
            
            // Check if we are losing data by downgrading manually
            if (userInitiated && shouldShowAdvancedView(data) && !suppressWarning) {
                downgradeWarning.classList.remove('d-none');
            }
        }
    }

    viewTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isAdv = btn.getAttribute('data-view') === 'advanced';
            if (isAdvancedView !== isAdv) {
                setAdvancedView(isAdv, true);
            }
        });
    });

    layoutTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            layoutTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const layout = btn.getAttribute('data-layout');
            if (layout === 'side') {
                simpleBeginCol.className = 'col-md-6';
                simpleEndCol.className = 'col-md-6 mt-3 mt-md-0';
                advancedBeginCol.className = 'col-md-6 border-end';
                advancedEndCol.className = 'col-md-6';
            } else {
                simpleBeginCol.className = 'col-12';
                simpleEndCol.className = 'col-12 mt-3';
                advancedBeginCol.className = 'col-12';
                advancedEndCol.className = 'col-12 mt-4';
            }
        });
    });

    dismissWarningBtn.addEventListener('click', () => {
        suppressWarning = true;
        downgradeWarning.classList.add('d-none');
    });

    // --- Preset Buttons ---
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const presetKey = btn.getAttribute('data-preset');
            if (presets[presetKey]) {
                suppressWarning = false; // Reset warning suppression on load
                downgradeWarning.classList.add('d-none');
                loadData(presets[presetKey]);
            }
        });
    });

    // Init
    updateUI();
});
