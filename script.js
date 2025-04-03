'use strict';

// *** DELETED: Spline Application variable ***

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const INSTRUMENT_DATA = {
        'XAUUSD': { name: 'Gold', pipValuePerStandardLot: 10 },
        'BTCUSD': { name: 'Bitcoin', pipValuePerStandardLot: 1 }
    };
    const CALCULATION_DELAY = 1000;
    const DEFAULT_LANG = 'en';
    const LS_THEME_KEY = 'calculator_theme';
    const LS_LANG_KEY = 'calculator_language';

    // --- Translations Dictionary ---
    const translations = {
        en: {
            mainTitle: "Forex Risk Calculator", subTitle: "CFD Position Size Calculator",
            labelBalance: "Account Balance (USD):", placeholderBalance: "e.g., 10000",
            labelRiskType: "Risk Type:", optionPercentage: "Risk in Percentage (%)", optionFixed: "Risk in Fixed Amount ($)",
            labelRiskValue: "Risk Value:", placeholderRiskValuePercent: "e.g., 1 (for 1%)", placeholderRiskValueFixed: "e.g., 100 (for $100)",
            labelStopLoss: "Stop-Loss (pips):", placeholderStopLoss: "e.g., 50",
            labelInstrument: "Instrument:", selectInstrumentPlaceholder: "Select Instrument...", instrumentGold: "XAUUSD (Gold)", instrumentBitcoin: "BTCUSD (Bitcoin)",
            calculateButton: "Calculate Position Size", resultHeading: "Calculated Position Size:",
            resultInitial: "Result will appear here.", calculating: "Calculating...",
            lotUnitStandard: "Standard Lot(s)", lotUnitMini: "Mini Lot(s)", lotUnitMicro: "Micro Lot(s)", lotUnitSubMicro: "Standard Lot(s) (sub-micro)",
            errorBalancePositive: "Account Balance must be a positive number.", errorRiskValuePositive: "Risk Value must be a positive number.",
            errorStopLossPositive: "Stop-Loss (pips) must be a positive number.", errorInstrumentPipValue: "Pip value definition missing or invalid for selected instrument.",
            errorRiskPercentRange: "Risk percentage cannot realistically exceed 100%.", errorRiskFixedRange: "Fixed risk amount cannot exceed account balance.",
            errorRiskType: "Invalid risk type selected.", errorRiskPerLot: "Calculated risk per lot is zero or negative.",
            errorResultInvalid: "Calculation resulted in an invalid size.", unknownError: "An unknown error occurred.",
            errorSelectInstrument: "Please select an instrument.",
            ariaLangButton: "Switch language", ariaThemeButtonLight: "Activate light mode", ariaThemeButtonDark: "Activate dark mode"
        },
        fr: {
            mainTitle: "Calculateur de Risque Forex", subTitle: "Calculateur de Taille de Position CFD",
            labelBalance: "Solde du Compte (USD) :", placeholderBalance: "ex : 10000",
            labelRiskType: "Type de Risque :", optionPercentage: "Risque en Pourcentage (%)", optionFixed: "Risque Montant Fixe ($)",
            labelRiskValue: "Valeur du Risque :", placeholderRiskValuePercent: "ex : 1 (pour 1%)", placeholderRiskValueFixed: "ex : 100 (pour 100$)",
            labelStopLoss: "Stop-Loss (pips) :", placeholderStopLoss: "ex : 50",
            labelInstrument: "Instrument :", selectInstrumentPlaceholder: "Sélectionnez l'instrument...", instrumentGold: "XAUUSD (Or)", instrumentBitcoin: "BTCUSD (Bitcoin)",
            calculateButton: "Calculer la Taille de Position", resultHeading: "Taille de Position Calculée :",
            resultInitial: "Le résultat apparaîtra ici.", calculating: "Calcul en cours...",
            lotUnitStandard: "Lot(s) Standard", lotUnitMini: "Mini Lot(s)", lotUnitMicro: "Micro Lot(s)", lotUnitSubMicro: "Lot(s) Standard (sub-micro)",
            errorBalancePositive: "Le solde du compte doit être positif.", errorRiskValuePositive: "La valeur du risque doit être positive.",
            errorStopLossPositive: "Le Stop-Loss (pips) doit être positif.", errorInstrumentPipValue: "Valeur du pip manquante/invalide pour l'instrument.",
            errorRiskPercentRange: "Le % de risque ne peut pas dépasser 100%.", errorRiskFixedRange: "Le risque fixe ne peut pas dépasser le solde.",
            errorRiskType: "Type de risque invalide.", errorRiskPerLot: "Risque par lot calculé nul ou négatif.",
            errorResultInvalid: "Calcul a produit une taille invalide.", unknownError: "Une erreur inconnue est survenue.",
            errorSelectInstrument: "Veuillez sélectionner un instrument.",
            ariaLangButton: "Changer la langue", ariaThemeButtonLight: "Activer le mode clair", ariaThemeButtonDark: "Activer le mode sombre"
        }
    };

    // --- State ---
    let currentLang = DEFAULT_LANG;
    let calculationTimeoutId = null;

    // --- DOM Element References ---
    const translatableElements = document.querySelectorAll('[data-translate-key], [data-translate-key-placeholder], [data-translate-key-aria]');
    const form = document.getElementById('calculatorForm');
    const resultBox = document.getElementById('resultBox');
    const themeToggle = document.getElementById('themeToggle');
    const langToggle = document.getElementById('langToggle');
    const accountBalanceInput = document.getElementById('accountBalance');
    const riskTypeSelect = document.getElementById('riskType');
    const riskValueInput = document.getElementById('riskValue');
    const stopLossInput = document.getElementById('stopLoss');
    const instrumentSelect = document.getElementById('instrument');
    const loader = document.getElementById('loader');
    // *** DELETED: splineCanvas reference ***

    // --- Spline Initialization ---
    // *** DELETED: initializeSpline function ***

    // --- Core Logic Functions ---
    // calculatePositionSize, formatPositionSize, displayResult remain the same
    /** Calculates position size. Returns { value: number } or { errorKey: string } */
    function calculatePositionSize(balance, type, riskVal, slPips, instrumentKey) {
        if (isNaN(balance) || balance <= 0) return { errorKey: "errorBalancePositive" };
        if (isNaN(riskVal) || riskVal <= 0) return { errorKey: "errorRiskValuePositive" };
        if (isNaN(slPips) || slPips <= 0) return { errorKey: "errorStopLossPositive" };
        if (!instrumentKey) return { errorKey: "errorSelectInstrument" };

        const instrument = INSTRUMENT_DATA[instrumentKey];
        if (!instrument?.pipValuePerStandardLot || instrument.pipValuePerStandardLot <= 0) {
            return { errorKey: "errorInstrumentPipValue" };
        }

        let riskAmt = 0;
        if (type === 'percentage') {
            if (riskVal > 100) return { errorKey: "errorRiskPercentRange" };
            riskAmt = (balance * riskVal) / 100;
        } else if (type === 'fixed') {
            if (riskVal > balance) return { errorKey: "errorRiskFixedRange" };
            riskAmt = riskVal;
        } else {
            return { errorKey: "errorRiskType" };
        }

        const totalRiskPerLot = slPips * instrument.pipValuePerStandardLot;
        if (totalRiskPerLot <= 0) {
            return { errorKey: "errorRiskPerLot" };
        }

        const sizeLots = riskAmt / totalRiskPerLot;
        if (!isFinite(sizeLots) || sizeLots <= 0) {
            return { errorKey: "errorResultInvalid" };
        }
        return { value: sizeLots };
    }

    /** Formats size, returns value and unit key. @returns {{ value: string, unitKey: string }} */
    function formatPositionSize(sizeLots) {
         if (sizeLots <= 0 || !isFinite(sizeLots)) return { value: '0', unitKey: 'lotUnitStandard' };
         const precision = 4;
         if (sizeLots >= 1) {
             return { value: sizeLots.toFixed(2), unitKey: 'lotUnitStandard' };
         } else if (sizeLots >= 0.1) {
             return { value: (sizeLots / 0.1).toFixed(2), unitKey: 'lotUnitMini' };
         } else if (sizeLots >= 0.01) {
             return { value: (sizeLots / 0.01).toFixed(2), unitKey: 'lotUnitMicro' };
         } else {
             return { value: sizeLots.toFixed(precision), unitKey: 'lotUnitSubMicro' };
         }
    }

    /** Displays result/error message in the result box. */
    function displayResult(resultData) {
         resultBox.innerHTML = '';
         const p = document.createElement('p');
         if (resultData.errorKey) {
             p.className = 'error';
             p.textContent = translate(resultData.errorKey);
         } else if (typeof resultData.value === 'number') {
             const { value, unitKey } = formatPositionSize(resultData.value);
             p.className = 'success';
             const valueText = document.createTextNode(`${value} `);
             const strongUnit = document.createElement('strong');
             strongUnit.textContent = translate(unitKey);
             p.appendChild(valueText);
             p.appendChild(strongUnit);
         } else {
              p.className = 'error';
              p.textContent = translate('unknownError');
              console.error("displayResult received unexpected data:", resultData);
         }
         resultBox.appendChild(p);
    }

    // --- UI & Localization Functions ---
    // translate, applyLanguage, updateRiskValuePlaceholder, updateThemeToggleButtonAria, toggleTheme, loadTheme, loadLanguage remain the same
    /** Gets translation string for a key, with fallback. */
    function translate(key) {
         return translations[currentLang]?.[key]
             || translations[DEFAULT_LANG]?.[key]
             || `MISSING_KEY: ${key}`;
    }

    /** Applies the selected language to the UI elements. */
    function applyLanguage(lang) {
         currentLang = translations[lang] ? lang : DEFAULT_LANG;
         document.documentElement.lang = currentLang;
         localStorage.setItem(LS_LANG_KEY, currentLang);

         translatableElements.forEach(el => {
             const key = el.dataset.translateKey;
             const placeholderKey = el.dataset.translateKeyPlaceholder;
             const ariaKey = el.dataset.translateKeyAria;

             if (key) {
                 if (el.id === 'resultBox' && !resultBox.querySelector('p')) {
                     el.textContent = translate(key);
                 } else if (el.id !== 'resultBox') {
                     if (el.tagName === 'OPTION') {
                          el.textContent = translate(key);
                     } else {
                         el.textContent = translate(key);
                     }
                 }
             }

             if (placeholderKey && el.placeholder !== undefined) {
                 if (el.id === 'riskValue') {
                     updateRiskValuePlaceholder();
                 } else {
                     el.placeholder = translate(placeholderKey);
                 }
             }

              if (ariaKey && el.hasAttribute('aria-label')) {
                  if (el.id === 'themeToggle') {
                       updateThemeToggleButtonAria();
                  } else {
                       el.setAttribute('aria-label', translate(ariaKey));
                  }
              }
         });

         langToggle.textContent = currentLang === 'en' ? 'FR' : 'EN';
         langToggle.setAttribute('aria-label', translate('ariaLangButton'));
         langToggle.dataset.lang = currentLang;
         updateThemeToggleButtonAria();
    }

    /** Updates Risk Value placeholder based on type AND language. */
    function updateRiskValuePlaceholder() {
         if (!riskValueInput || !riskTypeSelect) return;
         const key = (riskTypeSelect.value === 'percentage') ? 'placeholderRiskValuePercent' : 'placeholderRiskValueFixed';
         riskValueInput.placeholder = translate(key);
    }

    /** Updates ARIA label for theme toggle based on current theme state and language. */
    function updateThemeToggleButtonAria() {
         if (!themeToggle) return;
         const isDarkMode = document.body.classList.contains('dark-mode');
         const ariaKey = isDarkMode ? 'ariaThemeButtonLight' : 'ariaThemeButtonDark';
         themeToggle.setAttribute('aria-label', translate(ariaKey));
    }

    /** Toggles the theme and updates UI elements. */
    function toggleTheme() {
         document.body.classList.toggle('dark-mode');
         const isDarkMode = document.body.classList.contains('dark-mode');
         localStorage.setItem(LS_THEME_KEY, isDarkMode ? 'dark' : 'light');
         themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
         updateThemeToggleButtonAria();
    }

    /** Loads theme preference from localStorage or system preference. */
    function loadTheme() {
         const savedTheme = localStorage.getItem(LS_THEME_KEY);
         const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
         const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
         if (isDark) {
             document.body.classList.add('dark-mode');
         } else {
             document.body.classList.remove('dark-mode');
         }
         themeToggle.textContent = isDark ? '☀️' : '🌙';
    }

    /** Loads language preference from localStorage or browser settings. */
    function loadLanguage() {
         let lang = localStorage.getItem(LS_LANG_KEY) || navigator.language?.split('-')[0];
         if (!translations[lang]) {
             lang = DEFAULT_LANG;
         }
         applyLanguage(lang);
    }

    // --- Event Handlers ---
    // handleFormSubmit, handleLangToggleClick remain the same
    /** Handles form submission with delay and validation. */
    function handleFormSubmit(event) {
         event.preventDefault();
         if (calculationTimeoutId) clearTimeout(calculationTimeoutId);

         loader.style.display = 'flex';
         resultBox.innerHTML = `<p>${translate('calculating')}</p>`;

         calculationTimeoutId = setTimeout(() => {
             try {
                 const balance = parseFloat(accountBalanceInput.value);
                 const type = riskTypeSelect.value;
                 const riskVal = parseFloat(riskValueInput.value);
                 const slPips = parseFloat(stopLossInput.value);
                 const instrumentKey = instrumentSelect.value;

                 const result = calculatePositionSize(balance, type, riskVal, slPips, instrumentKey);
                 displayResult(result);

             } catch (error) {
                 console.error("Calculation Error:", error);
                 displayResult({ errorKey: "unknownError" });
             } finally {
                 loader.style.display = 'none';
                 calculationTimeoutId = null;
             }
         }, CALCULATION_DELAY);
    }

    /** Handles language toggle click. */
    function handleLangToggleClick() {
         const newLang = currentLang === 'en' ? 'fr' : 'en';
         applyLanguage(newLang);
         if (!resultBox.querySelector('p.success') && !resultBox.querySelector('p.error')) {
             resultBox.textContent = translate('resultInitial');
         }
         updateRiskValuePlaceholder();
    }


    // --- Initialization ---
    function initializeApp() {
        // Check essential calculator elements
        const essentialElements = [form, resultBox, themeToggle, langToggle, accountBalanceInput, riskTypeSelect, riskValueInput, stopLossInput, instrumentSelect, loader];
        if (essentialElements.some(el => !el)) {
            console.error("Initialization failed: Essential calculator DOM elements missing.");
            // Don't block the whole page load, just log error
            // document.body.innerHTML = "<p style='color: red; text-align: center; padding: 2em;'>Error initializing calculator UI.</p>";
            // return; // Optionally return if calculator is unusable
        } else {
             // Attach Calculator Event Listeners only if elements exist
            form.addEventListener('submit', handleFormSubmit);
            themeToggle.addEventListener('click', toggleTheme);
            langToggle.addEventListener('click', handleLangToggleClick);
            riskTypeSelect.addEventListener('change', updateRiskValuePlaceholder);
        }


        // Load Preferences and Apply Initial State (always attempt this)
        loadTheme();
        loadLanguage();

        // Ensure initial result box text (only if element exists and no result shown)
        if (resultBox && !resultBox.querySelector('p.success') && !resultBox.querySelector('p.error')) {
            resultBox.textContent = translate('resultInitial');
        }

        // Ensure initial placeholder (only if elements exist)
        if(riskValueInput && riskTypeSelect) {
            updateRiskValuePlaceholder();
        }

        // Ensure initial aria label for theme toggle (only if element exists)
         if(themeToggle) {
            updateThemeToggleButtonAria();
         }

        // *** DELETED: Call to initializeSpline() ***

        console.log("Calculator Initialized (Spline Viewer handles its own loading).");
    }

    // Run initialization logic
    initializeApp();

}); // End DOMContentLoaded Listener