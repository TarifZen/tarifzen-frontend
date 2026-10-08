/* ============================================= */
/* 1. COLORATION DU TABLEAU PICKUP              */
/* ============================================= */
function colorizePickupTable() {
  const pickupCells = document.querySelectorAll('.conteneur-pickup .pk-j1, .conteneur-pickup .pk-j7, .conteneur-pickup .pk-to, .conteneur-pickup .pk-pm, .conteneur-pickup .pk-ca');

  pickupCells.forEach(cell => {
    let text = cell.textContent.trim().replace('€', '').replace('%', '').replace('+', '');
    let val = parseFloat(text);

    cell.classList.remove('is-rouge', 'is-green', 'color-neutral');

    if (!isNaN(val)) {
      if (val > 0) cell.classList.add('is-green');
      else if (val < 0) cell.classList.add('is-rouge');
      else cell.classList.add('color-neutral');
    }
  });
}

document.addEventListener('DOMContentLoaded', colorizePickupTable);

/* ============================================= */
/* 2. LOGIQUE MÉTIER & INTERFACE TARIFZEN       */
/* ============================================= */
window.totalInitialActions = window.totalInitialActions || 0;

/**
 * 0. GESTION DU CACHE ET RECONSTRUCTION HISTORIQUE
 */
function getProcessedItems() {
    return JSON.parse(localStorage.getItem('processed_recos_final') || '[]');
}
function updateHistoricCounter(totalRecommendations = null) {

    const counterEl =
        document.getElementById('count-historic');

    if (!counterEl) {
        return;
    }

    if (totalRecommendations !== null) {
        window.totalRecommendationsToday =
            Number(totalRecommendations) || 0;
    }

    const total =
        window.totalRecommendationsToday || 0;

    const treatedCount =
        getProcessedItems().length;

    counterEl.textContent =
        `${treatedCount} / ${total}`;
}
function getDismissedItems() {
    return JSON.parse(localStorage.getItem('dismissed_recos') || '[]');
}

function markAsProcessed(id, data) {
    if (!id) return;
    let processed = getProcessedItems();
    const exists = processed.find(item => item.id === id);
    if (!exists) {
        processed.push({ id: id, data: data });
        localStorage.setItem('processed_recos_final', JSON.stringify(processed));
    }
}

function markAsDismissed(id) {
    if (!id) return;
    let dismissed = getDismissedItems();
    if (!dismissed.includes(id)) {
        dismissed.push(id);
        localStorage.setItem('dismissed_recos', JSON.stringify(dismissed));
    }
}

function rebuildHistory() {

    const processed = getProcessedItems();
    const dismissed = getDismissedItems();

    const historyWrapper =
        document.getElementById(
            'conteneur-cartes-historique'
        );

    const modelCard =
        document.querySelector(
            '.div-block-16'
        );

    if (!historyWrapper || !modelCard) {
        return;
    }

    // ==========================================================
    // SUPPRESSION DES MINI-CARTES DÉJÀ GÉNÉRÉES
    // ==========================================================
    const oldGeneratedCards =
        historyWrapper.querySelectorAll(
            '[data-tz-history-generated="true"]'
        );

    oldGeneratedCards.forEach(
        card => card.remove()
    );

    // ==========================================================
    // SUPPRESSION DES RECOMMANDATIONS TRAITÉES
    // ==========================================================
    document
        .querySelectorAll(
            '.collection-item-3, .reco-card-item'
        )
        .forEach(el => {

            const currentId =
                el.querySelector(
                    '#reco-id-champ, input[name="reco-id"]'
                )?.value
                ||
                el.querySelector(
                    '.cms-data-storage'
                )?.getAttribute(
                    'data-webflow-id'
                )
                ||
                el.getAttribute(
                    'data-id'
                );

            if (
                currentId &&
                (
                    processed.find(
                        item => item.id === currentId
                    )
                    ||
                    dismissed.includes(
                        currentId
                    )
                )
            ) {
                el.remove();
            }
        });

    // ==========================================================
    // RECONSTRUCTION DES MINI-CARTES
    // ==========================================================
    processed.forEach(item => {

        if (!item || !item.data) {
            return;
        }

        const newMiniCard =
            modelCard.cloneNode(true);

        // Marque uniquement les clones générés
        newMiniCard.setAttribute(
            'data-tz-history-generated',
            'true'
        );

        newMiniCard.style.setProperty(
            'display',
            'flex',
            'important'
        );

        // ======================================================
        // ÉLÉMENTS DE LA MINI-CARTE
        // ======================================================
        const cDate =
            newMiniCard.querySelector(
                '.date-mini-carte'
            );

        const cTitre =
            newMiniCard.querySelector(
                '.titre-action-mini-card'
            );

        const scoreElements =
            newMiniCard.querySelectorAll(
                '.score-rm-mini-card'
            );

        const cInfo =
            newMiniCard.querySelector(
                '.icon-info-mini'
            );

        const badgeRed =
            newMiniCard.querySelector(
                '.badge-score-red-mini-card'
            );

        const badgeOrange =
            newMiniCard.querySelector(
                '.badge-score-orange-mini-card'
            );

        // ======================================================
        // DATE
        // ======================================================
        if (cDate) {
            cDate.textContent =
                item.data.date || '';
        }

        // ======================================================
        // TITRE
        // ======================================================
        if (cTitre) {
            cTitre.textContent =
                item.data.titre || '';
        }

        // ======================================================
        // SCORE RM
        // ======================================================
        scoreElements.forEach(
            el => {

                el.textContent =
                    item.data.score || '0';

                el.style.display = '';
            }
        );

        // ======================================================
        // INFORMATIONS
        // ======================================================
        if (cInfo) {

            cInfo.setAttribute(
                'data-message',
                item.data.message || ''
            );

            cInfo.setAttribute(
                'data-date',
                item.data.dateBrute || ''
            );
        }

        // ======================================================
        // BADGE ROUGE / ORANGE
        // ======================================================
        if (item.data.isAnalyse) {

            if (badgeOrange) {
                badgeOrange.style.setProperty(
                    'display',
                    'flex',
                    'important'
                );
            }

            if (badgeRed) {
                badgeRed.style.setProperty(
                    'display',
                    'none',
                    'important'
                );
            }

        } else {

            if (badgeRed) {
                badgeRed.style.setProperty(
                    'display',
                    'flex',
                    'important'
                );
            }

            if (badgeOrange) {
                badgeOrange.style.setProperty(
                    'display',
                    'none',
                    'important'
                );
            }
        }

        // ======================================================
        // AJOUT À L'HISTORIQUE
        // ======================================================
        historyWrapper.prepend(
            newMiniCard
        );
    });
}
  
/**
 * 1. FONCTIONS DE DATE
 */

// Helper qui applique le Title Case (chaque mot commence par une majuscule) en gérant correctement le mois d'Août
function formatTitleCase(str) {
    if (!str) return "";
    let formatted = str.replace(/(?:^|\s)\S/g, L => L.toUpperCase());
    return formatted.replace(/AoûT/g, 'Août').replace(/AouT/g, 'Août');
}

function getStrictDate(dayStr, monthStr) {
    const months = {
        "janvier": 0, "février": 1, "mars": 2, "avril": 3, "mai": 4, "juin": 5,
        "juillet": 6, "août": 7, "aout": 7, "septembre": 8, "octobre": 9, "novembre": 10, "décembre": 11
    };
    let day = parseInt(dayStr);
    let monthName = monthStr.toLowerCase().trim();
    let month = months[monthName] !== undefined ? months[monthName] : 2; 
    let year = 2026;

    const d = new Date(year, month, day);
    let formatted = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    return formatTitleCase(formatted);
}

function initHeaderDate() {
    const topDateEl = document.getElementById('date-du-jour');
    if (topDateEl) {
        const today = new Date();
        let formattedToday = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        topDateEl.innerText = formatTitleCase(formattedToday);
    }
}

function formatDateFr(str) {
    if (!str || str.trim() === "") return "";
    let cleanStr = str.trim();
    if (/[a-zA-Z]{5,}/.test(cleanStr)) return cleanStr;
    let dateOnly = cleanStr.split(' ')[0];
    const d = new Date(dateOnly);
    if (isNaN(d.getTime()) || d.getFullYear() < 2020) return str; 
    let formatted = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    return formatTitleCase(formatted);
}

function formatPickUpDates() {
    document.querySelectorAll('.text-block-107').forEach(el => {
        let rawText = el.innerText.trim();
        if (rawText && rawText.length > 3) {
            let parsedDate = new Date(rawText);
            if (!isNaN(parsedDate.getTime())) {
                let formatted = parsedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                el.innerText = formatTitleCase(formatted);
            }
        }
    });
}

/** 
 * 2. INITIALISATION DES COMPTEURS HAUT DE PAGE
 */
function initStaticHeader() {
    const items = document.querySelectorAll('.collection-item-3, .reco-card-item');
    let totalP = 0;
    items.forEach(item => {
        totalP += parseFloat(item.getAttribute('data-gain-potentiel')) || 0;
    });
    const potentielEl = document.querySelector('.text-gain-potentiel');
    if (potentielEl) potentielEl.innerText = `+${Math.round(totalP)}€`;
    const nbRecoEl = document.querySelector('.text-nbre-reco');
    if (nbRecoEl) nbRecoEl.innerText = `${items.length} ${items.length > 1 ? 'recommandations aujourd\'hui' : 'recommandation aujourd\'hui'}`;
    setTimeout(() => {
        const reelEl = document.querySelector('[data-gain-reel-source]');
        if (reelEl) {
            const valSource = reelEl.getAttribute('data-gain-reel-source');
            if (valSource && valSource !== "") {
                reelEl.innerText = `${Math.round(parseFloat(valSource))}€`;
            }
        }
    }, 150);
}

/**
 * 3. MISE À JOUR DE L'INTERFACE GLOBALE
 */
function updateStatusCounters() {
    // API03 est la seule source de vérité au chargement des compteurs haut de page.
}

function refreshUI() {
    const modelCard = document.querySelector('.div-block-16');
    if (modelCard && !modelCard.closest('#conteneur-cartes-historique')) {
        modelCard.style.setProperty('display', 'none', 'important');
    }
    document.querySelectorAll('.date-affichage, .date-application, .date-jour, .text-date-applic').forEach(el => {
      let txt = el.innerText.trim();
        if (txt.toLowerCase().includes('appliqué le')) {
            let parts = txt.split(':');
            let datePart = parts.length > 1 ? parts[1].trim() : "";
            if (datePart) el.innerText = "Appliqué le : " + formatDateFr(datePart);
        } else if (txt.length > 1) {
            el.innerText = formatDateFr(txt);
        }
    });
    const items = document.querySelectorAll('.collection-item-3, .reco-card-item');
    items.forEach((item, i) => {
        if (window.innerWidth <= 767) {
            item.style.display = (i === 0) ? 'block' : 'none';
        } else {
            item.style.display = (i < 5) ? 'block' : 'none';
        }
        const priorityAttr = (item.getAttribute('data-priorite') || item.getAttribute('data-status') || "").toLowerCase();
        const bO = item.querySelector('.bottom-orange, .bandeau-orange, #bottom-orange'), bR = item.querySelector('.bottom-red, .bottom-rouge, .bandeau-rouge, #bottom-rouge');
        if (priorityAttr.includes("analyse")) {
            if (bO) bO.style.display = 'block'; if (bR) bR.style.display = 'none';
        } else {
            if (bR) bR.style.display = 'block'; if (bO) bO.style.display = 'none';
        }
        item.querySelectorAll('.date-main-card, .div-block-17, .text-date-carte, .text-date-bottom, .reco-date, .reco-date-bottom').forEach(el => {
            let txt = el.innerText.trim();
            if (txt.length > 1) el.innerText = formatDateFr(txt);
        });
        const dateBottom = item.querySelector('.text-date-bottom, .reco-date-bottom');
        if (dateBottom) {
            dateBottom.style.setProperty('display', (i === 0) ? 'none' : 'block', 'important');
        }
        const badge = item.querySelector('.text-block-73');
        if (badge) badge.style.setProperty('display', (i === 0) ? 'none' : 'block', 'important');
    });
}

/**
 * 4. TRANSFERT VERS HISTORIQUE ET ENREGISTREMENT ACTION V2
 */
async function sendData(triggerElement, statutValue) {
  console.log('🟢 sendData appelée', triggerElement, statutValue);

  const card = triggerElement.closest('.reco-card-item, .collection-item-3');
  if (!card) return;

  // ============================================================
  // RÉCUPÉRATION DE L'UUID DE LA RECOMMANDATION
  // ============================================================
  const recoIdInput = card.querySelector(
    '#reco-id-champ, input[name="reco-id"]'
  );

  const recoId = recoIdInput?.value?.trim() || '';

  if (!recoId) {
    console.error('❌ recommendation_id introuvable dans la carte.');
    return;
  }

  // ============================================================
  // COMPTEUR
  // ============================================================
  const statusType = card.getAttribute('data-status') || 'urgent';

  const counterEl = document.querySelector(
    statusType === 'analyse'
      ? '#count-analyse'
      : '#count-urgent'
  );

  const previousText = counterEl
    ? counterEl.textContent
    : null;

  if (counterEl) {
    const currentCount =
      parseInt(counterEl.textContent, 10) || 0;

    counterEl.textContent =
      Math.max(0, currentCount - 1);
  }

  // ============================================================
  // ÉTAT VISUEL PENDANT L'ENVOI
  // ============================================================
  card.style.pointerEvents = 'none';
 
  // ============================================================
  // PAYLOAD V2
  // ============================================================
  const appliedPriceInput =
  card.querySelector('.input-nouveau-prix');

let appliedPriceChange = null;

if (appliedPriceInput) {

  const rawValue =
    appliedPriceInput.value
      ?.trim()
      .replace(',', '.')
      .replace(/^\+/, '');

  if (rawValue !== '') {

    const parsedValue =
      Number(rawValue);

    if (Number.isFinite(parsedValue)) {
      appliedPriceChange = parsedValue;
    }

  }

}
  
  const payload = {
  recommendation_id: recoId,
  action: statutValue,
  application_method: 'CUSTOM'
};

if (appliedPriceChange !== null) {
  payload.applied_price_change =
    appliedPriceChange;
}

  console.log('📤 Envoi action V2 :', payload);

  try {

    // ==========================================================
    // API V2 — ENREGISTREMENT DANS recommendation_actions
    // ==========================================================
    const response = await fetch(
      'https://tarifzen-backend.onrender.com/api/recommendation-actions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    console.log('📥 Réponse API action V2 :', result);

    if (!response.ok || !result.success) {
      throw new Error(
        result?.error?.message ||
        `Erreur serveur : ${response.status}`
      );
    }

  // ==========================================================
// HISTORIQUE LOCAL — ACTION APPLIED
// ==========================================================
if (statutValue === 'APPLIED') {

  const sDate =
    card.querySelector(
      '.reco-date, .date-main-card'
    )?.textContent || '';

  const scoreElement =
    card.querySelector('#reco-score-rm');

  const sScore =
    scoreElement?.textContent?.trim() || '';

  console.log('🟠/🔴 SCORE HISTORIQUE', {
    statusType,
    scoreElement,
    sScore,
    card
  });

  const isAnalyse =
    statusType === 'analyse';

  const sourceInfoBtn =
    card.querySelector(
      '.icon-info-carte, .info-trigger, .info, [data-message]'
    );

  const sMessage =
    sourceInfoBtn?.getAttribute('data-message') ||
    card.querySelector(
      '.reco-long-message'
    )?.textContent ||
    '';

  const sDateBrute =
    sourceInfoBtn?.getAttribute('data-date') ||
    sDate;

  const processedData = {
    titre:
      card.querySelector(
        '#titre-action'
      )?.textContent?.trim() ||
      'Action',

    date: formatDateFr(sDate),

    score: sScore || '0',

    isAnalyse: isAnalyse,

    message: sMessage,

    dateBrute: sDateBrute
  };
  
     // ----------------------------------------------------------
  // 1. ENREGISTREMENT LOCAL
  // ----------------------------------------------------------
  markAsProcessed(recoId, processedData);
updateHistoricCounter();
  // ----------------------------------------------------------
  // 2. ANIMATION DE LA CARTE VERS LA DROITE
  // ----------------------------------------------------------
  card.style.position = 'relative';
  card.style.zIndex = '10';

  const animation = card.animate(
    [
      {
        opacity: 1,
        right: '0px'
      },
      {
        opacity: 0,
        right: '-350px'
      }
    ],
    {
      duration: 700,
      easing: 'ease-in-out',
      fill: 'forwards'
    }
  );

  // ----------------------------------------------------------
  // 3. APRÈS L'ANIMATION → MINI-CARTE
  // ----------------------------------------------------------
  animation.onfinish = () => {

    card.remove();

    // Reconstruit la colonne "Actions traitées"
    // à partir de processed_recos_final
    rebuildHistory();
  };

} else {

    // ========================================================
  // HISTORIQUE LOCAL — ACTION IGNORED
  // ========================================================
  markAsDismissed(recoId);

  // ========================================================
  // ANIMATION DE FERMETURE VERS LE HAUT
  // ========================================================
  animateRecoCardClose(card);
}

} catch (error) {

  console.error(
    '❌ Échec de l\'enregistrement de l\'action V2 :',
    error
  );

  // ==========================================================
  // RESTAURATION DU COMPTEUR
  // ==========================================================
  if (
    counterEl &&
    previousText !== null
  ) {
    counterEl.textContent =
      previousText;
  }

  // ==========================================================
  // RESTAURATION DE LA CARTE
  // ==========================================================
  card.style.pointerEvents = '';
  card.style.transform = '';
  card.style.opacity = '';
  card.style.position = '';
  card.style.right = '';
  card.style.zIndex = '';
  }
}
  /**
 * 5. DRAG DE LA BULLE POP-UP
 */
function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (!elmnt) return;
    elmnt.style.cursor = 'grab';
    elmnt.onmousedown = function(e) {
        if (e.target.closest('.close-reco') || e.target.tagName === "INPUT") return;
        pos3 = e.clientX; pos4 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (e) => {
            pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
            pos3 = e.clientX; pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        };
    };
}

/**
 * 6. SCRIPT DE COMPARAISON DE PRIX RMS (ROUGE / VERT)
 */
function applyRmsPricingColors() {
    const dynItems = document.querySelectorAll('.w-dyn-item');
    
    dynItems.forEach(item => {
        const monPrixElement = item.querySelector('[data-mon-prix]');
        const medianeElement = item.querySelector('[data-prix-median]');
        
        if (monPrixElement && medianeElement) {
            const monPrix = parseInt(monPrixElement.textContent.replace(/[^0-9]/g, ''), 10);
            const prixMedian = parseInt(medianeElement.textContent.replace(/[^0-9]/g, ''), 10);
            
            if (!isNaN(monPrix) && !isNaN(prixMedian)) {
                monPrixElement.classList.remove('is-green', 'is-rouge');
                
                if (monPrix < prixMedian) {
                    monPrixElement.classList.add('is-rouge');
                } else if (monPrix > prixMedian) {
                    monPrixElement.classList.add('is-green');
                }
            }
        }
    });
}

/**
 * 7. MISE EN FORME UNIQUE ET DYNAMIQUE DU TABLEAU DE PICK-UP
 */
function formatPickUpTable() {
    document.querySelectorAll('.pk-j1, .pk-j7, .pk-to').forEach(el => {
        let val = parseFloat(el.textContent.trim());
        if (!isNaN(val)) {
            let displayValue = val;
            if (el.classList.contains('pk-to')) {
                displayValue = val + "%";
            }

            if (val > 0) {
                el.textContent = "+" + displayValue;
                el.classList.add('color-positive');
            } else if (val < 0) {
                el.textContent = displayValue; 
                el.classList.add('color-negative');
            } else {
                el.textContent = displayValue;
                el.classList.add('color-neutral');
            }
        }
    });

    document.querySelectorAll('.pk-pm, .pk-ca').forEach(el => {
        let text = el.textContent.trim();
        let val = parseFloat(text.replace(/[^0-9.-]/g, '')); 

        if (!isNaN(val)) {
            el.textContent = val + "€";
            el.classList.remove('color-positive', 'color-negative', 'color-neutral');

            if (val > 0) {
                el.classList.add('color-positive');
            } else if (val < 0) {
                el.classList.add('color-negative');
            } else {
                el.classList.add('color-neutral');
            }
        }
    });
}

/**
 * 8. MISE À JOUR DYNAMIQUE DU TEXT BLOCK SUR LE MOIS DE N-1
 */
function initPreviousYearText() {
    const targetEl = document.getElementById('date-n-moins-1');
    if (targetEl) {
        const today = new Date();
        const previousYearDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        let formatted = previousYearDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        targetEl.innerText = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
}
/**
 * 9. ANIMATION FERMETURE CARTE RECOMMANDATION
 */
function animateRecoCardClose(card) {
    if (!card) return;

    // Évite de lancer l'animation plusieurs fois
    if (card.dataset.closing === 'true') return;

    card.dataset.closing = 'true';

    // Permet de déplacer réellement la carte vers le haut
    card.style.position = 'relative';
    card.style.zIndex = '10';

    // Animation : la carte monte de 200px
    // tout en disparaissant progressivement
    const animation = card.animate(
        [
            {
                opacity: 1,
                top: '0px'
            },
            {
                opacity: 0,
                top: '-200px'
            }
        ],
        {
            duration: 700,
            easing: 'ease-in-out',
            fill: 'forwards'
        }
    );

    // Suppression uniquement après l'animation
    animation.onfinish = () => {
        card.remove();
    };
}
/**
 * =============================================
 * Lancement Global (DOM READY)
 * =============================================
 */
document.addEventListener('DOMContentLoaded', () => {
    rebuildHistory();

    const initialItems = document.querySelectorAll('.reco-card-item, .collection-item-3').length;
    const initialHistory = document.querySelectorAll('#conteneur-cartes-historique .div-block-16').length;
    window.totalInitialActions = initialItems + initialHistory;
    
    initStaticHeader(); 
    initHeaderDate(); 
    initPreviousYearText();
    refreshUI();
    
    applyRmsPricingColors();
    formatPickUpTable();
    formatPickUpDates(); 
    
    const bulle = document.getElementById('ma-bulle'), overlay = document.getElementById('mon-overlay');
    if (bulle) makeDraggable(bulle);
    
    // GESTION DES CLICS
    document.addEventListener('click', (e) => {

        // ============================================================
        // 1. BOUTONS INFO / BULLE
        // ============================================================
        const infoBtn = e.target.closest(
            '.icon-info-carte, .info-trigger, #cible-info, .icon-info-mini, .info'
        );
        
        if (infoBtn) {
            const parentItem = infoBtn.closest(
                '.reco-card-item, .collection-item-3, .div-block-16, .calendrier-case, .calendrier-case-1'
            );

let message = '';

if (parentItem) {

    // Carte reco API02
    message =
        parentItem.getAttribute('data-popup-message') || '';

    // Mini-carte historique
    if (!message) {
        const hiddenField =
            parentItem.querySelector(
                '.hide, .reco-long-message'
            );

        if (hiddenField) {
            message =
                hiddenField.innerText ||
                hiddenField.textContent;
        }
    }
}

            if (!message && parentItem) {
                const hiddenField =
                    parentItem.querySelector('.hide, .reco-long-message');

                if (hiddenField) {
                    message =
                        hiddenField.innerText ||
                        hiddenField.textContent;
                }
            }

let finalDate = '';

if (parentItem) {
    const rawPopupDate =
        parentItem.getAttribute('data-popup-date') || '';

    if (rawPopupDate) {
        finalDate = formatDateFr(rawPopupDate);
    }
}
        
          

            const popDate =
                document.getElementById('text-date-pop-up');

            const popMsg =
                document.getElementById('info-text');

            if (popDate) {
                popDate.innerText = finalDate;
            }

            if (popMsg) {
                popMsg.innerText =
                    (message && message.trim() !== "")
                        ? message
                        : "Détails de l'analyse non disponibles.";
            }

            if (bulle) { 
                $(bulle)
                    .fadeIn()
                    .css('display', 'flex');

                if (overlay) {
                    $(overlay).fadeIn();
                }
            }
        }


        // ============================================================
        // 2. CHECKBOX WEBFLOW — TRAITÉE
        // ============================================================
        if (e.target.matches('input[type="checkbox"]')) {

    const recoCard =
        e.target.closest('.reco-card-item');

    if (recoCard) {

        const visualCheckbox =
            recoCard.querySelector('.w-checkbox-input');

        if (visualCheckbox) {
            visualCheckbox.classList.add(
                'w--redirected-checked'
            );
        }

        setTimeout(() => {
            sendData(e.target, 'APPLIED');
        }, 50);
    }

    return;
}


        // ============================================================
        // 3. BOUTONS D'ACTION WEBHOOK MAKE
        // ============================================================
        const targetBtn = e.target.closest(
            '.btn-valider, .btn-refuser, .btn-traiter, .btn-fermer, [data-action="vrai"], [data-action="faux"], .close-reco'
        );

        if (targetBtn) {

            // ========================================================
            // CARTE DE RECOMMANDATION
            // ========================================================
            const recoCard =
                targetBtn.closest('.reco-card-item');

            if (recoCard) {

                // ----------------------------------------------------
                // FERMETURE DE LA CARTE
                // ----------------------------------------------------
                if (
                    targetBtn.matches(
                        '.close-reco, .btn-fermer'
                    )
                ) {
                    sendData(
                        targetBtn,
                        'IGNORED'
                    );

                    return;
                }


                // ----------------------------------------------------
                // ACTIONS DE LA CARTE
                // ----------------------------------------------------
                e.preventDefault();

                if (
                    targetBtn.matches(
                        '.btn-valider, .btn-traiter, [data-action="vrai"]'
                    )
                ) {
                    sendData(
                        targetBtn,
                        'APPLIED'
                    );

                } else {
                    sendData(
                        targetBtn,
                        'IGNORED'
                    );
                }

                return;
            }
        }

    }); // fermeture du document.addEventListener('click', ...)
// ============================================================
// CALENDRIER
// ============================================================
function updateCalendarVisuals() {

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonthIndex = today.getMonth();

    const monthNames = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre"
    ];

    document.querySelectorAll('.w-tab-pane').forEach(pane => {

        const tabId = pane.getAttribute('data-w-tab');

        const tabLink = document.querySelector(
            `.tabs-menu-5 a[data-w-tab="${tabId}"]`
        );

        const paneMonthName = tabLink
            ? tabLink.innerText.trim().toLowerCase()
            : "";

        const paneMonthIndex =
            monthNames.indexOf(paneMonthName);

        pane.querySelectorAll(
            '.calendrier-case, .calendrier-case-1'
        ).forEach(item => {

            const dayEl =
                item.querySelector('.text-block-35') ||
                item.querySelector('.text-4');

            if (!dayEl) return;

            const dayValue =
                parseInt(dayEl.innerText.trim());

            const pastOverlay =
                item.querySelector('.past-days');

            const dayCircle =
                item.querySelector('.pastille-jour-j');

            if (!isNaN(dayValue)) {

                // ------------------------------------------------
                // JOURS PASSÉS
                // ------------------------------------------------
                if (pastOverlay) {

                    if (
                        paneMonthIndex <
                        currentMonthIndex
                    ) {

                        pastOverlay.style.setProperty(
                            'display',
                            'block',
                            'important'
                        );

                    } else if (
                        paneMonthIndex ===
                        currentMonthIndex
                    ) {

                        pastOverlay.style.setProperty(
                            'display',
                            dayValue < currentDay
                                ? 'block'
                                : 'none',
                            'important'
                        );

                    } else {

                        pastOverlay.style.setProperty(
                            'display',
                            'none',
                            'important'
                        );
                    }
                }

                // ------------------------------------------------
                // JOUR ACTUEL
                // ------------------------------------------------
                if (dayCircle) {

                    if (
                        paneMonthIndex ===
                            currentMonthIndex &&
                        dayValue === currentDay
                    ) {

                        dayCircle.classList.add(
                            'is-active'
                        );

                        dayCircle.style.setProperty(
                            'display',
                            'flex',
                            'important'
                        );

                    } else {

                        dayCircle.classList.remove(
                            'is-active'
                        );

                        dayCircle.style.setProperty(
                            'display',
                            'none',
                            'important'
                        );
                    }
                }
            }
        });
    });
}


function autoSelectCurrentMonth() {

    const monthNames = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre"
    ];

    const currentMonthName =
        monthNames[new Date().getMonth()];

    const tabs =
        document.querySelectorAll('.tabs-menu-5 a');

    let tabFound = false;

    tabs.forEach(tab => {

        const tabText =
            tab.innerText.trim().toLowerCase();

        if (tabText === currentMonthName) {

            tabFound = true;

            if (!tab.classList.contains('w--current')) {
                tab.click();
            }
        }
    });

    if (!tabFound && tabs.length === 0) {
        setTimeout(
            autoSelectCurrentMonth,
            300
        );
    }
}


setTimeout(() => {

    autoSelectCurrentMonth();
    updateCalendarVisuals();

}, 200);


$('.tabs-menu-5 a').on('click', function() {
    setTimeout(
        updateCalendarVisuals,
        150
    );
});

}); // fermeture du document.addEventListener('DOMContentLoaded', ...)


/**
 * FORMULAIRE AJOUT ÉVÉNEMENT COMPLÉMENTAIRE
 */
(function($) {
    $(document).ready(function() {
        window.tarifZenInit = true;

        $(document).off('submit', '#email-form-2').on('submit', '#email-form-2', function(e) {
            e.preventDefault();
            const $form =$(this);
            const $btn =$form.find('input[type="submit"], button');
            const webhookUrl = $form.attr('data-action');

            $btn.val("Enregistré !").text("Enregistré !").css('opacity', '0.5').prop('disabled', true);

            const data = {
                "Nom_evenement": $form.find('[name="Nom_evenement"]').val(),
                "Date_Debut": $form.find('[name="Date_Debut"]').val(),
                "Date_Fin": $form.find('[name="Date_Fin"]').val(),
                "Impact": $form.find('input[name="Impact"]:checked').val()
            };

            $.ajax({
                url: webhookUrl,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                complete: function() {
                    // Fin propre de l'exécution Ajax
                }
            });
        });
    });
})(jQuery);

/* ============================================= */
/* 3. INTEGRATION API02 & API03 (SUPABASE)       */
/* ============================================= */
(function() {
// ============================================================
// CONFIGURATION & CONSTANTES
// ============================================================
const API_BASE_URL = 'https://tarifzen-backend.onrender.com';
const SUPABASE_URL = 'https://yjwvhgejsnhpeuvfzdfm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlqd3ZoZ2Vqc25ocGV1dmZ6ZGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNzEyOTQsImV4cCI6MjEwMDc0NzI5NH0.MbGYqHr4zmtrHfhIzVioLSNfJHNPggu6P6YiWdT_Osg';

if (!window.supabaseClient) {
window.supabaseClient = supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);
}
const supabaseClient = window.supabaseClient;

// ============================================================
// FONCTIONS DE FORMATAGE FRONTEND
// ============================================================
function formatFrenchNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return Math.round(num).toLocaleString('fr-FR').replace(/\s/g, ' ');
}

function formatGainPotential(val) {
  if (val === null || val === undefined || isNaN(val)) return "0 €";

  const rounded = Math.round(val);
  const formatted = Math.abs(rounded).toString();

  if (rounded > 0) return `+${formatted} €`;
  if (rounded < 0) return `-${formatted} €`;

  return "0 €";
}

function formatGainReal(val) {
  if (val === null || val === undefined || isNaN(val)) return "- €";
  return `${formatFrenchNumber(val)} €`;
}

function formatPrice(val) {
  if (val === null || val === undefined || isNaN(val)) return "- €";
  return `${formatFrenchNumber(val)} €`;
}

function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return "0 %";
  return `${Math.round(val)} %`;
}

function formatUrgentActions(count) {
  const n = count || 0;
  return `${n} action${n > 1 ? 's' : ''} urgente${n > 1 ? 's' : ''}`;
}

function formatAnalysisActions(count) {
  const n = count || 0;
  return `${n} analyse${n > 1 ? 's' : ''}`;
}

function formatRecommendationsTotal(count) {
  const n = count || 0;
  return `${n} recommandation${n > 1 ? 's' : ''} aujourd'hui`;
}

function formatProfitability(val) {
  if (val === null || val === undefined || isNaN(val)) return "-";

  if (val >= 0) {
    return "TarifZen rentabilisé ";
  }

  const remaining = formatFrenchNumber(Math.abs(val));
  return `Encore ${remaining} € pour rentabiliser`;
}

function formatDateFR(dateStr) {
  if (!dateStr) return '';

  const d = new Date(dateStr);

  if (isNaN(d.getTime())) return dateStr;

  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatRestrictionCode(code) {
  if (!code) return '';

  const cleanCode = String(code).trim();

  if (cleanCode === 'MIN_STAY_2') {
    return 'Minimum Stay 2 nuits conseillé';
  }

  if (cleanCode === 'MIN_STAY_2_OR_CTA') {
    return 'Minimum Stay 2 nuits ou fermeture aux arrivées conseillée';
  }

  if (cleanCode === 'MIN_STAY_2_OPTIONAL') {
    return 'Minimum Stay 2 nuits optionnel';
  }

  if (cleanCode === 'CTA') {
    return 'Fermeture aux arrivées conseillée';
  }

  return cleanCode;
}

// ============================================================
// API02 — FORMATAGE DU MESSAGE COURT
// ============================================================
function formatShortMessage(message) {
  if (!message) return '';

  let formattedMessage = String(message);

  // ============================================================
  // 1. MONTANT DE L'AUGMENTATION
  //
  // Exemple backend :
  // "Augmentation de 16.56 € préconisée."
  //
  // Affichage :
  // "+17€" → vert + semi-bold
  // ============================================================
  formattedMessage = formattedMessage.replace(
    /(augmentation\s+de\s+)([+-]?\d+(?:[.,]\d+)?)\s*€/gi,
    (match, prefix, value) => {

      const number = parseFloat(
        String(value).replace(',', '.')
      );

      if (isNaN(number)) return match;

      const rounded = Math.round(number);

      if (number > 0) {
        return `${prefix}<span style="color:#27ae60;font-weight:600;">+${Math.abs(rounded)}€</span>`;
      }

      if (number < 0) {
        return `${prefix}<span style="color:#e74c3c;font-weight:600;">-${Math.abs(rounded)}€</span>`;
      }

      return `${prefix}<span style="font-weight:600;">0€</span>`;
    }
  );


  // ============================================================
  // 2. TARIF CIBLE
  //
  // Exemple backend :
  // "Tarif cible : 112.7 €."
  //
  // Affichage :
  // "113€" → noir + semi-bold
  // Aucun "+"
  // Aucune couleur
  //
  // "Tarif cible : 113€" reste solidaire
  // ============================================================
  formattedMessage = formattedMessage.replace(
    /(tarif\s+cible\s*:\s*)([+-]?\d+(?:[.,]\d+)?)\s*€/gi,
    (match, prefix, value) => {

      const number = parseFloat(
        String(value).replace(',', '.')
      );

      if (isNaN(number)) return match;

      const rounded = Math.round(number);

      return `<span style="white-space:nowrap;">${prefix}<span style="font-weight:600;">${Math.abs(rounded)}€</span></span>`;
    }
  );

  // ============================================================
  // 3. AUTRES MONTANTS EN €
  //
  // Exemple :
  // "+5€" → vert
  // "-5€" → rouge
  // ============================================================
  formattedMessage = formattedMessage.replace(
    /([+-]\d+(?:[.,]\d+)?)\s*€/g,
    (match, value) => {

      const number = parseFloat(
        String(value).replace(',', '.')
      );

      if (isNaN(number)) return match;

      const rounded = Math.round(number);

      if (number > 0) {
        return `<span style="color:#27ae60;font-weight:600;">+${Math.abs(rounded)}€</span>`;
      }

      if (number < 0) {
        return `<span style="color:#e74c3c;font-weight:600;">-${Math.abs(rounded)}€</span>`;
      }

      return `<span style="font-weight:600;">0€</span>`;
    }
  );

  // ============================================================
  // 4. PICK-UP EN CHAMBRES
  //
  // "+6 chambres vendues" → bloc insécable
  // "+6" → vert + semi-bold
  // "-3" → rouge + semi-bold
  // ============================================================
  formattedMessage = formattedMessage.replace(
    /([+-]\d+)(\s+chambres?\s+vendues?)/gi,
    (match, value, label) => {

      const number = parseInt(value, 10);

      if (isNaN(number)) return match;

      // Positif
      if (number > 0) {
        return `<span style="white-space:nowrap;"><span style="color:#27ae60;font-weight:600;">+${number}</span>${label}</span>`;
      }

      // Négatif
      if (number < 0) {
        return `<span style="white-space:nowrap;"><span style="color:#e74c3c;font-weight:600;">${number}</span>${label}</span>`;
      }

      return match;
    }
  );

  // ============================================================
  // 5. RETOURS À LA LIGNE
  //
  // Chaque information commence sur sa propre ligne.
  // On utilise un bloc simple sans white-space: nowrap
  // afin de rester contenu dans la carte Webflow.
  // ============================================================

  formattedMessage = formattedMessage
    .split(/(?:<br\s*\/?>\s*)+/gi)
    .map(line => `<div>${line}</div>`)
    .join('');

  return formattedMessage;
}

// ============================================================
// API02 — RENDU MULTI-CARTES DES RECOMMANDATIONS
// ============================================================
function renderRecommandations(data) {
  const container = document.querySelector('#recommandations-container');
  const template = document.querySelector('#recommandation-template');
  if (!container || !template) return;

  // Le template reste caché : il sert uniquement de modèle
  template.style.display = 'none';

  // ============================================================
  // RÉCUPÉRATION DES RECOMMANDATIONS DÉJÀ TRAITÉES / IGNORÉES
  // ============================================================
  const rawProcessed = getProcessedItems() || [];
  const rawDismissed = getDismissedItems() || [];

  const processedIds = rawProcessed.map(item =>
    typeof item === 'object' && item !== null
      ? (item.id || item.recommendation_id)
      : item
  );

  const dismissedIds = rawDismissed.map(item =>
    typeof item === 'object' && item !== null
      ? (item.id || item.recommendation_id)
      : item
  );

  // ============================================================
  // FILTRAGE DES RECOMMANDATIONS VISIBLES
  // ============================================================
  const visibleData = (data || []).filter(item => {
    const id = item.recommendation_id || item.row_id || item.id;
    return !processedIds.includes(id) && !dismissedIds.includes(id);
  });

  // Supprime uniquement les cartes générées précédemment
  container.querySelectorAll('.reco-card-item').forEach(el => el.remove());

  // ============================================================
  // CRÉATION DES CARTES
  // ============================================================
  visibleData.forEach(item => {
    const newCard = template.cloneNode(true);

    // Le clone ne doit plus avoir l'ID du template
    newCard.removeAttribute('id');

    // Classe permettant d'identifier les cartes générées
    newCard.classList.add('reco-card-item');

    // Affichage du clone
    newCard.style.display = '';

    // ============================================================
    // DÉTERMINATION URGENT / ANALYSE
    // ============================================================
    const isAnalyse =
      Number(item.priority) >= 6 ||
      item.action_type === 'ANALYSE';

    newCard.setAttribute(
      'data-status',
      isAnalyse ? 'analyse' : 'urgent'
    );

    newCard.setAttribute(
      'data-priorite',
      isAnalyse ? 'analyse' : 'urgent'
    );

    const recoId =
      item.recommendation_id ||
      item.row_id ||
      item.id ||
      '';

    newCard.setAttribute('data-id', recoId);
    
// ============================================================
// DONNÉES POPUP — DATE + MESSAGE LONG
// ============================================================
newCard.setAttribute(
  'data-popup-date',
  item.date || ''
);

newCard.setAttribute(
  'data-popup-message',
  item.long_message || ''
);

    // ============================================================
    // TITRE
    // ============================================================
    const titleEl = newCard.querySelector(
      '.reco-title, [data-field="title"], #titre-action, .titre-action'
    );

    if (titleEl) {
      titleEl.textContent = item.title || '';
    }

   
// ============================================================
// MESSAGE COURT
// ============================================================
const shortMsgEl = newCard.querySelector(
  '.reco-short-message, [data-field="short_message"], #message-hotelier, .message-hotelier'
);

if (shortMsgEl) {
  shortMsgEl.innerHTML =
    `<span class="reco-short-message-inner">${formatShortMessage(item.short_message)}</span>`;
}

    // ============================================================
    // MESSAGE LONG
    // ============================================================
    const longMsgEl = newCard.querySelector(
      '.reco-long-message, [data-field="long_message"], #info-text, .info-text'
    );

    if (longMsgEl) {
      longMsgEl.textContent = item.long_message || '';
    }

    // ============================================================
    // DATE PRINCIPALE
    // ============================================================
    const dateFormatted = formatDateFR(item.date);

    const dateEl = newCard.querySelector(
      '.reco-date, [data-field="date"], #reco-date'
    );

    if (dateEl) {
      dateEl.textContent = dateFormatted || item.date || '';
    }

    // ============================================================
    // DATE DU BAS DE CARTE
    // ID WEBFLOW : #reco-date-bottom
    // ============================================================
    const dateBottomEl = newCard.querySelector(
      '#reco-date-bottom'
    );

    if (dateBottomEl) {
      dateBottomEl.textContent =
        dateFormatted || item.date || '';

      // L'élément est visible par défaut dans Webflow.
      // On s'assure simplement qu'il reste visible.
      dateBottomEl.style.display = 'block';
    }

    // ============================================================
    // ÉVÉNEMENT
    // LAISSÉ EN PLACE POUR L'INJECTION FUTURE API EVENTS
    // ============================================================
    const eventEl = newCard.querySelector(
      '#reco-event'
    );

    if (eventEl) {
      eventEl.textContent = item.event || '';
    }
// ============================================================
// RESTRICTION
// ID WEBFLOW : #reco-restriction
// ============================================================
const restrEl = newCard.querySelector(
  '#reco-restriction'
);

if (restrEl) {
  restrEl.textContent =
    formatRestrictionCode(item.restriction_code);

  // Webflow masque cet élément par défaut.
  // On l'affiche uniquement lorsqu'une restriction existe.
  if (item.restriction_code) {
    restrEl.style.display = 'block';
  } else {
    restrEl.style.display = 'none';
  }
}


    // ============================================================
    // SCORE RM
    // ID WEBFLOW : #reco-score-rm
    // ============================================================
    const scoreEl = newCard.querySelector(
      '#reco-score-rm'
    );

    if (scoreEl) {
      scoreEl.textContent =
        item.score_rm !== undefined &&
        item.score_rm !== null
          ? item.score_rm
          : '';
    }

// ============================================================
// GAIN POTENTIEL
// ID WEBFLOW : #reco-gain-potentiel
// ============================================================
const gainEl = newCard.querySelector(
  '#reco-gain-potentiel'
);

if (gainEl) {
  if (
    item.gain_potential !== undefined &&
    item.gain_potential !== null
  ) {
    const gainFormatted = formatGainPotential(item.gain_potential);

    // Texte normal + valeur colorée et semi-bold
    gainEl.innerHTML =
      `Gain potentiel : <span class="reco-gain-value">${gainFormatted}</span>`;

    const gainValueEl = gainEl.querySelector('.reco-gain-value');

    if (gainValueEl) {
      if (Number(item.gain_potential) > 0) {
        gainValueEl.style.color = '#27ae60';
      } else if (Number(item.gain_potential) < 0) {
        gainValueEl.style.color = '#e74c3c';
      } else {
        gainValueEl.style.color = '';
      }

      gainValueEl.style.fontWeight = '600';
    }

    // Webflow masque cet élément par défaut.
    gainEl.style.display = 'block';
  } else {
    gainEl.textContent = '';
    gainEl.style.display = 'none';
  }
}
    // ============================================================
    // VARIATION DE PRIX
    // ============================================================
    const priceEl = newCard.querySelector(
      '.reco-price, [data-field="recommended_price_change"]'
    );

    if (priceEl) {
      priceEl.textContent =
        item.recommended_price_change !== undefined &&
        item.recommended_price_change !== null
          ? item.recommended_price_change
          : '';
    }

    // ============================================================
    // ID DE RECOMMANDATION
    // ============================================================
    const idInput = newCard.querySelector(
      '#reco-id-champ, input[name="reco-id"], input[name="reco_id"]'
    );

    if (idInput) {
      idInput.value = recoId;
    }

    // ============================================================
    // STOCKAGE DES IDs
    // ============================================================
    const cmsStorage = newCard.querySelector(
      '.cms-data-storage'
    );

    if (cmsStorage) {
      cmsStorage.setAttribute(
        'data-webflow-id',
        recoId
      );

      cmsStorage.setAttribute(
        'data-excel-id',
        item.excel_id || item.row_id || recoId
      );
    }

    // ============================================================
    // BANDEAUX SCORE RM
    // IDs WEBFLOW :
    // #bandeau-score-rm-rouge
    // #bandeau-score-rm-orange
    // ============================================================
    const bandeauUrgent = newCard.querySelector(
      '#bandeau-score-rm-rouge'
    );

    const bandeauAnalyse = newCard.querySelector(
      '#bandeau-score-rm-orange'
    );

    // On masque d'abord les deux
    if (bandeauUrgent) {
      bandeauUrgent.style.display = 'none';
    }

    if (bandeauAnalyse) {
      bandeauAnalyse.style.display = 'none';
    }

    // ============================================================
    // AFFICHAGE DU BON BANDEAU
    // IMPORTANT :
    // On utilise "block" et non "" car Webflow impose
    // display:none sur les classes des deux bandeaux.
    // ============================================================
    if (isAnalyse) {

      if (bandeauAnalyse) {
        bandeauAnalyse.style.display = 'block';
      }

      newCard.classList.add('is-analyse');
      newCard.classList.remove('is-urgent');

    } else {

      if (bandeauUrgent) {
        bandeauUrgent.style.display = 'block';
      }

      newCard.classList.add('is-urgent');
      newCard.classList.remove('is-analyse');
    }
    
// ============================================================
// BOTTOM ROUGE / ORANGE
// ============================================================
const bottomOrange = newCard.querySelector(
  '.bottom-orange, .bandeau-orange, #bottom-orange'
);

const bottomRed = newCard.querySelector(
  '.bottom-red, .bottom-rouge, .bandeau-rouge, #bottom-rouge'
);

if (isAnalyse) {
  if (bottomOrange) {
    bottomOrange.style.display = 'block';
  }

  if (bottomRed) {
    bottomRed.style.display = 'none';
  }

} else {

  if (bottomOrange) {
    bottomOrange.style.display = 'none';
  }

  if (bottomRed) {
    bottomRed.style.display = 'block';
  }
}

    // ============================================================
    // AJOUT DE LA CARTE AU CONTENEUR
    // ============================================================
    container.appendChild(newCard);
  });
}
// ============================================================
// RESOLUTION EXACTE DU SLUG HOTEL — FOUNDER
// ============================================================
async function getHotelIdFromSlug(urlSlug) {
if (!urlSlug) {
console.error(
" [API03] Aucun slug d'hôtel trouvé dans l'URL."
);
return null;
}
const { data: hotelData, error } =
await supabaseClient
.from('data-store-hotels')
.select('id')
.eq('nom_hotel', urlSlug)
.maybeSingle();
if (error) {
console.error(
" Erreur Supabase lors de la recherche de l'hôtel :",
error.message
);
return null;
}
if (!hotelData) {
console.error(
` Aucun hôtel trouvé dans data-store-hotels avec nom_hotel = "${urlSlug}".`
);
return null;
}
return hotelData.id;
}

// ============================================================
// INITIALISATION ET APPELS API
// ============================================================
async function initDashboard() {
try {
// 1. VERIFICATION SESSION SUPABASE
const {
data: { session },
error: sessionError
} = await supabaseClient.auth.getSession();
if (sessionError || !session) {
console.warn(
" Pas de session active. L'utilisateur n'est pas connecté."
);
return;
}

// 2. RECUPERATION DU PROFIL UTILISATEUR
const {
data: userData,
error: userError
} = await supabaseClient
.from('users')
.select('hotel_id, role')
.eq('auth_user_id', session.user.id)
.single();
if (userError || !userData) {
console.error(
" Impossible de récupérer le profil utilisateur dans public.users :",
userError?.message
);
return;
}

// 3. DETERMINATION DU HOTEL_ID
let targetHotelId = null;

if (userData.role === 'FOUNDER') {
const match =
window.location.pathname.match(/\/hotels\/([^/]+)/);
const urlSlug =
match
? decodeURIComponent(match[1]).trim()
: '';
if (!urlSlug) {
console.error(
" Aucun slug d'hôtel présent dans l'URL actuelle."
);
return;
}
targetHotelId =
await getHotelIdFromSlug(urlSlug);
if (!targetHotelId) {
console.error(
" Échec de la résolution du hotel_id pour le compte FOUNDER."
);
return;
}
} else {
targetHotelId = userData.hotel_id;
if (!targetHotelId) {
console.error(
` Anomalie : L'utilisateur (Rôle: ${userData.role}) n'a aucun 'hotel_id' rattaché dans public.users.`
);
return;
}
}

// TOKEN
const cleanToken =
session.access_token
? String(session.access_token).trim()
: '';
if (!cleanToken) {
console.error(
" Aucun access_token disponible pour appeler le backend."
);
return;
}

const requestHeaders = {
'Accept': 'application/json',
'Authorization': `Bearer ${cleanToken}`
};

// 4. API02 — RECOMMANDATIONS
try {
const response02 = await fetch(
`${API_BASE_URL}/api/reco-engine/today?hotel_id=${encodeURIComponent(targetHotelId)}`,
{
method: 'GET',
headers: requestHeaders
}
);
if (response02.ok) {

  const result02 =
    await response02.json();

  const recommendations =
    result02 && result02.data
      ? result02.data
      : [];

  renderRecommandations(
    recommendations
  );

  updateHistoricCounter(
    result02?.count || recommendations.length
  );
} else {
console.error(
` [API02 - HTTP ${response02.status}] Erreur lors de la récupération des recommandations.`
);
renderRecommandations([]);
}
} catch (err02) {
console.error(
" [API02] Erreur inattendue :",
err02.message
);
renderRecommandations([]);
}

// 5. API03 — DASHBOARD
try {
const response03 = await fetch(
`${API_BASE_URL}/api/v1/dashboard/today?hotel_id=${encodeURIComponent(targetHotelId)}`,
{
method: 'GET',
headers: requestHeaders
}
);
if (response03.status === 401) {
console.error(
" [API03 - HTTP 401] Token d'authentification invalide ou expiré."
);
return;
}
if (response03.status === 403) {
console.error(
" [API03 - HTTP 403] Accès refusé pour cet établissement."
);
return;
}
if (!response03.ok) {
console.error(
` [API03 - HTTP ${response03.status}] Erreur serveur lors de la récupération du Dashboard.`
);
return;
}
const data =
await response03.json();

const elUrgent =
document.getElementById('count-urgent');
if (elUrgent) {
elUrgent.innerText =
formatUrgentActions(data.urgent_actions);
}
const elAnalyse =
document.getElementById('count-analyse');
if (elAnalyse) {
elAnalyse.innerText =
formatAnalysisActions(data.analysis_actions);
}
const elRecosTotal =
document.getElementById('recommendations_total');
if (elRecosTotal) {
elRecosTotal.innerText =
formatRecommendationsTotal(
data.recommendations_total
);
}

const elGainPotentiel =
document.getElementById(
'gain_potential_today'
);
if (elGainPotentiel) {
elGainPotentiel.innerText =
formatGainPotential(
data.gain_potential_today
);
}
const elGainReel =
document.getElementById(
'gain_real_month'
);
if (elGainReel) {
elGainReel.innerText =
formatGainReal(
data.gain_real_month
);
}

const elProfitability =
document.getElementById(
'profitability-month'
);
if (elProfitability) {
elProfitability.innerText =
formatProfitability(
data.profitability
);
}

const elEvents =
document.getElementById(
'events_month'
);
if (elEvents) {
elEvents.innerText =
data.events_text ||
"Aucun événement majeur";
}

const elCurrOcc =
document.getElementById(
'current_occupancy'
);
if (elCurrOcc) {
elCurrOcc.innerText =
formatPercent(
data.current_occupancy
);
}
const elCurrAdr =
document.getElementById(
'current_adr'
);
if (elCurrAdr) {
elCurrAdr.innerText =
formatPrice(
data.current_adr
);
}

const elN1Occ =
document.getElementById(
'n1_occupancy'
);
if (elN1Occ) {
elN1Occ.innerText =
formatPercent(
data.n1_occupancy
);
}
const elN1Adr =
document.getElementById(
'n1_adr'
);
if (elN1Adr) {
elN1Adr.innerText =
formatPrice(
data.n1_adr
);
}

const elSummary =
document.getElementById(
'summary-text'
);
if (
elSummary &&
data.summary &&
data.summary.text
) {
elSummary.innerText =
data.summary.text;
}
} catch (err03) {
console.error(
" [API03] Erreur inattendue :",
err03.message
);
}
} catch (err) {
console.error(
" Erreur globale lors de l'initialisation :",
err.message
);
}
}

// ============================================================
// LANCEMENT AU CHARGEMENT DU DOM
// ============================================================
if (document.readyState === 'loading') {
document.addEventListener(
'DOMContentLoaded',
initDashboard
);
} else {
initDashboard();
}
})();
