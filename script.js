/**
 * script.js - OpenAtlas Feature #2156 Interactive Date UI Prototype
 * Fixes all input-overwrite & warning bugs, implements exact OpenAtlas date/time
 * expansion & validation rules, and provides 5 interactive UI proposals.
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. STATE & CONFIGURATION
    // =========================================================================
    let currentProposal = 'p2'; // 'p1' | 'p2' | 'p3' | 'p4' | 'p5'
    let p1Style = 'exact';      // 'exact' | 'badges'
    let p2Control = 'tabs';     // 'tabs' | 'switch' | 'pills'
    let p2Layout = 'stacked';   // 'stacked' | 'side'
    let showTimeFields = false;
    let isDateSectionHidden = false;

    // View mode states for Proposal 2, 3, 4
    let isAdvancedView = false;
    let p3Mode = { begin: 'exact', end: 'exact' }; // 'exact' | 'between' | 'after' | 'before'
    let p4Split = { begin: false, end: false };

    // Raw form state (4 independent boundaries + 2 simple auto-span inputs + comments)
    let state = {
        begin_from: { Y: '', M: '', D: '', h: '', m: '', s: '' },
        begin_to:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
        end_from:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
        end_to:     { Y: '', M: '', D: '', h: '', m: '', s: '' },
        simple_begin: { Y: '', M: '', D: '' },
        simple_end:   { Y: '', M: '', D: '' },
        begin_comment: '',
        end_comment: ''
    };

    // =========================================================================
    // 2. PRESETS (Stefan Eichert's Examples from Redmine Ticket #2156)
    // =========================================================================
    const presets = {
        exact_day: {
            title: "Parish register & death record: exact birth (12.11.1650) and death (07.05.1909) stored as 24h spans.",
            entityName: "Johann Friedrich (Parish Register Record)",
            entityDesc: "A parish register records birth on 12.11.1650; historical document records death on 07.05.1909.",
            begin_from: { Y: '1650', M: '11', D: '12', h: '', m: '', s: '' },
            begin_to:   { Y: '1650', M: '11', D: '12', h: '', m: '', s: '' },
            end_from:   { Y: '1909', M: '05', D: '07', h: '', m: '', s: '' },
            end_to:     { Y: '1909', M: '05', D: '07', h: '', m: '', s: '' },
            begin_comment: "Parish register birth entry",
            end_comment: "Death certificate"
        },
        tpq_begin: {
            title: "Terminus post quem (Begin): Coin minted in 337 AD found in a grave -> burial started on/after 01.01.0337.",
            entityName: "Grave 14 (Coin Find 337 AD)",
            entityDesc: "A coin minted in 337 AD found in a grave means the burial process could only have started after this point.",
            begin_from: { Y: '337', M: '1', D: '1', h: '', m: '', s: '' },
            begin_to:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_from:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_to:     { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_comment: "TPQ: Coin of Constantine (337 AD)",
            end_comment: ""
        },
        tpq_end: {
            title: "Terminus post quem (End): Person mentioned as witness for the last time in Feb 945 -> earliest death 01.02.0945.",
            entityName: "Witness in Charter of Feb 945",
            entityDesc: "A person is mentioned as a witness for the last time in a charter issued in February 945.",
            begin_from: { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_to:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_from:   { Y: '945', M: '2', D: '1', h: '', m: '', s: '' },
            end_to:     { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_comment: "",
            end_comment: "Last mentioned as witness in Feb 945"
        },
        taq_begin: {
            title: "Terminus ante quem (Begin): First mentioned in charter of 15.08.1348 -> born/existed by 15.08.1348 at the latest.",
            entityName: "St. Stephen's Parish Church (First Mention)",
            entityDesc: "Mentioned for the first time in a charter from 15.08.1348. Must have existed at the latest by that day.",
            begin_from: { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_to:   { Y: '1348', M: '8', D: '15', h: '', m: '', s: '' },
            end_from:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_to:     { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_comment: "First charter mention (TAQ)",
            end_comment: ""
        },
        taq_end: {
            title: "Terminus ante quem (End): Archaeological layer sealed by volcanic eruption on 24.08.0079 AD.",
            entityName: "Pompeii Stratigraphic Layer VII",
            entityDesc: "An archaeological layer is sealed by a volcanic eruption in 79 AD; occupation must have ended before this point.",
            begin_from: { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_to:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_from:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_to:     { Y: '79', M: '8', D: '24', h: '', m: '', s: '' },
            begin_comment: "",
            end_comment: "Sealed by Vesuvius eruption"
        },
        window_years: {
            title: "Exact Founding Period (Years): Monastery charter records founding between 820 and 825 AD.",
            entityName: "Benedictine Monastery (Founding Period)",
            entityDesc: "A monastery charter records an exact founding period between 820 and 825 AD.",
            begin_from: { Y: '820', M: '1', D: '1', h: '', m: '', s: '' },
            begin_to:   { Y: '825', M: '12', D: '31', h: '', m: '', s: '' },
            end_from:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_to:     { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_comment: "Charter founding window 820–825 AD",
            end_comment: ""
        },
        window_months: {
            title: "Targeted Siege (Months): City chronicle records fortress demolition between June and August 1480.",
            entityName: "Old Hilltop Fortress",
            entityDesc: "A city chronicle records that a fortress was completely demolished during a targeted siege between June and August 1480.",
            begin_from: { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_to:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_from:   { Y: '1480', M: '6', D: '1', h: '', m: '', s: '' },
            end_to:     { Y: '1480', M: '8', D: '31', h: '', m: '', s: '' },
            begin_comment: "",
            end_comment: "Demolished between June and August 1480"
        },
        mixed_charter: {
            title: "Mixed Case (#17): Born on 01.01.800 (exact day), died some time after charter of 23.12.840 (Earliest End only).",
            entityName: " noblewoman Gerberga (#17 Example)",
            entityDesc: "Born on 1.1.800 (00:00–23:59). Died somewhen after her latest mentioning in a charter dated 23.12.840.",
            begin_from: { Y: '800', M: '1', D: '1', h: '', m: '', s: '' },
            begin_to:   { Y: '800', M: '1', D: '1', h: '', m: '', s: '' },
            end_from:   { Y: '840', M: '12', D: '23', h: '', m: '', s: '' },
            end_to:     { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_comment: "Exact birth date known",
            end_comment: "After last charter mention"
        },
        single_year_auto: {
            title: "Standard Year Autocomplete: User enters Year 800 for Begin and Year 850 for End -> expands to full year spans.",
            entityName: "Early Medieval Settlement Phase",
            entityDesc: "Standard full-year intervals that are recognized by should_show_advanced_view() as Simple View compatible.",
            begin_from: { Y: '800', M: '1', D: '1', h: '', m: '', s: '' },
            begin_to:   { Y: '800', M: '12', D: '31', h: '', m: '', s: '' },
            end_from:   { Y: '850', M: '1', D: '1', h: '', m: '', s: '' },
            end_to:     { Y: '850', M: '12', D: '31', h: '', m: '', s: '' },
            begin_comment: "",
            end_comment: ""
        },
        clear: {
            title: "All date fields cleared.",
            entityName: "Historical Record (Example)",
            entityDesc: "",
            begin_from: { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_to:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_from:   { Y: '', M: '', D: '', h: '', m: '', s: '' },
            end_to:     { Y: '', M: '', D: '', h: '', m: '', s: '' },
            begin_comment: "",
            end_comment: ""
        }
    };

    // =========================================================================
    // 3. OPENATLAS DATE & LEAP YEAR LOGIC (ported from openatlas/models/dates.py)
    // =========================================================================
    function isLeapYear(yearInt) {
        // In astronomical/numpy numbering used in OpenAtlas (dates.py:127):
        // Negative years (BC): -1 is 1 BC (which is astronomical year 0, a leap year)
        const astroYear = yearInt > 0 ? yearInt : yearInt + 1;
        if (astroYear % 400 === 0) return true;
        if (astroYear % 100 === 0) return false;
        if (astroYear % 4 === 0) return true;
        return false;
    }

    function getLastDayOfMonth(yearInt, monthInt) {
        const daysInMonths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (monthInt < 1 || monthInt > 12) return 31;
        if (monthInt === 2 && isLeapYear(yearInt)) return 29;
        return daysInMonths[monthInt];
    }

    function isEmptyPart(partObj) {
        return !partObj || (!partObj.Y.trim() && !partObj.M.trim() && !partObj.D.trim());
    }

    /**
     * Resolves a raw date field object { Y, M, D, h, m, s } into:
     * - valid: boolean
     * - error: string | null
     * - isoDate: "YYYY-MM-DD" (with BC if negative)
     * - timestamp: "YYYY-MM-DD hh:mm:ss[ BC]"
     * - sortKey: number (for chronological comparison)
     */
    function resolveBoundary(raw, isToDate = false) {
        const yStr = (raw.Y || '').trim();
        const mStr = (raw.M || '').trim();
        const dStr = (raw.D || '').trim();
        const hStr = (raw.h || '').trim();
        const minStr = (raw.m || '').trim();
        const sStr = (raw.s || '').trim();

        if (!yStr && !mStr && !dStr) {
            return { empty: true, valid: true, timestamp: null, displayDate: null, sortValue: null };
        }
        if (!yStr && (mStr || dStr)) {
            return { empty: false, valid: false, error: "Year is required when month or day is entered." };
        }

        const yearNum = Number(yStr);
        if (!Number.isInteger(yearNum) || yearNum === 0 || yearNum < -4713 || yearNum > 9999) {
            return { empty: false, valid: false, error: "Year must be a valid integer between -4713 and 9999 (excluding 0)." };
        }

        let monthNum = isToDate ? 12 : 1;
        if (mStr !== '') {
            monthNum = Number(mStr);
            if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
                return { empty: false, valid: false, error: "Month must be between 1 and 12." };
            }
        }

        const maxDay = getLastDayOfMonth(yearNum, monthNum);
        let dayNum = isToDate ? maxDay : 1;
        if (dStr !== '') {
            if (mStr === '') {
                return { empty: false, valid: false, error: "Month is required when day is entered." };
            }
            dayNum = Number(dStr);
            if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > maxDay) {
                return { empty: false, valid: false, error: `Not a valid date (day must be 1–${maxDay} for month ${monthNum}).` };
            }
        }

        // Time defaults (#36: 00:00:00 for _from, 23:59:59 for _to)
        let hourNum = isToDate ? 23 : 0;
        let minNum  = isToDate ? 59 : 0;
        let secNum  = isToDate ? 59 : 0;

        if (showTimeFields && (hStr !== '' || minStr !== '' || sStr !== '')) {
            hourNum = hStr !== '' ? Number(hStr) : 0;
            minNum  = minStr !== '' ? Number(minStr) : 0;
            secNum  = sStr !== '' ? Number(sStr) : 0;
            if (!Number.isInteger(hourNum) || hourNum < 0 || hourNum > 23 ||
                !Number.isInteger(minNum)  || minNum < 0  || minNum > 59  ||
                !Number.isInteger(secNum)  || secNum < 0  || secNum > 59) {
                return { empty: false, valid: false, error: "Invalid time (hh: 0–23, mm: 0–59, ss: 0–59)." };
            }
        }

        const isBC = yearNum < 0;
        const absYear = Math.abs(yearNum);
        const padY = String(absYear).padStart(4, '0');
        const padM = String(monthNum).padStart(2, '0');
        const padD = String(dayNum).padStart(2, '0');
        const padH = String(hourNum).padStart(2, '0');
        const padMin = String(minNum).padStart(2, '0');
        const padS = String(secNum).padStart(2, '0');
        const bcSuffix = isBC ? ' BC' : '';

        const timestamp = `${padY}-${padM}-${padD} ${padH}:${padMin}:${padS}${bcSuffix}`;
        const displayDate = `${absYear}-${padM}-${padD}${bcSuffix}`;

        // Astronomical sort key for validation comparisons
        const astroYear = isBC ? yearNum + 1 : yearNum;
        const sortValue = (astroYear * 10000000000)
                        + (monthNum * 100000000)
                        + (dayNum * 1000000)
                        + (hourNum * 10000)
                        + (minNum * 100)
                        + secNum;

        return {
            empty: false,
            valid: true,
            yearNum,
            monthNum,
            dayNum,
            timestamp,
            displayDate,
            isoShort: `${padY}-${padM}-${padD}${bcSuffix}`,
            sortValue
        };
    }

    /**
     * Checks if a pair of resolved boundaries represents a "Standard Interval"
     * (i.e. empty, exact day, full single year, or full single month)
     * as specified in Ticket #2156 (#31 pseudocode).
     */
    function analyzePairSemantics(fromRaw, toRaw) {
        const rFrom = resolveBoundary(fromRaw, false);
        const rTo   = resolveBoundary(toRaw, true);

        if (rFrom.empty && rTo.empty) {
            return { mode: 'empty', isStandard: true, simpleY: '', simpleM: '', simpleD: '', label: 'Empty' };
        }
        if (!rFrom.valid || !rTo.valid) {
            return { mode: 'invalid', isStandard: false, simpleY: '', simpleM: '', simpleD: '', label: 'Invalid date' };
        }
        if (!rFrom.empty && rTo.empty) {
            return { mode: 'after', isStandard: false, simpleY: '', simpleM: '', simpleD: '', label: `Earliest only (≥ ${rFrom.isoShort})` };
        }
        if (rFrom.empty && !rTo.empty) {
            return { mode: 'before', isStandard: false, simpleY: '', simpleM: '', simpleD: '', label: `Latest only (≤ ${rTo.isoShort})` };
        }

        // Both from and to are present and valid:
        if (rFrom.yearNum === rTo.yearNum && rFrom.monthNum === rTo.monthNum && rFrom.dayNum === rTo.dayNum) {
            return {
                mode: 'exact',
                isStandard: true,
                simpleY: String(rFrom.yearNum),
                simpleM: String(rFrom.monthNum).padStart(2, '0'),
                simpleD: String(rFrom.dayNum).padStart(2, '0'),
                label: `Exact day (${rFrom.isoShort}, 00:00–23:59)`
            };
        }

        if (rFrom.yearNum === rTo.yearNum) {
            // Check full year (01-01 to 12-31)
            if (rFrom.monthNum === 1 && rFrom.dayNum === 1 && rTo.monthNum === 12 && rTo.dayNum === 31) {
                return {
                    mode: 'exact',
                    isStandard: true,
                    simpleY: String(rFrom.yearNum),
                    simpleM: '',
                    simpleD: '',
                    label: `Full year span (${rFrom.isoShort} to ${rTo.isoShort})`
                };
            }
            // Check full month (MM-01 to MM-lastDay)
            const lastDay = getLastDayOfMonth(rFrom.yearNum, rFrom.monthNum);
            if (rFrom.monthNum === rTo.monthNum && rFrom.dayNum === 1 && rTo.dayNum === lastDay) {
                return {
                    mode: 'exact',
                    isStandard: true,
                    simpleY: String(rFrom.yearNum),
                    simpleM: String(rFrom.monthNum).padStart(2, '0'),
                    simpleD: '',
                    label: `Full month span (${rFrom.isoShort} to ${rTo.isoShort})`
                };
            }
        }

        return {
            mode: 'between',
            isStandard: false,
            simpleY: '',
            simpleM: '',
            simpleD: '',
            label: `Timespan (${rFrom.isoShort} to ${rTo.isoShort})`
        };
    }

    /**
     * Expands a Simple 1-row input { Y, M, D } into { from, to } raw objects
     */
    function expandSimpleToPair(simpleObj) {
        const yStr = (simpleObj.Y || '').trim();
        const mStr = (simpleObj.M || '').trim();
        const dStr = (simpleObj.D || '').trim();

        const emptyRaw = () => ({ Y: '', M: '', D: '', h: '', m: '', s: '' });
        if (!yStr && !mStr && !dStr) {
            return { from: emptyRaw(), to: emptyRaw() };
        }

        const yearNum = Number(yStr);
        const validYear = Number.isInteger(yearNum) && yearNum !== 0;

        if (yStr && mStr && dStr) {
            return {
                from: { Y: yStr, M: mStr, D: dStr, h: '', m: '', s: '' },
                to:   { Y: yStr, M: mStr, D: dStr, h: '', m: '', s: '' }
            };
        } else if (yStr && mStr && !dStr) {
            const monthNum = Number(mStr);
            const lastDay = (validYear && monthNum >= 1 && monthNum <= 12)
                ? String(getLastDayOfMonth(yearNum, monthNum))
                : '31';
            return {
                from: { Y: yStr, M: mStr, D: '01', h: '', m: '', s: '' },
                to:   { Y: yStr, M: mStr, D: lastDay, h: '', m: '', s: '' }
            };
        } else {
            return {
                from: { Y: yStr, M: '01', D: '01', h: '', m: '', s: '' },
                to:   { Y: yStr, M: '12', D: '31', h: '', m: '', s: '' }
            };
        }
    }

    function syncSimpleStateFromBoundaries() {
        const bSem = analyzePairSemantics(state.begin_from, state.begin_to);
        if (bSem.isStandard) {
            state.simple_begin = { Y: bSem.simpleY, M: bSem.simpleM, D: bSem.simpleD };
        } else {
            state.simple_begin = { Y: '', M: '', D: '' };
        }

        const eSem = analyzePairSemantics(state.end_from, state.end_to);
        if (eSem.isStandard) {
            state.simple_end = { Y: eSem.simpleY, M: eSem.simpleM, D: eSem.simpleD };
        } else {
            state.simple_end = { Y: '', M: '', D: '' };
        }
    }

    // =========================================================================
    // 4. DOM REFERENCES
    // =========================================================================
    const oaDateHeaderControls = document.getElementById('oaDateHeaderControls');
    const oaDateRowsContainer  = document.getElementById('oaDateRowsContainer');
    const dateSwitcherBtn      = document.getElementById('date-switcher');
    const validationErrorRow   = document.getElementById('validationErrorRow');
    const validationErrorMsg   = document.getElementById('validationErrorMessage');

    const previewDetailBegin   = document.getElementById('previewDetailBegin');
    const previewDetailEnd     = document.getElementById('previewDetailEnd');
    const previewTableFirst    = document.getElementById('previewTableFirst');
    const previewTableLast     = document.getElementById('previewTableLast');

    const statusValidationBadge = document.getElementById('statusValidationBadge');
    const statusHeuristicBadge  = document.getElementById('statusHeuristicBadge');
    const statusSemanticsText   = document.getElementById('statusSemanticsText');
    const jsonPayloadEl         = document.getElementById('jsonPayload');

    // =========================================================================
    // 5. HTML BUILDER HELPERS FOR DATE INPUT GROUPS
    // =========================================================================
    function buildTimeInputsHtml(prefixKey) {
        if (!showTimeFields) return '';
        const raw = state[prefixKey] || { h: '', m: '', s: '' };
        const defH = prefixKey.endsWith('_to') ? '23' : '00';
        const defM = prefixKey.endsWith('_to') ? '59' : '00';
        const defS = prefixKey.endsWith('_to') ? '59' : '00';
        return `
            <div class="col"><input type="text" class="hour form-control form-control-sm" data-bound="${prefixKey}" data-part="h" placeholder="hh (${defH})" value="${raw.h || ''}"></div>
            <div class="col"><input type="text" class="minute form-control form-control-sm" data-bound="${prefixKey}" data-part="m" placeholder="mm (${defM})" value="${raw.m || ''}"></div>
            <div class="col"><input type="text" class="second form-control form-control-sm" data-bound="${prefixKey}" data-part="s" placeholder="ss (${defS})" value="${raw.s || ''}"></div>
        `;
    }

    function initTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(el => {
            const existing = bootstrap.Tooltip.getInstance(el);
            if (existing) existing.dispose();
            new bootstrap.Tooltip(el);
        });
    }

    // =========================================================================
    // 6. RENDERING THE 5 UI PROPOSALS INTO THE OPENATLAS FORM TABLE
    // =========================================================================
    function renderDateUI() {
        oaDateHeaderControls.innerHTML = '';
        oaDateRowsContainer.innerHTML = '';

        // Highlight active proposal card
        document.querySelectorAll('.proposal-card-btn').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-proposal') === currentProposal);
        });

        // Toggle visibility of top sub-option bars
        document.getElementById('subOpt_p1').classList.toggle('d-none', currentProposal !== 'p1');
        document.getElementById('subOpt_p2').classList.toggle('d-none', currentProposal !== 'p2');

        if (currentProposal === 'p1') {
            renderProposal1_StatusQuo();
        } else if (currentProposal === 'p2') {
            renderProposal2_DualMode();
        } else if (currentProposal === 'p3') {
            renderProposal3_PrecisionDropdown();
        } else if (currentProposal === 'p4') {
            renderProposal4_InlineSplit();
        } else if (currentProposal === 'p5') {
            renderProposal5_CardsAndTimeline();
        }

        bindDynamicInputs();
        updateLiveOutputs();
        initTooltips();
    }

    // -------------------------------------------------------------------------
    // PROPOSAL 1: Keep Current OpenAtlas 4-Row Layout (1a: Exact, 1b: + Prefixes)
    // -------------------------------------------------------------------------
    function renderProposal1_StatusQuo() {
        const withBadges = (p1Style === 'badges');

        if (withBadges) {
            oaDateHeaderControls.innerHTML = `
                <span class="badge bg-light text-secondary border fw-normal">
                    <i class="fas fa-info-circle text-primary me-1"></i>All 4 rows are optional &amp; independent
                </span>
            `;
        }

        const buildFourRowBlock = (mode, labelText) => {
            const fromKey = `${mode}_from`;
            const toKey   = `${mode}_to`;
            const commentKey = `${mode}_comment`;
            const f = state[fromKey];
            const t = state[toKey];
            const c = state[commentKey];

            if (!withBadges) {
                // 1a: 100% identical to openatlas/templates/util/dates.html
                return `
                <tr class="date-switch">
                    <td class="fit-width text-end">
                        <label class="col-sm-auto mr-1 col-form-label uc-first">${labelText}</label>
                    </td>
                    <td>
                        <div class="row mb-1">
                            <div class="col">
                                <div class="row g-1">
                                    <div class="col"><input type="text" class="year form-control form-control-sm" data-bound="${fromKey}" data-part="Y" placeholder="YYYY" value="${f.Y}"></div>
                                    <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${fromKey}" data-part="M" placeholder="MM" value="${f.M}"></div>
                                    <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${fromKey}" data-part="D" placeholder="DD" value="${f.D}"></div>
                                    ${buildTimeInputsHtml(fromKey)}
                                    <div class="col-3"><input type="text" class="form-control form-control-sm" data-comment="${commentKey}" placeholder="Comment" value="${c}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <div class="row g-1">
                                    <div class="col"><input type="text" class="year form-control form-control-sm" data-bound="${toKey}" data-part="Y" placeholder="YYYY" value="${t.Y}"></div>
                                    <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${toKey}" data-part="M" placeholder="MM" value="${t.M}"></div>
                                    <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${toKey}" data-part="D" placeholder="DD" value="${t.D}"></div>
                                    ${buildTimeInputsHtml(toKey)}
                                    <div class="col-3"></div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>`;
            } else {
                // 1b: Subtle Earliest/Latest input-group prefixes + live feedback in the empty col-3 slot
                return `
                <tr class="date-switch">
                    <td class="fit-width text-end">
                        <label class="col-sm-auto mr-1 col-form-label uc-first">${labelText}</label>
                    </td>
                    <td>
                        <div class="row mb-1">
                            <div class="col">
                                <div class="row g-1 align-items-center">
                                    <div class="col">
                                        <div class="input-group input-group-sm">
                                            <span class="input-group-text oa-input-prefix prefix-from" data-bs-toggle="tooltip" data-bs-title="Earliest possible ${mode} (Terminus post quem / a quo)">Earliest</span>
                                            <input type="text" class="year form-control form-control-sm" data-bound="${fromKey}" data-part="Y" placeholder="YYYY" value="${f.Y}">
                                        </div>
                                    </div>
                                    <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${fromKey}" data-part="M" placeholder="MM" value="${f.M}"></div>
                                    <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${fromKey}" data-part="D" placeholder="DD" value="${f.D}"></div>
                                    ${buildTimeInputsHtml(fromKey)}
                                    <div class="col-3"><input type="text" class="form-control form-control-sm" data-comment="${commentKey}" placeholder="Comment" value="${c}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <div class="row g-1 align-items-center">
                                    <div class="col">
                                        <div class="input-group input-group-sm">
                                            <span class="input-group-text oa-input-prefix prefix-to" data-bs-toggle="tooltip" data-bs-title="Latest possible ${mode} (Terminus ante quem / ad quem)">Latest</span>
                                            <input type="text" class="year form-control form-control-sm" data-bound="${toKey}" data-part="Y" placeholder="YYYY" value="${t.Y}">
                                        </div>
                                    </div>
                                    <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${toKey}" data-part="M" placeholder="MM" value="${t.M}"></div>
                                    <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${toKey}" data-part="D" placeholder="DD" value="${t.D}"></div>
                                    ${buildTimeInputsHtml(toKey)}
                                    <div class="col-3 d-flex align-items-center">
                                        <span class="live-expansion-badge text-truncate" data-feedback-pair="${mode}"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>`;
            }
        };

        oaDateRowsContainer.innerHTML =
            buildFourRowBlock('begin', 'Begin') +
            buildFourRowBlock('end', 'End');
    }

    // -------------------------------------------------------------------------
    // PROPOSAL 2: Dual-Mode (Simple & Advanced View - Tabs / Switch / Pills)
    // -------------------------------------------------------------------------
    function renderProposal2_DualMode() {
        // Header controls (if Switch or Pills selected)
        if (p2Control === 'switch') {
            oaDateHeaderControls.innerHTML = `
                <div class="form-check form-switch mb-0 ms-1">
                    <input class="form-check-input" type="checkbox" role="switch" id="oaAdvSwitch" ${isAdvancedView ? 'checked' : ''}>
                    <label class="form-check-label small fw-bold text-secondary" for="oaAdvSwitch">
                        Advanced Date View <span class="fw-normal text-muted">(Termini / Uncertainty)</span>
                    </label>
                </div>
            `;
        } else if (p2Control === 'pills') {
            oaDateHeaderControls.innerHTML = `
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn ${!isAdvancedView ? 'btn-primary' : 'btn-outline-secondary'} p2-mode-btn" data-adv="false">Simple View</button>
                    <button type="button" class="btn ${isAdvancedView ? 'btn-primary' : 'btn-outline-secondary'} p2-mode-btn" data-adv="true">Advanced View</button>
                </div>
            `;
        }

        let tabsRowHtml = '';
        if (p2Control === 'tabs') {
            tabsRowHtml = `
            <tr class="date-switch">
                <td class="fit-width"></td>
                <td class="pb-0">
                    <ul class="nav nav-tabs nav-tabs-sm">
                        <li class="nav-item">
                            <button type="button" class="nav-link py-1 px-3 ${!isAdvancedView ? 'active fw-bold' : ''} p2-mode-btn" data-adv="false">
                                Simple View
                            </button>
                        </li>
                        <li class="nav-item">
                            <button type="button" class="nav-link py-1 px-3 ${isAdvancedView ? 'active fw-bold' : ''} p2-mode-btn" data-adv="true">
                                Advanced View <small class="text-muted ms-1">(Earliest / Latest)</small>
                            </button>
                        </li>
                    </ul>
                </td>
            </tr>`;
        }

        if (!isAdvancedView) {
            // SIMPLE VIEW (1 row for Begin, 1 row for End)
            syncSimpleStateFromBoundaries();
            const bSem = analyzePairSemantics(state.begin_from, state.begin_to);
            const eSem = analyzePairSemantics(state.end_from, state.end_to);

            const renderSimpleBlock = (mode, labelText, sem) => {
                const sObj = state[`simple_${mode}`];
                const cVal = state[`${mode}_comment`];
                const warnHtml = !sem.isStandard ? `
                    <div class="alert alert-warning py-1 px-2 mb-1 small d-flex align-items-center justify-content-between">
                        <span><i class="fas fa-exclamation-triangle me-1"></i><strong>Complex date active (${sem.label}):</strong> Editing in Simple View will overwrite both bounds.</span>
                        <button type="button" class="btn btn-xs btn-outline-dark py-0 px-2 ms-2 p2-mode-btn" data-adv="true">Edit in Advanced</button>
                    </div>` : '';

                return `
                    ${warnHtml}
                    <div class="row g-1 align-items-center">
                        <div class="col"><input type="text" class="year form-control form-control-sm" data-simple="${mode}" data-part="Y" placeholder="YYYY" value="${sObj.Y}"></div>
                        <div class="col"><input type="text" class="month form-control form-control-sm" data-simple="${mode}" data-part="M" placeholder="MM" value="${sObj.M}"></div>
                        <div class="col"><input type="text" class="day form-control form-control-sm" data-simple="${mode}" data-part="D" placeholder="DD" value="${sObj.D}"></div>
                        <div class="col-4"><input type="text" class="form-control form-control-sm" data-comment="${mode}_comment" placeholder="Comment" value="${cVal}"></div>
                    </div>
                    <div class="mt-1">
                        <span class="live-expansion-badge" data-feedback-pair="${mode}"></span>
                    </div>
                `;
            };

            if (p2Layout === 'stacked') {
                oaDateRowsContainer.innerHTML = tabsRowHtml + `
                    <tr class="date-switch">
                        <td class="fit-width text-end"><label class="col-form-label uc-first">Begin</label></td>
                        <td>${renderSimpleBlock('begin', 'Begin', bSem)}</td>
                    </tr>
                    <tr class="date-switch">
                        <td class="fit-width text-end"><label class="col-form-label uc-first">End</label></td>
                        <td>${renderSimpleBlock('end', 'End', eSem)}</td>
                    </tr>
                `;
            } else {
                // Side-by-Side Simple View
                oaDateRowsContainer.innerHTML = tabsRowHtml + `
                    <tr class="date-switch">
                        <td class="fit-width text-end"><label class="col-form-label">Begin / End</label></td>
                        <td>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="oa-date-box">
                                        <div class="fw-bold small text-secondary mb-1">Begin</div>
                                        ${renderSimpleBlock('begin', 'Begin', bSem)}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="oa-date-box">
                                        <div class="fw-bold small text-secondary mb-1">End</div>
                                        ${renderSimpleBlock('end', 'End', eSem)}
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            }
        } else {
            // ADVANCED VIEW (All 4 boundaries explicit with tooltips)
            const renderAdvBoundaryRows = (mode) => {
                const fKey = `${mode}_from`;
                const tKey = `${mode}_to`;
                const cKey = `${mode}_comment`;
                const f = state[fKey];
                const t = state[tKey];
                const c = state[cKey];

                return `
                    <div class="row g-1 align-items-center mb-1">
                        <div class="col-auto" style="width: 115px;">
                            <span class="small text-secondary fw-semibold">Earliest</span>
                            <span data-bs-toggle="tooltip" data-bs-title="Terminus post quem / a quo (${fKey}): Earliest possible date"><i class="fas fa-info-circle tooltipicon ms-1"></i></span>
                        </div>
                        <div class="col"><input type="text" class="year form-control form-control-sm" data-bound="${fKey}" data-part="Y" placeholder="YYYY" value="${f.Y}"></div>
                        <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${fKey}" data-part="M" placeholder="MM" value="${f.M}"></div>
                        <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${fKey}" data-part="D" placeholder="DD" value="${f.D}"></div>
                        ${buildTimeInputsHtml(fKey)}
                        <div class="col-3"><input type="text" class="form-control form-control-sm" data-comment="${cKey}" placeholder="Comment" value="${c}"></div>
                    </div>
                    <div class="row g-1 align-items-center">
                        <div class="col-auto" style="width: 115px;">
                            <span class="small text-secondary fw-semibold">Latest</span>
                            <span data-bs-toggle="tooltip" data-bs-title="Terminus ante quem / ad quem (${tKey}): Latest possible date"><i class="fas fa-info-circle tooltipicon ms-1"></i></span>
                        </div>
                        <div class="col"><input type="text" class="year form-control form-control-sm" data-bound="${tKey}" data-part="Y" placeholder="YYYY" value="${t.Y}"></div>
                        <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${tKey}" data-part="M" placeholder="MM" value="${t.M}"></div>
                        <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${tKey}" data-part="D" placeholder="DD" value="${t.D}"></div>
                        ${buildTimeInputsHtml(tKey)}
                        <div class="col-3 d-flex align-items-center">
                            <span class="live-expansion-badge text-truncate" data-feedback-pair="${mode}"></span>
                        </div>
                    </div>
                `;
            };

            if (p2Layout === 'stacked') {
                oaDateRowsContainer.innerHTML = tabsRowHtml + `
                    <tr class="date-switch">
                        <td class="fit-width text-end"><label class="col-form-label uc-first">Begin</label></td>
                        <td>${renderAdvBoundaryRows('begin')}</td>
                    </tr>
                    <tr class="date-switch">
                        <td class="fit-width text-end"><label class="col-form-label uc-first">End</label></td>
                        <td>${renderAdvBoundaryRows('end')}</td>
                    </tr>
                `;
            } else {
                // Side-by-Side Advanced View
                oaDateRowsContainer.innerHTML = tabsRowHtml + `
                    <tr class="date-switch">
                        <td class="fit-width text-end"><label class="col-form-label">Begin / End</label></td>
                        <td>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="oa-date-box">
                                        <div class="fw-bold small text-primary mb-2">Begin Boundary</div>
                                        ${renderAdvBoundaryRows('begin')}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="oa-date-box">
                                        <div class="fw-bold small text-danger mb-2">End Boundary</div>
                                        ${renderAdvBoundaryRows('end')}
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    }

    // -------------------------------------------------------------------------
    // PROPOSAL 3: Precision Mode-Selector Dropdown (Intent-Driven UI)
    // -------------------------------------------------------------------------
    function renderProposal3_PrecisionDropdown() {
        syncSimpleStateFromBoundaries();

        oaDateHeaderControls.innerHTML = `
            <span class="badge bg-warning text-dark border fw-normal">
                <i class="fas fa-magic me-1"></i>Select precision / terminus type per row
            </span>
        `;

        const buildIntentRow = (mode, labelText) => {
            const selMode = p3Mode[mode]; // 'exact' | 'between' | 'after' | 'before'
            const fKey = `${mode}_from`;
            const tKey = `${mode}_to`;
            const cKey = `${mode}_comment`;
            const f = state[fKey];
            const t = state[tKey];
            const s = state[`simple_${mode}`];
            const c = state[cKey];

            let inputsHtml = '';
            if (selMode === 'exact') {
                inputsHtml = `
                    <div class="col"><input type="text" class="year form-control form-control-sm" data-simple="${mode}" data-part="Y" placeholder="YYYY" value="${s.Y}"></div>
                    <div class="col"><input type="text" class="month form-control form-control-sm" data-simple="${mode}" data-part="M" placeholder="MM" value="${s.M}"></div>
                    <div class="col"><input type="text" class="day form-control form-control-sm" data-simple="${mode}" data-part="D" placeholder="DD" value="${s.D}"></div>
                `;
            } else if (selMode === 'after') {
                inputsHtml = `
                    <div class="col">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text oa-input-prefix prefix-from">≥ From</span>
                            <input type="text" class="year form-control form-control-sm" data-bound="${fKey}" data-part="Y" placeholder="YYYY" value="${f.Y}">
                        </div>
                    </div>
                    <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${fKey}" data-part="M" placeholder="MM" value="${f.M}"></div>
                    <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${fKey}" data-part="D" placeholder="DD" value="${f.D}"></div>
                    ${buildTimeInputsHtml(fKey)}
                `;
            } else if (selMode === 'before') {
                inputsHtml = `
                    <div class="col">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text oa-input-prefix prefix-to">≤ By</span>
                            <input type="text" class="year form-control form-control-sm" data-bound="${tKey}" data-part="Y" placeholder="YYYY" value="${t.Y}">
                        </div>
                    </div>
                    <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${tKey}" data-part="M" placeholder="MM" value="${t.M}"></div>
                    <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${tKey}" data-part="D" placeholder="DD" value="${t.D}"></div>
                    ${buildTimeInputsHtml(tKey)}
                `;
            } else if (selMode === 'between') {
                inputsHtml = `
                    <div class="col-12 mt-1">
                        <div class="row g-1 align-items-center mb-1">
                            <div class="col">
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text oa-input-prefix prefix-from">Earliest</span>
                                    <input type="text" class="year form-control form-control-sm" data-bound="${fKey}" data-part="Y" placeholder="YYYY" value="${f.Y}">
                                </div>
                            </div>
                            <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${fKey}" data-part="M" placeholder="MM" value="${f.M}"></div>
                            <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${fKey}" data-part="D" placeholder="DD" value="${f.D}"></div>
                            ${buildTimeInputsHtml(fKey)}
                        </div>
                        <div class="row g-1 align-items-center">
                            <div class="col">
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text oa-input-prefix prefix-to">Latest</span>
                                    <input type="text" class="year form-control form-control-sm" data-bound="${tKey}" data-part="Y" placeholder="YYYY" value="${t.Y}">
                                </div>
                            </div>
                            <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${tKey}" data-part="M" placeholder="MM" value="${t.M}"></div>
                            <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${tKey}" data-part="D" placeholder="DD" value="${t.D}"></div>
                            ${buildTimeInputsHtml(tKey)}
                        </div>
                    </div>
                `;
            }

            return `
            <tr class="date-switch">
                <td class="fit-width text-end">
                    <label class="col-form-label uc-first">${labelText}</label>
                </td>
                <td>
                    <div class="row g-1 align-items-center">
                        <div class="col-auto" style="width: 215px;">
                            <select class="form-select form-select-sm fw-semibold text-primary border-primary p3-mode-select" data-mode-target="${mode}">
                                <option value="exact" ${selMode === 'exact' ? 'selected' : ''}>Exact / Auto Span</option>
                                <option value="between" ${selMode === 'between' ? 'selected' : ''}>Between (Timespan)</option>
                                <option value="after" ${selMode === 'after' ? 'selected' : ''}>After / Earliest (TPQ ≥)</option>
                                <option value="before" ${selMode === 'before' ? 'selected' : ''}>Before / Latest (TAQ ≤)</option>
                            </select>
                        </div>
                        ${selMode !== 'between' ? inputsHtml : ''}
                        <div class="col-3">
                            <input type="text" class="form-control form-control-sm" data-comment="${cKey}" placeholder="Comment" value="${c}">
                        </div>
                        ${selMode === 'between' ? inputsHtml : ''}
                    </div>
                    <div class="mt-1">
                        <span class="live-expansion-badge" data-feedback-pair="${mode}"></span>
                    </div>
                </td>
            </tr>`;
        };

        oaDateRowsContainer.innerHTML =
            buildIntentRow('begin', 'Begin') +
            buildIntentRow('end', 'End');
    }

    // -------------------------------------------------------------------------
    // PROPOSAL 4: Inline Progressive Split-Toggle ([± Time span] per Row)
    // -------------------------------------------------------------------------
    function renderProposal4_InlineSplit() {
        syncSimpleStateFromBoundaries();

        const buildSplitRow = (mode, labelText) => {
            const isSplit = p4Split[mode];
            const fKey = `${mode}_from`;
            const tKey = `${mode}_to`;
            const cKey = `${mode}_comment`;
            const f = state[fKey];
            const t = state[tKey];
            const s = state[`simple_${mode}`];
            const c = state[cKey];

            if (!isSplit) {
                return `
                <tr class="date-switch">
                    <td class="fit-width text-end"><label class="col-form-label uc-first">${labelText}</label></td>
                    <td>
                        <div class="row g-1 align-items-center">
                            <div class="col"><input type="text" class="year form-control form-control-sm" data-simple="${mode}" data-part="Y" placeholder="YYYY" value="${s.Y}"></div>
                            <div class="col"><input type="text" class="month form-control form-control-sm" data-simple="${mode}" data-part="M" placeholder="MM" value="${s.M}"></div>
                            <div class="col"><input type="text" class="day form-control form-control-sm" data-simple="${mode}" data-part="D" placeholder="DD" value="${s.D}"></div>
                            <div class="col-auto">
                                <button type="button" class="btn btn-outline-secondary btn-sm p4-split-btn" data-split-target="${mode}" data-bs-toggle="tooltip" data-bs-title="Split into separate Earliest (from) and Latest (to) boundaries">
                                    <i class="fas fa-arrows-alt-v me-1"></i>± Uncertainty
                                </button>
                            </div>
                            <div class="col-3"><input type="text" class="form-control form-control-sm" data-comment="${cKey}" placeholder="Comment" value="${c}"></div>
                        </div>
                        <div class="mt-1">
                            <span class="live-expansion-badge" data-feedback-pair="${mode}"></span>
                        </div>
                    </td>
                </tr>`;
            } else {
                return `
                <tr class="date-switch">
                    <td class="fit-width text-end"><label class="col-form-label uc-first">${labelText}</label></td>
                    <td>
                        <div class="oa-date-box">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="small fw-bold text-primary"><i class="fas fa-sliders-h me-1"></i>Explicit Boundaries (${labelText})</span>
                                <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2 p4-split-btn" data-split-target="${mode}">
                                    <i class="fas fa-compress-alt me-1"></i>Merge to Simple
                                </button>
                            </div>
                            <div class="row g-1 align-items-center mb-1">
                                <div class="col">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text oa-input-prefix prefix-from">Earliest</span>
                                        <input type="text" class="year form-control form-control-sm" data-bound="${fKey}" data-part="Y" placeholder="YYYY" value="${f.Y}">
                                    </div>
                                </div>
                                <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${fKey}" data-part="M" placeholder="MM" value="${f.M}"></div>
                                <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${fKey}" data-part="D" placeholder="DD" value="${f.D}"></div>
                                ${buildTimeInputsHtml(fKey)}
                                <div class="col-3"><input type="text" class="form-control form-control-sm" data-comment="${cKey}" placeholder="Comment" value="${c}"></div>
                            </div>
                            <div class="row g-1 align-items-center">
                                <div class="col">
                                    <div class="input-group input-group-sm">
                                        <span class="input-group-text oa-input-prefix prefix-to">Latest</span>
                                        <input type="text" class="year form-control form-control-sm" data-bound="${tKey}" data-part="Y" placeholder="YYYY" value="${t.Y}">
                                    </div>
                                </div>
                                <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${tKey}" data-part="M" placeholder="MM" value="${t.M}"></div>
                                <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${tKey}" data-part="D" placeholder="DD" value="${t.D}"></div>
                                ${buildTimeInputsHtml(tKey)}
                                <div class="col-3 d-flex align-items-center">
                                    <span class="live-expansion-badge text-truncate" data-feedback-pair="${mode}"></span>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>`;
            }
        };

        oaDateRowsContainer.innerHTML =
            buildSplitRow('begin', 'Begin') +
            buildSplitRow('end', 'End');
    }

    // -------------------------------------------------------------------------
    // PROPOSAL 5: Compact Boundary Cards + Interactive Visual Mini-Timeline
    // -------------------------------------------------------------------------
    function renderProposal5_CardsAndTimeline() {
        const buildCard = (mode, title, borderClass) => {
            const fKey = `${mode}_from`;
            const tKey = `${mode}_to`;
            const cKey = `${mode}_comment`;
            const f = state[fKey];
            const t = state[tKey];
            const c = state[cKey];

            return `
            <div class="col-md-6">
                <div class="oa-date-box h-100 border-top border-3 ${borderClass}">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong class="small text-uppercase">${title}</strong>
                        <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none copy-from-to-btn" data-copy-mode="${mode}" title="Copy Earliest date into Latest date (for exact 1-day span)">
                            <i class="fas fa-copy me-1"></i>Copy Earliest → Latest
                        </button>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small text-muted mb-1">Earliest ${mode} <code>(${fKey})</code> — <em>TPQ / a quo</em></label>
                        <div class="row g-1">
                            <div class="col"><input type="text" class="year form-control form-control-sm" data-bound="${fKey}" data-part="Y" placeholder="YYYY" value="${f.Y}"></div>
                            <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${fKey}" data-part="M" placeholder="MM" value="${f.M}"></div>
                            <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${fKey}" data-part="D" placeholder="DD" value="${f.D}"></div>
                            ${buildTimeInputsHtml(fKey)}
                        </div>
                    </div>
                    <div class="mb-2">
                        <label class="form-label small text-muted mb-1">Latest ${mode} <code>(${tKey})</code> — <em>TAQ / ad quem</em></label>
                        <div class="row g-1">
                            <div class="col"><input type="text" class="year form-control form-control-sm" data-bound="${tKey}" data-part="Y" placeholder="YYYY" value="${t.Y}"></div>
                            <div class="col"><input type="text" class="month form-control form-control-sm" data-bound="${tKey}" data-part="M" placeholder="MM" value="${t.M}"></div>
                            <div class="col"><input type="text" class="day form-control form-control-sm" data-bound="${tKey}" data-part="D" placeholder="DD" value="${t.D}"></div>
                            ${buildTimeInputsHtml(tKey)}
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center gap-2 mt-2">
                        <input type="text" class="form-control form-control-sm" data-comment="${cKey}" placeholder="${title} Comment" value="${c}">
                    </div>
                    <div class="mt-2">
                        <span class="live-expansion-badge" data-feedback-pair="${mode}"></span>
                    </div>
                </div>
            </div>`;
        };

        oaDateRowsContainer.innerHTML = `
            <tr class="date-switch">
                <td class="fit-width text-end"><label class="col-form-label">Timeline</label></td>
                <td>
                    <!-- Visual Mini-Timeline -->
                    <div class="mb-3 p-2 bg-white border rounded">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                            <span id="tlLabelBegin">Begin: —</span>
                            <span class="fw-bold text-dark" id="tlLabelCenter">Visual Interval Preview</span>
                            <span id="tlLabelEnd">End: —</span>
                        </div>
                        <div class="timeline-track">
                            <div id="tlVisualBar" class="timeline-bar" style="width: 100%;"></div>
                        </div>
                    </div>
                    <div class="row g-3">
                        ${buildCard('begin', 'Begin Boundary', 'border-primary')}
                        ${buildCard('end', 'End Boundary', 'border-success')}
                    </div>
                </td>
            </tr>
        `;
    }

    // =========================================================================
    // 7. EVENT BINDING FOR FORM INPUTS (NO INPUT OVERWRITING WHILE TYPING!)
    // =========================================================================
    function bindDynamicInputs() {
        // 1. Explicit Boundary Inputs (begin_from, begin_to, end_from, end_to)
        oaDateRowsContainer.querySelectorAll('input[data-bound]').forEach(input => {
            input.addEventListener('input', () => {
                const boundKey = input.getAttribute('data-bound');
                const part = input.getAttribute('data-part');
                state[boundKey][part] = input.value;
                updateLiveOutputs();
            });
        });

        // 2. Simple Auto-Span Inputs (simple_begin, simple_end)
        oaDateRowsContainer.querySelectorAll('input[data-simple]').forEach(input => {
            input.addEventListener('input', () => {
                const mode = input.getAttribute('data-simple'); // 'begin' | 'end'
                const part = input.getAttribute('data-part');   // 'Y' | 'M' | 'D'
                state[`simple_${mode}`][part] = input.value;

                const expanded = expandSimpleToPair(state[`simple_${mode}`]);
                state[`${mode}_from`] = expanded.from;
                state[`${mode}_to`]   = expanded.to;

                // If user types in Simple View while an asymmetric warning was shown, remove the warning banner cleanly
                const alertEl = input.closest('td')?.querySelector('.alert-warning');
                if (alertEl) alertEl.remove();

                updateLiveOutputs();
            });
        });

        // 3. Comment Inputs
        oaDateRowsContainer.querySelectorAll('input[data-comment]').forEach(input => {
            input.addEventListener('input', () => {
                const cKey = input.getAttribute('data-comment');
                state[cKey] = input.value;
                updateLiveOutputs();
            });
        });

        // 4. Proposal 2 Mode Switch / Tabs / Pills
        const oaAdvSwitch = document.getElementById('oaAdvSwitch');
        if (oaAdvSwitch) {
            oaAdvSwitch.addEventListener('change', (e) => {
                isAdvancedView = e.target.checked;
                renderDateUI();
            });
        }
        document.querySelectorAll('.p2-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                isAdvancedView = (btn.getAttribute('data-adv') === 'true');
                renderDateUI();
            });
        });

        // 5. Proposal 3 Precision Select Dropdown
        oaDateRowsContainer.querySelectorAll('.p3-mode-select').forEach(sel => {
            sel.addEventListener('change', () => {
                const mode = sel.getAttribute('data-mode-target'); // 'begin' | 'end'
                const newMode = sel.value;
                p3Mode[mode] = newMode;

                // Cleanly adapt state when user changes the dropdown mode
                if (newMode === 'after') {
                    // Keep _from, clear _to
                    if (isEmptyPart(state[`${mode}_from`]) && !isEmptyPart(state[`${mode}_to`])) {
                        state[`${mode}_from`] = { ...state[`${mode}_to`] };
                    }
                    state[`${mode}_to`] = { Y: '', M: '', D: '', h: '', m: '', s: '' };
                } else if (newMode === 'before') {
                    // Keep _to, clear _from
                    if (isEmptyPart(state[`${mode}_to`]) && !isEmptyPart(state[`${mode}_from`])) {
                        state[`${mode}_to`] = { ...state[`${mode}_from`] };
                    }
                    state[`${mode}_from`] = { Y: '', M: '', D: '', h: '', m: '', s: '' };
                } else if (newMode === 'exact') {
                    // If only one was filled, mirror it to form a standard interval
                    if (!isEmptyPart(state[`${mode}_from`]) && isEmptyPart(state[`${mode}_to`])) {
                        const f = state[`${mode}_from`];
                        const exp = expandSimpleToPair({ Y: f.Y, M: f.M, D: f.D });
                        state[`${mode}_from`] = exp.from;
                        state[`${mode}_to`]   = exp.to;
                    } else if (isEmptyPart(state[`${mode}_from`]) && !isEmptyPart(state[`${mode}_to`])) {
                        const t = state[`${mode}_to`];
                        const exp = expandSimpleToPair({ Y: t.Y, M: t.M, D: t.D });
                        state[`${mode}_from`] = exp.from;
                        state[`${mode}_to`]   = exp.to;
                    }
                }
                renderDateUI();
            });
        });

        // 6. Proposal 4 Split-Toggle Buttons
        oaDateRowsContainer.querySelectorAll('.p4-split-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-split-target');
                p4Split[mode] = !p4Split[mode];
                renderDateUI();
            });
        });

        // 7. Proposal 5 Copy Earliest -> Latest Button
        oaDateRowsContainer.querySelectorAll('.copy-from-to-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-copy-mode');
                state[`${mode}_to`] = { ...state[`${mode}_from`] };
                renderDateUI();
            });
        });
    }

    // =========================================================================
    // 8. LIVE OUTPUTS: FEEDBACK BADGES, DETAIL PREVIEW, VALIDATION & PAYLOAD
    // =========================================================================
    function formatOpenAtlasEntityDate(rFrom, rTo, comment) {
        if (!rFrom.valid || !rTo.valid) return '<span class="text-danger">Invalid date</span>';
        if (rFrom.empty && rTo.empty) return '—';

        let text = '';
        if (!rFrom.empty && !rTo.empty) {
            if (rFrom.displayDate === rTo.displayDate) {
                text = rFrom.displayDate;
            } else {
                text = `between ${rFrom.displayDate} and ${rTo.displayDate}`;
            }
        } else if (!rFrom.empty) {
            text = `from ${rFrom.displayDate}`;
        } else {
            text = `by ${rTo.displayDate}`;
        }

        if (comment && comment.trim()) {
            text += ` (${comment.trim()})`;
        }
        return text;
    }

    function updateLiveOutputs() {
        const bFrom = resolveBoundary(state.begin_from, false);
        const bTo   = resolveBoundary(state.begin_to, true);
        const eFrom = resolveBoundary(state.end_from, false);
        const eTo   = resolveBoundary(state.end_to, true);

        const bSem = analyzePairSemantics(state.begin_from, state.begin_to);
        const eSem = analyzePairSemantics(state.end_from, state.end_to);

        // 1. Update inline expansion feedback badges inside the form
        oaDateRowsContainer.querySelectorAll('[data-feedback-pair]').forEach(badge => {
            const mode = badge.getAttribute('data-feedback-pair');
            const sem = mode === 'begin' ? bSem : eSem;
            if (sem.mode === 'empty') {
                badge.textContent = 'No date set';
                badge.className = 'live-expansion-badge text-muted bg-light border-secondary-subtle';
            } else if (sem.mode === 'invalid') {
                badge.textContent = '⚠️ Invalid date input';
                badge.className = 'live-expansion-badge bg-danger-subtle text-danger border-danger';
            } else {
                badge.textContent = `→ DB: ${sem.label}`;
                badge.className = `live-expansion-badge ${!sem.isStandard ? 'badge-asymmetric' : ''}`;
            }
        });

        // 2. Update Proposal 5 Visual Mini-Timeline (if active)
        const tlBar = document.getElementById('tlVisualBar');
        if (tlBar) {
            const tlLabelBegin  = document.getElementById('tlLabelBegin');
            const tlLabelEnd    = document.getElementById('tlLabelEnd');
            const tlLabelCenter = document.getElementById('tlLabelCenter');

            tlLabelBegin.textContent = `Begin: ${bSem.label}`;
            tlLabelEnd.textContent   = `End: ${eSem.label}`;

            const openLeft  = (bSem.mode === 'before') || (bSem.mode === 'empty' && eSem.mode !== 'empty');
            const openRight = (eSem.mode === 'after')  || (eSem.mode === 'empty' && bSem.mode !== 'empty');

            tlBar.className = 'timeline-bar';
            if (bSem.mode === 'empty' && eSem.mode === 'empty') {
                tlBar.style.width = '0%';
                tlLabelCenter.textContent = 'Enter a date to visualize interval';
            } else {
                tlBar.style.width = '100%';
                if (openLeft) tlBar.classList.add('open-left');
                if (openRight) tlBar.classList.add('open-right');
                tlLabelCenter.textContent = `${openLeft ? '◄ Open Earliest' : '● Bounded Start'} — ${openRight ? 'Open Latest ►' : 'Bounded End ●'}`;
            }
        }

        // 3. Validation Check (OpenAtlas validation.py rules)
        const errors = [];
        if (!bFrom.valid) errors.push(`Begin (Earliest): ${bFrom.error}`);
        if (!bTo.valid)   errors.push(`Begin (Latest): ${bTo.error}`);
        if (!eFrom.valid) errors.push(`End (Earliest): ${eFrom.error}`);
        if (!eTo.valid)   errors.push(`End (Latest): ${eTo.error}`);

        if (bFrom.valid && bTo.valid && !bFrom.empty && !bTo.empty) {
            if (bFrom.sortValue > bTo.sortValue) {
                errors.push("Begin: First date cannot be after second (begin_from > begin_to).");
            }
        }
        if (eFrom.valid && eTo.valid && !eFrom.empty && !eTo.empty) {
            if (eFrom.sortValue > eTo.sortValue) {
                errors.push("End: First date cannot be after second (end_from > end_to).");
            }
        }

        const hasBegin = (!bFrom.empty && bFrom.valid) || (!bTo.empty && bTo.valid);
        const hasEnd   = (!eFrom.empty && eFrom.valid) || (!eTo.empty && eTo.valid);
        if (errors.length === 0 && hasBegin && hasEnd) {
            const effectiveBegin = !bTo.empty ? bTo.sortValue : bFrom.sortValue;
            const effectiveEnd   = !eFrom.empty ? eFrom.sortValue : eTo.sortValue;
            if (effectiveBegin > effectiveEnd) {
                errors.push("Begin dates cannot start after end dates.");
            }
        }

        if (errors.length > 0) {
            validationErrorRow.classList.remove('d-none');
            validationErrorMsg.innerHTML = errors.map(e => `<div><i class="fas fa-exclamation-circle me-1"></i>${e}</div>`).join('');
            statusValidationBadge.className = 'badge bg-danger';
            statusValidationBadge.textContent = 'Invalid';
        } else {
            validationErrorRow.classList.add('d-none');
            validationErrorMsg.innerHTML = '';
            statusValidationBadge.className = 'badge bg-success';
            statusValidationBadge.textContent = 'Valid';
        }

        // 4. Heuristic Check should_show_advanced_view()
        const needsAdvanced = !(bSem.isStandard && eSem.isStandard);
        if (needsAdvanced) {
            statusHeuristicBadge.className = 'badge bg-warning text-dark';
            statusHeuristicBadge.textContent = 'True (Advanced View)';
        } else {
            statusHeuristicBadge.className = 'badge bg-info text-dark';
            statusHeuristicBadge.textContent = 'False (Simple View)';
        }

        // Semantics Summary
        if (bSem.mode === 'empty' && eSem.mode === 'empty') {
            statusSemanticsText.textContent = 'No dates entered';
        } else {
            statusSemanticsText.textContent = `Begin: ${bSem.mode.toUpperCase()} | End: ${eSem.mode.toUpperCase()}`;
        }

        // 5. OpenAtlas Detail View & Table Columns Preview
        previewDetailBegin.innerHTML = formatOpenAtlasEntityDate(bFrom, bTo, state.begin_comment);
        previewDetailEnd.innerHTML   = formatOpenAtlasEntityDate(eFrom, eTo, state.end_comment);

        const firstYear = !bFrom.empty && bFrom.valid ? bFrom.yearNum : (!bTo.empty && bTo.valid ? bTo.yearNum : '—');
        const lastYear  = !eTo.empty && eTo.valid ? eTo.yearNum : (!eFrom.empty && eFrom.valid ? eFrom.yearNum : '—');
        previewTableFirst.textContent = firstYear;
        previewTableLast.textContent  = lastYear;

        // 6. Database / API JSON Payload
        const hasAnyBegin = !bFrom.empty || !bTo.empty;
        const hasAnyEnd   = !eFrom.empty || !eTo.empty;

        const payload = {
            begin_from: bFrom.valid ? bFrom.timestamp : "INVALID",
            begin_to:   bTo.valid   ? bTo.timestamp   : "INVALID",
            begin_comment: (hasAnyBegin && state.begin_comment.trim()) ? state.begin_comment.trim() : null,
            end_from:   eFrom.valid ? eFrom.timestamp : "INVALID",
            end_to:     eTo.valid   ? eTo.timestamp   : "INVALID",
            end_comment: (hasAnyEnd && state.end_comment.trim()) ? state.end_comment.trim() : null
        };
        jsonPayloadEl.textContent = JSON.stringify(payload, null, 2);
    }

    // =========================================================================
    // 9. LOADING PRESETS & TOP-BAR CONTROLS
    // =========================================================================
    function applyPreset(presetKey) {
        const p = presets[presetKey];
        if (!p) return;

        state.begin_from = { ...p.begin_from };
        state.begin_to   = { ...p.begin_to };
        state.end_from   = { ...p.end_from };
        state.end_to     = { ...p.end_to };
        state.begin_comment = p.begin_comment || '';
        state.end_comment   = p.end_comment || '';

        document.getElementById('entity_name').value = p.entityName || 'Historical Record';
        document.getElementById('entity_desc').value = p.entityDesc || '';
        document.getElementById('activeScenarioDescription').textContent = p.title;

        // Automatically set view modes according to load heuristic
        const bSem = analyzePairSemantics(state.begin_from, state.begin_to);
        const eSem = analyzePairSemantics(state.end_from, state.end_to);

        isAdvancedView = !(bSem.isStandard && eSem.isStandard);
        p3Mode.begin = bSem.mode === 'empty' ? 'exact' : bSem.mode;
        p3Mode.end   = eSem.mode === 'empty' ? 'exact' : eSem.mode;
        p4Split.begin = !bSem.isStandard;
        p4Split.end   = !eSem.isStandard;

        renderDateUI();
    }

    // Bind Scenario Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            if (btn.getAttribute('data-preset') !== 'clear') {
                btn.classList.add('active');
            }
            applyPreset(btn.getAttribute('data-preset'));
        });
    });

    // Bind Proposal Cards (p1..p5)
    document.querySelectorAll('.proposal-card-btn').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.proposal-card-btn').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentProposal = card.getAttribute('data-proposal');
            renderDateUI();
        });
    });

    // Bind Proposal 1 & 2 Sub-options
    document.querySelectorAll('input[name="p1_style"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            p1Style = e.target.value;
            renderDateUI();
        });
    });
    document.querySelectorAll('input[name="p2_control"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            p2Control = e.target.value;
            renderDateUI();
        });
    });
    document.querySelectorAll('input[name="p2_layout"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            p2Layout = e.target.value;
            renderDateUI();
        });
    });

    // Bind Time Fields Switch
    document.getElementById('toggleTimeFields').addEventListener('change', (e) => {
        showTimeFields = e.target.checked;
        renderDateUI();
    });

    // Bind OpenAtlas Date Show/Hide Button (#date-switcher)
    dateSwitcherBtn.addEventListener('click', () => {
        isDateSectionHidden = !isDateSectionHidden;
        oaDateRowsContainer.classList.toggle('d-none', isDateSectionHidden);
        oaDateHeaderControls.classList.toggle('d-none', isDateSectionHidden);
        dateSwitcherBtn.textContent = isDateSectionHidden ? 'Show' : 'Hide';
    });

    // Initialize from URL query parameters if provided (great for sharing specific views!)
    const params = new URLSearchParams(window.location.search);
    const initPreset = params.get('preset') || 'exact_day';
    const initProposal = params.get('proposal');
    if (initProposal && ['p1', 'p2', 'p3', 'p4', 'p5'].includes(initProposal)) {
        currentProposal = initProposal;
        document.querySelectorAll('.proposal-card-btn').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-proposal') === currentProposal);
        });
    }
    if (params.get('p1') === 'badges') {
        p1Style = 'badges';
        document.getElementById('p1_badges').checked = true;
    }
    if (params.get('p2_ctrl') && ['tabs', 'switch', 'pills'].includes(params.get('p2_ctrl'))) {
        p2Control = params.get('p2_ctrl');
        const radio = document.querySelector(`input[name="p2_control"][value="${p2Control}"]`);
        if (radio) radio.checked = true;
    }
    if (params.get('p2_lay') && ['stacked', 'side'].includes(params.get('p2_lay'))) {
        p2Layout = params.get('p2_lay');
        const radio = document.querySelector(`input[name="p2_layout"][value="${p2Layout}"]`);
        if (radio) radio.checked = true;
    }
    if (params.get('time') === '1') {
        showTimeFields = true;
        document.getElementById('toggleTimeFields').checked = true;
    }

    const defaultPresetBtn = document.querySelector(`.preset-btn[data-preset="${initPreset}"]`);
    if (defaultPresetBtn) defaultPresetBtn.classList.add('active');
    applyPreset(initPreset);
});
