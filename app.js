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

function rebuildHistory(newRecoId = null) {

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

const itemId = item.id;

if (newRecoId && itemId === newRecoId) {
    newMiniCard.classList.add(
        'tz-mini-card-enter'
    );
}

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
        console.log(
            '[HISTORIQUE] Texte du message :',
            JSON.stringify(item.data.message)
        );

        console.log(
            '[HISTORIQUE] Longueur du message :',
            item.data.message?.length
        );

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

        console.log(
            '[HISTORIQUE] Attribut data-message de l’icône :',
            cInfo?.getAttribute('data-message')
        );


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
        historyWrapper.prepend(newMiniCard);
      console.log('[TEST] Le bloc d’insertion de la mini-carte est exécuté');

        // DIAGNOSTIC : vérifier l'icône réellement affichée
        const iconeAffichee =
            newMiniCard.querySelector('.icon-info-mini');

        console.log(
            '[HISTORIQUE] Icône après insertion :',
            iconeAffichee
        );

        console.log(
            '[HISTORIQUE] Message après insertion :',
            iconeAffichee?.getAttribute('data-message')
        );

        console.log(
            '[HISTORIQUE] Longueur après insertion :',
            iconeAffichee?.getAttribute('data-message')?.length
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
const dateBottom = item.querySelector(
    '#reco-date-bottom, .text-date-bottom, .reco-date-bottom'
);

if (dateBottom) {
    const firstRecoCard = document.querySelector(
        '.reco-card-item.is-urgent'
    );

    if (item === firstRecoCard) {
        dateBottom.style.setProperty('display', 'none', 'important');
    } else {
        dateBottom.style.setProperty('display', 'block', 'important');
    }
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

  const newCount =
    Math.max(0, currentCount - 1);

  if (newCount === 0) {
    counterEl.textContent =
      statusType === 'analyse'
        ? 'Toutes les analyses sont traitées. Bravo !'
        : 'Toutes les actions urgentes sont traitées. Bravo !';
  } else if (statusType === 'analyse') {
    counterEl.textContent =
      `${newCount} ${newCount === 1 ? 'analyse' : 'analyses'}`;
  } else {
    counterEl.textContent =
      `${newCount} ${newCount === 1 ? 'action urgente' : 'actions urgentes'}`;
  }
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
    application_method: 'CUSTOM',

    // Message détaillé d'origine pour l'historique
    long_message:
      card.getAttribute('data-popup-message') ||
      card.querySelector(
        '.reco-long-message, [data-field="long_message"], #info-text, .info-text'
      )?.textContent?.trim() ||
      ''
  };

  if (appliedPriceChange !== null) {
    payload.applied_price_change = appliedPriceChange;
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
  card.getAttribute('data-popup-message') ||
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
    rebuildHistory(recoId);
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
    const targetEl = document.getElementById('mois-n-1');

    if (targetEl) {
        const today = new Date();

        const previousYearDate = new Date(
            today.getFullYear() - 1,
            today.getMonth(),
            1
        );

        let formatted = previousYearDate.toLocaleDateString(
            'fr-FR',
            {
                month: 'long',
                year: 'numeric'
            }
        );

        targetEl.innerText =
            formatted.charAt(0).toUpperCase() +
            formatted.slice(1);
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
        // 1. BOUTONS INFO / BULLE — CARTES, HISTORIQUE ET CALENDRIER
        // ============================================================
        const infoBtn = e.target.closest(
            '.icon-info-carte, .info-trigger, #cible-info, .icon-info-mini, .info, .icon-info-calendar'
        );

        if (infoBtn) {
            const isCalendarInfo = infoBtn.matches('.icon-info-calendar');

            const parentItem = infoBtn.closest(
                '.reco-card-item, .collection-item-3, .div-block-16, .calendrier-case, .calendrier-case-1, .calendar-date-cell'
            );

            // --------------------------------------------------------
            // MESSAGE : calendrier, cartes de recommandation, historique
            // --------------------------------------------------------
            let message = '';

            if (isCalendarInfo) {
                message =
                    infoBtn.getAttribute('data-message-long') ||
                    parentItem?.getAttribute('data-message-long') ||
                    '';
            } else {
                message =
                    parentItem?.getAttribute('data-popup-message') ||
                    infoBtn.getAttribute('data-message') ||
                    infoBtn.getAttribute('data-message-long') ||
                    parentItem?.getAttribute('data-message-long') ||
                    '';
            }

            // Repli sur un éventuel champ de texte détaillé.
            if (!message && parentItem) {
                const hiddenField = parentItem.querySelector(
                    '.hide, .reco-long-message'
                );

                if (hiddenField) {
                    message =
                        hiddenField.innerText ||
                        hiddenField.textContent ||
                        '';
                }
            }

            
            // --------------------------------------------------------
            // DATE : date du séjour + date de création de la recommandation
            // --------------------------------------------------------
            let finalDate = '';

            if (isCalendarInfo) {
                // Date lisible du séjour.
                finalDate =
                    infoBtn.getAttribute('data-date-readable') ||
                    '';

                // Repli si la date lisible n'est pas renseignée.
                if (!finalDate) {
                    const rawDate =
                        infoBtn.getAttribute('data-date') ||
                        parentItem?.getAttribute('data-calendar-date') ||
                        '';

                    if (rawDate) {
    const formattedDate = formatDateFr(rawDate);

    finalDate = formattedDate.replace(
        /^(\p{L})(\p{L}*)\s+(\d{1,2})(?:er|ᵉʳ)?\s+(\p{L})(\p{L}*)\s+(\d{4})$/u,
        (_, jour1, jourReste, jour, mois1, moisReste, annee) =>
            `${jour1.toUpperCase()}${jourReste} ${jour} ${mois1.toUpperCase()}${moisReste} ${annee}`
    );
}
                }

                // Date de création initiale de la recommandation.
                const createdAt =
                    infoBtn.getAttribute('data-recommendation-created-at') ||
                    '';

                if (createdAt) {
                    const createdDate = new Date(createdAt);

                    if (!Number.isNaN(createdDate.getTime())) {
                        const readableCreatedDate = createdDate
                            .toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                timeZone: 'Europe/Paris'
                            })
                            .replace(/^./, lettre => lettre.toUpperCase())
                            .replace(/(\d+)\s+(\p{L})/u, (_, jour, lettre) =>
                                `${jour} ${lettre.toUpperCase()}`
                            );

                        finalDate +=
                            `${finalDate ? '\n' : ''}Recommandation proposée le ${readableCreatedDate}`;
                    }
                }
            } else {
                // Comportement existant pour les autres cartes.
                const rawPopupDate =
                    parentItem?.getAttribute('data-popup-date') || '';

                if (rawPopupDate) {
    const formattedDate = formatDateFr(rawPopupDate);

    finalDate = formattedDate.replace(
        /^(\p{L})(\p{L}*)\s+(\d{1,2})(?:er|ᵉʳ)?\s+(\p{L})(\p{L}*)\s+(\d{4})$/u,
        (_, jour1, jourReste, jour, mois1, moisReste, annee) =>
            `${jour1.toUpperCase()}${jourReste} ${jour} ${mois1.toUpperCase()}${moisReste} ${annee}`
    );
}

                if (!finalDate) {
    const rawDate =
        infoBtn.getAttribute('data-date') || '';

    if (rawDate) {
        const formattedDate = formatDateFr(rawDate);

        finalDate = formattedDate.replace(
            /^(\p{L})(\p{L}*)\s+(\d{1,2})(?:er|ᵉʳ)?\s+(\p{L})(\p{L}*)\s+(\d{4})$/u,
            (_, jour1, jourReste, jour, mois1, moisReste, annee) =>
                `${jour1.toUpperCase()}${jourReste} ${jour} ${mois1.toUpperCase()}${moisReste} ${annee}`
        );
    }
}
            }

            console.log('[POPUP] Informations sélectionnées :', {
                calendrier: isCalendarInfo,
                date: finalDate,
                messageDisponible: !!message,
                longueurMessage: message.length
            });

            const popDate =
                document.getElementById('text-date-pop-up');

            const popMsg =
                document.getElementById('info-text');

            if (popDate) {
                popDate.innerText = finalDate;
                popDate.style.whiteSpace = 'pre-line';
            }

            if (popMsg) {
                popMsg.innerText =
                    message && message.trim() !== ''
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


/* ============================================================
   CALENDRIER TARIFZEN — GÉNÉRATION AUTOMATIQUE DES DATES
   + Chargement API04 et affichage des recommandations
   ============================================================ */

const CALENDAR_MONTHS = [
    { name: 'janvier', selector: '.janvier-calendar', monthIndex: 0 },
    { name: 'fevrier', selector: '.fevrier-calendar', monthIndex: 1 },
    { name: 'mars', selector: '.mars-calendar', monthIndex: 2 },
    { name: 'avril', selector: '.avril-calendar', monthIndex: 3 },
    { name: 'mai', selector: '.mai-calendar', monthIndex: 4 },
    { name: 'juin', selector: '.juin-calendar', monthIndex: 5 },
    { name: 'juillet', selector: '.juillet-calendar', monthIndex: 6 },
    { name: 'aout', selector: '.aout-calendar', monthIndex: 7 },
    { name: 'septembre', selector: '.septembre-calendar', monthIndex: 8 },
    { name: 'octobre', selector: '.octobre-calendar', monthIndex: 9 },
    { name: 'novembre', selector: '.novembre-calendar', monthIndex: 10 },
    { name: 'decembre', selector: '.decembre-calendar', monthIndex: 11 }
];



// ============================================================
// GÉNÉRATION DES CASES D'UN MOIS
// ============================================================

function generateCalendarMonth(monthConfig, year) {
    const pane = document.querySelector(monthConfig.selector);

    if (!pane) {
        console.warn(`[Calendrier] Onglet introuvable : ${monthConfig.selector}`);
        return;
    }

    const grid = pane.querySelector('.main-calendar-container');

    if (!grid) {
        console.warn(`[Calendrier] Grille introuvable pour ${monthConfig.name}`);
        return;
    }

    const template = grid.querySelector('.calendrier-case-1');

    if (!template) {
        console.warn(`[Calendrier] Modèle .calendrier-case-1 introuvable pour ${monthConfig.name}`);
        return;
    }

    grid.querySelectorAll('[data-tz-calendar-generated="true"]')
        .forEach(element => element.remove());

    template.style.setProperty('display', 'none', 'important');

    const header = grid.querySelector('.calendar-header');

    if (header) {
        header.style.gridColumn = '1 / -1';
    }

    const monthIndex = monthConfig.monthIndex;
const firstDay = new Date(year, monthIndex, 1);
const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
const mondayOffset = (firstDay.getDay() + 6) % 7;

    // Cases vides avant le premier jour.
    for (let i = 0; i < mondayOffset; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-empty-cell';
        emptyCell.setAttribute('data-tz-calendar-generated', 'true');
        emptyCell.setAttribute('aria-hidden', 'true');
        grid.appendChild(emptyCell);
    }

    // Génération des dates.
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = template.cloneNode(true);

        cell.removeAttribute('id');
        cell.classList.add('calendar-date-cell');
        cell.setAttribute('data-tz-calendar-generated', 'true');

        const dateString = [
            year,
            String(monthIndex + 1).padStart(2, '0'),
            String(day).padStart(2, '0')
        ].join('-');

        cell.setAttribute('data-calendar-date', dateString);
        cell.setAttribute('data-calendar-day', String(day));

        // Convertit les ID des éléments clonés en classes.
        const idToClass = {
            'past-days': 'past-days',
            'pastille-jour-j': 'pastille-jour-j',
            'text-score-rm-calendar': 'text-score-rm-calendar',
            'bottom-block': 'bottom-block',
            'restriction-calendar': 'restriction-calendar',
            'icon-info-calendar': 'icon-info-calendar'
        };

        cell.querySelectorAll('[id]').forEach(element => {
            const originalId = element.id;

            if (idToClass[originalId]) {
                element.classList.add(idToClass[originalId]);
            }

            element.removeAttribute('id');
        });

        const dayElement = cell.querySelector('.text-date-calendar');

        if (dayElement) {
            dayElement.textContent = String(day);
        }

        const pastOverlay = cell.querySelector('.past-days');

        if (pastOverlay) {
            pastOverlay.style.setProperty('display', 'none', 'important');
        }

        const todayPill = cell.querySelector('.pastille-jour-j');

        if (todayPill) {
            todayPill.classList.remove('is-active');
            todayPill.style.setProperty('display', 'none', 'important');
        }

        // Masque les badges de priorité jusqu'au chargement des recommandations.
        [
            '.score-rm-red-calendar',
            '.score-rm-orange-calendar',
            '.score-rm-green-calendar'
        ].forEach(selector => {
            cell.querySelectorAll(selector).forEach(badge => {
                badge.style.setProperty('display', 'none', 'important');
            });
        });

        cell.style.removeProperty('display');
        grid.appendChild(cell);
    }

    // Cases vides après le dernier jour.
    const totalCells = mondayOffset + daysInMonth;
    const trailingCells = (7 - (totalCells % 7)) % 7;

    for (let i = 0; i < trailingCells; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-empty-cell';
        emptyCell.setAttribute('data-tz-calendar-generated', 'true');
        emptyCell.setAttribute('aria-hidden', 'true');
        grid.appendChild(emptyCell);
    }

    console.log(
        `[Calendrier] ${monthConfig.name} ${year} : ${daysInMonth} dates générées.`
    );
}



 // ============================================================
 // JOUR J ET JOURS PASSÉS — HEURE LOCALE DU NAVIGATEUR
 // ============================================================

function updateCalendarVisuals() {
    const today = new Date();

    const todayDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');

    document.querySelectorAll(
        '[data-tz-calendar-generated="true"].calendar-date-cell'
    ).forEach(cell => {
        const date = cell.getAttribute('data-calendar-date');
        const pastOverlay = cell.querySelector('.past-days');
        const todayPill = cell.querySelector('.pastille-jour-j');
        const dayElement = cell.querySelector('.text-date-calendar');

        // Affiche le voile sur les jours passés.
        if (pastOverlay) {
            pastOverlay.style.setProperty(
                'display',
                date < todayDate ? 'block' : 'none',
                'important'
            );
        }

        // Active la pastille bleue du jour actuel.
        const isToday = date === todayDate;

        if (todayPill) {
            todayPill.classList.toggle('is-active', isToday);
            todayPill.style.setProperty(
                'display',
                isToday ? 'flex' : 'none',
                'important'
            );
        }

        // Numéro blanc pour aujourd'hui, noir pour les autres jours.
        if (dayElement) {
            dayElement.style.setProperty(
                'color',
                isToday ? '#FFFFFF' : '#000000',
                'important'
            );
        }
    });
}



 // ============================================================
 // SÉLECTION AUTOMATIQUE DU MOIS EN COURS
 // ============================================================

function autoSelectCurrentMonth() {
    const monthConfig = CALENDAR_MONTHS[new Date().getMonth()];
    const pane = document.querySelector(monthConfig.selector);

    if (!pane) {
        console.warn('[Calendrier] Panneau du mois en cours introuvable.');
        return;
    }

    const tabId = pane.getAttribute('data-w-tab');

    let tabLink = tabId
        ? document.querySelector(
            `.tabs-menu-5 a[data-w-tab="${tabId}"]`
        )
        : null;

    if (!tabLink) {
        const monthName = monthConfig.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        tabLink = Array.from(
            document.querySelectorAll('.tabs-menu-5 a')
        ).find(tab =>
            tab.textContent
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .trim()
                .toLowerCase() === monthName
        );
    }

    if (!tabLink) {
        console.warn(
            '[Calendrier] Onglet introuvable pour :',
            monthConfig.name
        );
        return;
    }

    // Clique uniquement si le bon onglet n'est pas actif.
    if (!tabLink.classList.contains('w--current')) {
        tabLink.click();
    }

    // Vérifie à nouveau après la mise à jour des onglets Webflow.
    setTimeout(() => {
        if (!tabLink.classList.contains('w--current')) {
            tabLink.click();
        }

        console.log('[Calendrier] Vérification du mois sélectionné :', {
            moisAttendu: monthConfig.name,
            ongletActif: tabLink.classList.contains('w--current'),
            onglet: tabLink.textContent.trim()
        });
    }, 250);
}




 // ============================================================
 // API04 — CHARGEMENT DES RECOMMANDATIONS DU CALENDRIER
 // ============================================================

async function loadCalendarRecommendations() {
    try {
        const supabaseClient = window.supabaseClient;

        if (!supabaseClient) {
            console.error('[API04 Calendrier] Client Supabase indisponible.');
            return;
        }

        // 1. Récupération de la session utilisateur
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData?.session;
        const token = session?.access_token;
        const authUserId = session?.user?.id;

        if (!session || !authUserId || !token) {
            console.warn('[API04 Calendrier] Session utilisateur absente.');
            return;
        }

        // 2. Récupération du rôle et de l'hôtel associé
        const { data: userData, error: userError } =
            await supabaseClient
                .from('users')
                .select('hotel_id, role')
                .eq('auth_user_id', authUserId)
                .single();

        if (userError) throw userError;

        let hotelId = userData?.hotel_id;

        // Le compte FOUNDER sélectionne l'hôtel via son URL.
        if (userData?.role === 'FOUNDER') {
            const urlMatch =
                window.location.pathname.match(/\/hotels\/([^/]+)/);

            if (!urlMatch) {
                console.warn(
                    '[API04 Calendrier] Slug de l’hôtel introuvable dans l’URL.'
                );
                return;
            }

            const urlSlug = urlMatch[1];

            const { data: hotelData, error: hotelError } =
                await supabaseClient
                    .from('data-store-hotels')
                    .select('id')
                    .eq('nom_hotel', urlSlug)
                    .maybeSingle();

            if (hotelError) throw hotelError;

            hotelId = hotelData?.id;
        }

        if (!hotelId) {
            console.warn('[API04 Calendrier] Hotel ID indisponible.');
            return;
        }

        console.log('[API04 Calendrier] Hôtel identifié :', hotelId);

        // 3. Chargement des recommandations API04
        const apiBase =
            typeof API_BASE_URL !== 'undefined'
                ? API_BASE_URL
                : 'https://tarifzen-backend.onrender.com';

        const response = await fetch(
            `${apiBase}/api/v1/calendar?hotel_id=${encodeURIComponent(hotelId)}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `API04 HTTP ${response.status}: ${await response.text()}`
            );
        }

        

const result = await response.json();

const recommendations = Array.isArray(result.recommendations)
    ? result.recommendations
    : [];

window.tarifZenCalendarRecommendations = recommendations;


// ============================================================
// API09 — CHARGEMENT INDÉPENDANT DES ÉVÉNEMENTS DU CALENDRIER
// ============================================================

let calendarEvents = [];

try {
    const eventsResponse = await fetch(
        `${apiBase}/api/v1/events?hotel_id=${encodeURIComponent(hotelId)}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
    );

    if (!eventsResponse.ok) {
        throw new Error(`API09 HTTP ${eventsResponse.status}`);
    }

    const eventsResult = await eventsResponse.json();

    calendarEvents = [
        ...(eventsResult?.data?.upcoming || []),
        ...(eventsResult?.data?.ongoing || [])
    ];

    console.log('[Calendrier API09] Événements reçus :', calendarEvents);

} catch (eventsError) {
    // Une erreur API09 ne doit pas bloquer les recommandations API04.
    console.error(
        '[Calendrier API09] Erreur de chargement des événements :',
        eventsError
    );
}


        console.log('[API04 Calendrier] Période reçue :', {
            start_date: result.start_date,
            end_date: result.end_date,
            recommendations: recommendations.length
        });

      

console.log('[API04 DEBUG] recommendations :', recommendations);
console.log('[API04 DEBUG] Est un tableau ?', Array.isArray(recommendations));
console.log('[API04 DEBUG] Nombre reçu :', recommendations?.length);

if (Array.isArray(recommendations)) {
    console.table(
        recommendations.map(reco => ({
            id: reco.recommendation_id,
            date: reco.recommendation_date,
            score_rm: reco.score_rm,
            priority_type: reco.priority_type,
            rule_code: reco.rule_code,
            status: reco.status,
            recommendation_status: reco.recommendation_status,
            short_message: reco.short_message
        }))
    );
}



        const recommendationsByDate = new Map(
            recommendations.map(reco => [
                reco.recommendation_date,
                reco
            ])
        );

      
        // Événements indexés par date de séjour.
        const eventsByDate = new Map();

        calendarEvents.forEach(event => {
            if (!event.start_date || !event.end_date) return;

            const start = new Date(event.start_date + 'T12:00:00Z');
            const end = new Date(event.end_date + 'T12:00:00Z');

            for (
                const current = new Date(start);
                current <= end;
                current.setUTCDate(current.getUTCDate() + 1)
            ) {
                const date = current.toISOString().slice(0, 10);

                if (!eventsByDate.has(date)) {
                    eventsByDate.set(date, []);
                }

                eventsByDate.get(date).push(event);
            }
        });

        console.log(
            '[Calendrier API09] Événements indexés par date :',
            Object.fromEntries(eventsByDate)
        );

      
        // 4. Réinitialisation des indicateurs des cases
        document.querySelectorAll(
            '[data-tz-calendar-generated="true"].calendar-date-cell'
        ).forEach(cell => {
            const score = cell.querySelector('.text-score-rm-calendar');

            if (score) score.textContent = '';

            [
                '.score-rm-red-calendar',
                '.score-rm-orange-calendar',
                '.score-rm-green-calendar'
            ].forEach(selector => {
                cell.querySelectorAll(selector).forEach(badge => {
                    badge.style.setProperty('display', 'none', 'important');
                });
            });

            cell.removeAttribute('data-message-long');
            cell.removeAttribute('data-recommendation-id');

            const infoIcon = cell.querySelector('.icon-info-calendar');


if (infoIcon) {
    infoIcon.removeAttribute('data-message-long');
    infoIcon.removeAttribute('data-date');
    infoIcon.removeAttribute('data-date-readable');
    infoIcon.removeAttribute('data-recommendation-id');
    infoIcon.removeAttribute('data-recommendation-created-at');
}

        });

        
        
        // 5. Affichage indépendant des événements et recommandations
        let displayed = 0;
        let eventsDisplayed = 0;

        document.querySelectorAll(
            '[data-tz-calendar-generated="true"].calendar-date-cell'
        ).forEach(cell => {
            const date = cell.getAttribute('data-calendar-date');
            const reco = recommendationsByDate.get(date);
            const events = eventsByDate.get(date) || [];

            // Récupérer le conteneur des événements et de la coche.
            const bottomBlock = cell.querySelector('.bottom-block');

            if (bottomBlock) {
                // Nettoyer les anciennes icônes d'événement.
                bottomBlock
                    .querySelectorAll('[data-tz-calendar-event="true"]')
                    .forEach(icon => icon.remove());

                // Nettoyer les anciennes coches de recommandations appliquées.
                bottomBlock
                    .querySelectorAll('[data-tz-calendar-applied="true"]')
                    .forEach(icon => icon.remove());
            }

            // Afficher les événements même sans recommandation.
            if (bottomBlock && events.length > 0) {
                events.forEach(event => {
                    const impact = (event.impact || '').toLowerCase();

                    let emoji = '📅';

                    if (impact.includes('fort')) {
                        emoji = '🔥';
                    } else if (impact.includes('moyen')) {
                        emoji = '⚡';
                    }

                    const eventIcon = document.createElement('span');

                    eventIcon.setAttribute('data-tz-calendar-event', 'true');
                    eventIcon.textContent = emoji;
                    eventIcon.title =
                        `${event.name || 'Événement'} — ${event.impact || 'Impact non précisé'}`;
                    eventIcon.setAttribute('role', 'button');
                    eventIcon.setAttribute('tabindex', '0');
                    eventIcon.setAttribute(
                        'aria-label',
                        `Ouvrir les événements : ${event.name || 'Événement'}`
                    );

                    eventIcon.style.cursor = 'pointer';
                    eventIcon.style.display = 'inline-flex';
                    eventIcon.style.alignItems = 'center';
                    eventIcon.style.justifyContent = 'center';
                    eventIcon.style.marginLeft = '4px';

                    const openEventsTab = () => {
                        const eventsTab = document.querySelector(
                            '.tabs.w-tabs .w-tab-link[href="#w-tabs-0-data-w-pane-6"]'
                        );

                        if (eventsTab) {
                            eventsTab.click();
                        } else {
                            console.warn(
                                '[Calendrier API09] Onglet Événements introuvable.'
                            );
                        }
                    };

                    eventIcon.addEventListener('click', eventClick => {
                        eventClick.preventDefault();
                        eventClick.stopPropagation();
                        openEventsTab();
                    });

                    eventIcon.addEventListener('keydown', keyEvent => {
                        if (
                            keyEvent.key === 'Enter' ||
                            keyEvent.key === ' '
                        ) {
                            keyEvent.preventDefault();
                            keyEvent.stopPropagation();
                            openEventsTab();
                        }
                    });

                    bottomBlock.appendChild(eventIcon);
                    eventsDisplayed++;
                });
            }

           
            // Sans recommandation, conserver les événements et continuer.
            if (!reco) return;

            // Afficher une coche verte si la recommandation a été appliquée.
            if (
                bottomBlock &&
                reco.is_applied === true
            ) {
                const appliedIcon = document.createElement('span');

                appliedIcon.setAttribute(
                    'data-tz-calendar-applied',
                    'true'
                );
                appliedIcon.innerHTML = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        aria-hidden="true"
    >
        <rect
            x="1"
            y="1"
            width="16"
            height="16"
            rx="3"
            fill="#16A34A"
        />
        <path
            d="M4.5 9L7.5 12L13.5 6"
            fill="none"
            stroke="#FFFFFF"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
`;
                appliedIcon.title = 'Recommandation appliquée';
                appliedIcon.setAttribute('aria-label', 'Recommandation appliquée');

                appliedIcon.style.display = 'inline-flex';
                appliedIcon.style.alignItems = 'center';
                appliedIcon.style.justifyContent = 'center';
                appliedIcon.style.marginLeft = '4px';

                bottomBlock.appendChild(appliedIcon);
            }

            displayed++;

            const message =
                reco.long_message || reco.short_message || '';

            cell.setAttribute(
                'data-recommendation-id',
                reco.recommendation_id || ''
            );

            cell.setAttribute('data-message-long', message);

            const score = cell.querySelector('.text-score-rm-calendar');

            if (score) {
                score.textContent =
                    reco.score_rm != null ? String(reco.score_rm) : '';
            }

            const badgeSelectors = {
                RED: '.score-rm-red-calendar',
                ORANGE: '.score-rm-orange-calendar',
                GREEN: '.score-rm-green-calendar'
            };

            const badgeSelector = badgeSelectors[reco.priority_type];

            if (badgeSelector) {
                cell.querySelectorAll(badgeSelector).forEach(badge => {
                    badge.style.setProperty('display', 'flex', 'important');
                });
            }

            const infoIcon = cell.querySelector('.icon-info-calendar');

            if (infoIcon) {
                // Message détaillé de la recommandation.
                infoIcon.setAttribute('data-message-long', message);

                // Date de séjour au format ISO.
                infoIcon.setAttribute('data-date', date);

                // Date de création initiale de la recommandation.
                infoIcon.setAttribute(
                    'data-recommendation-created-at',
                    reco.recommendation_created_at || ''
                );

                // Date lisible en français : Mardi 22 Décembre.
                const readableDate = new Date(date + 'T12:00:00')
                    .toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        timeZone: 'Europe/Paris'
                    })
                    .replace(/^./, lettre => lettre.toUpperCase())
                    .replace(/(\d+)\s+(\p{L})/u, (_, jour, lettre) =>
                        `${jour} ${lettre.toUpperCase()}`
                    );

                infoIcon.setAttribute(
                    'data-date-readable',
                    readableDate
                );

                infoIcon.setAttribute(
                    'data-recommendation-id',
                    reco.recommendation_id || ''
                );
            }
        });

        console.log('[API04 Calendrier] Affichage terminé :', {
            recommendations_received: recommendations.length,
            recommendations_displayed: displayed,
            events_displayed: eventsDisplayed
        });

    } catch (error) {
        console.error(
            '[API04 Calendrier] Erreur de chargement :',
            error
        );
    }
}


 // ============================================================
 // LIBELLÉS DU CALENDRIER — MOIS ET ANNÉES
 // ============================================================

function updateCalendarMonthLabels() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIndex = today.getMonth();

    const tabs = document.querySelectorAll('.tabs-menu-5 a');

    CALENDAR_MONTHS.forEach(monthConfig => {
        const monthYear =
            currentYear + (
                monthConfig.monthIndex < currentMonthIndex ? 1 : 0
            );

        const pane = document.querySelector(monthConfig.selector);

        if (!pane) return;

        const tabId = pane.getAttribute('data-w-tab');

        let tab = tabId
            ? document.querySelector(
                `.tabs-menu-5 a[data-w-tab="${tabId}"]`
            )
            : null;

        if (!tab) {
            console.warn(
                '[Calendrier] Onglet introuvable pour :',
                monthConfig.name
            );
            return;
        }

        const monthName =
            monthConfig.name.charAt(0).toUpperCase() +
            monthConfig.name.slice(1);

        const label = tab.querySelector('div') || tab;

        label.textContent = `${monthName} ${monthYear}`;
    });

    // Réorganise les onglets chronologiquement à partir du mois actuel.
    const dropdown = document.querySelector('.tabs-menu-dropdown');

    if (dropdown) {
        const orderedTabs = CALENDAR_MONTHS
            .map(monthConfig => {
                const pane = document.querySelector(monthConfig.selector);
                if (!pane) return null;

                const tabId = pane.getAttribute('data-w-tab');

                return tabId
                    ? dropdown.querySelector(
                        `a[data-w-tab="${tabId}"]`
                    )
                    : null;
            })
            .filter(Boolean);

        const orderedConfigs = [
            ...CALENDAR_MONTHS.slice(currentMonthIndex),
            ...CALENDAR_MONTHS.slice(0, currentMonthIndex)
        ];

        orderedConfigs.forEach(monthConfig => {
            const pane = document.querySelector(monthConfig.selector);
            if (!pane) return;

            const tabId = pane.getAttribute('data-w-tab');
            const tab = tabId
                ? dropdown.querySelector(`a[data-w-tab="${tabId}"]`)
                : null;

            if (tab) dropdown.appendChild(tab);
        });
    }

    console.log('[Calendrier] Libellés et ordre des mois actualisés.');
}



 // ============================================================
 // INITIALISATION DU CALENDRIER — 12 MOIS GLISSANTS
 // ============================================================

function initializeTarifZenCalendar() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIndex = today.getMonth();

    // Génère chaque calendrier avec l'année correspondante.
    CALENDAR_MONTHS.forEach(monthConfig => {
        const monthYear =
            currentYear + (monthConfig.monthIndex < currentMonthIndex ? 1 : 0);

        generateCalendarMonth(monthConfig, monthYear);
    });

    // Met à jour les libellés et l'ordre chronologique des onglets.
    updateCalendarMonthLabels();

    // Met à jour les indicateurs visuels.
    updateCalendarVisuals();

    // Sélectionne automatiquement le mois en cours.
    autoSelectCurrentMonth();

    console.log('[Calendrier] Initialisation des 12 mois glissants terminée.', {
        moisActuel: CALENDAR_MONTHS[currentMonthIndex].name,
        anneeActuelle: currentYear
    });

    // Charge les recommandations une fois les cases créées.
    loadCalendarRecommendations();
}

// Ce code s'exécute dans le DOMContentLoaded déjà ouvert plus haut.
initializeTarifZenCalendar();

// Actualise les indicateurs lors du changement d'onglet.
document.querySelectorAll('.tabs-menu-5 a').forEach(tab => {
    tab.addEventListener('click', () => {
        setTimeout(updateCalendarVisuals, 150);
    });
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
  const n = Number(count) || 0;

  if (n === 0) {
    return 'Toutes les actions urgentes sont traitées. Bravo !';
  }

  return `${n} action${n > 1 ? 's' : ''} urgente${n > 1 ? 's' : ''}`;
}

function formatAnalysisActions(count) {
  const n = Number(count) || 0;

  if (n === 0) {
    return 'Toutes les analyses sont traitées. Bravo !';
  }

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

  // Éviter les décalages de date liés au fuseau horaire.
  const dateOnly = String(dateStr).slice(0, 10);
  const match = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  let d;

  if (match) {
    d = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      12
    );
  } else {
    d = new Date(dateStr);
  }

  if (isNaN(d.getTime())) return dateStr;

  const weekday = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long'
  }).format(d);

  const day = String(d.getDate()).padStart(2, '0');

  const month = new Intl.DateTimeFormat('fr-FR', {
    month: 'long'
  }).format(d);

  const year = d.getFullYear();

  const weekdayCapitalized =
    weekday.charAt(0).toUpperCase() + weekday.slice(1);

  const monthCapitalized =
    month.charAt(0).toUpperCase() + month.slice(1);

  const dayFormatted =
    Number(day) === 1 ? '01ᵉʳ' : day;

  return `${weekdayCapitalized} ${dayFormatted} ${monthCapitalized} ${year}`;
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
  // ============================================================

  formattedMessage = formattedMessage
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(?:<br\s*\/?>\s*)+/gi, '\n')
    .split('\n')
    .map(line => `<div>${line}</div>`)
    .join('');

  return formattedMessage;
}

// ============================================================
// API02 — RENDU MULTI-CARTES DES RECOMMANDATIONS
// ============================================================
function renderRecommandations(data, eventsAPI09 = []) {
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
  // ÉTAT VIDE — RECOMMANDATIONS
  // ============================================================
  const emptyRecoEl = document.getElementById('reco-text-empty');

  if (emptyRecoEl) {
    if (visibleData.length === 0) {
emptyRecoEl.innerHTML =
  'Tout est sous contrôle !<br>Aucune recommandation pour le moment.';
      emptyRecoEl.style.display = 'block';
    } else {
      emptyRecoEl.style.display = 'none';
    }
  }

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

      const isFirstCard =
        newCard.classList.contains('is-urgent') &&
        !document.querySelector(
          '.reco-card-item.is-urgent'
        );

      dateBottomEl.style.setProperty(
        'display',
        isFirstCard ? 'none' : 'block',
        'important'
      );
    }

    
// ============================================================
// ÉVÉNEMENT — API09
// Afficher le conteneur uniquement si un événement correspond
// à la date de la recommandation
// ============================================================
const eventEl = newCard.querySelector('#reco-event');
const eventContainer = newCard.querySelector('.card-content-event');

if (eventEl && eventContainer) {
  const matchingEvents = eventsAPI09.filter(event =>
    event.start_date === item.date
  );

  const impactIcons = {
    'fort': '🔥',
    'moyen': '⚡',
    'faible': '📅'
  };

  eventEl.textContent = matchingEvents
    .map(event => {
      const impactKey = String(event.impact || '')
        .trim()
        .toLowerCase();

      const icon = impactIcons[impactKey] || '📅';

      return `${icon} ${event.name}`;
    })
    .join(' · ');

  // Afficher uniquement si au moins un événement correspond
  eventContainer.style.display =
    matchingEvents.length > 0 ? 'block' : 'none';
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

// Masquer la date bottom de la première carte urgente
const firstUrgentCard = container.querySelector(
  '.reco-card-item.is-urgent'
);

if (firstUrgentCard) {
  const firstDateBottom = firstUrgentCard.querySelector(
    '#reco-date-bottom'
  );

  if (firstDateBottom) {
    firstDateBottom.style.setProperty(
      'display',
      'none',
      'important'
    );
  }
}
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

 // 3 bis. API09 — ÉVÉNEMENTS
 let eventsAPI09 = [];

 try {
   const response09 = await fetch(
     `${API_BASE_URL}/api/v1/events?hotel_id=${encodeURIComponent(targetHotelId)}`,
     {
       method: 'GET',
       headers: requestHeaders
     }
   );

   if (!response09.ok) {
     console.error(
       `[API09 - HTTP ${response09.status}] Erreur lors de la récupération des événements.`
     );
   } else {
     const result09 = await response09.json();

     eventsAPI09 = [
       ...(result09?.data?.upcoming || []),
       ...(result09?.data?.ongoing || [])
     ];

     console.log('📅 [API09] Réponse complète :', result09);

console.log('📅 [API09] Événements à venir :', result09?.data?.upcoming);

console.log('📅 [API09] Événements chargés :', eventsAPI09);
   }
 } catch (err09) {
   console.error('[API09] Erreur inattendue :', err09.message);
 }

  

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
    const result02 = await response02.json();

    const recommendations =
      result02 && result02.data
        ? result02.data
        : [];

    // Transmission des recommandations ET des événements API09
    renderRecommandations(
      recommendations,
      eventsAPI09
    );

    updateHistoricCounter(
      result02?.count || recommendations.length
    );

  } else {
    console.error(
      `[API02 - HTTP ${response02.status}] Erreur lors de la récupération des recommandations.`
    );

    renderRecommandations([], eventsAPI09);
  }

} catch (err02) {
  console.error(
    '[API02] Erreur inattendue :',
    err02.message
  );

  renderRecommandations([], eventsAPI09);
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

  console.log('[API03 Dashboard] Compteurs reçus du backend :', {
    urgent_actions: data.urgent_actions,
    analysis_actions: data.analysis_actions,
    recommendations_total: data.recommendations_total
});

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

const elGainPotentiel =
  document.getElementById('gain_potential_today');

if (Number(data.recommendations_total) === 0) {
  if (elRecosTotal) {
    elRecosTotal.innerText =
      "Aucune action à prioriser aujourd’hui";
  }

  if (elGainPotentiel) {
    elGainPotentiel.innerText = "-";
  }
} else {
  if (elRecosTotal) {
    elRecosTotal.innerText =
      formatRecommendationsTotal(
        data.recommendations_total
      );
  }

  if (elGainPotentiel) {
    elGainPotentiel.innerText =
      formatGainPotential(
        data.gain_potential_today
      );
  }
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


 
 // 6. API05 — PICK UP
 try {
   const response05 = await fetch(
     `${API_BASE_URL}/api/v1/pickup?hotel_id=${encodeURIComponent(targetHotelId)}`,
     {
       method: 'GET',
       headers: requestHeaders
     }
   );

   if (!response05.ok) {
     console.error(
       `[API05 - HTTP ${response05.status}] Erreur lors de la récupération du Pick Up.`
     );
   } else {
     const result05 = await response05.json();
     const pickupData = Array.isArray(result05?.data)
       ? result05.data
       : [];

     const datesContainer = document.getElementById(
       'colonne-dates-fixe'
     );
     const dataContainer = document.getElementById(
       'colonne-donnees-scroll'
     );

     const dateTemplate = document.getElementById('date-pickup');
     const dataTemplate = document.getElementById('line-item-pickup');

     if (!datesContainer || !dataContainer || !dateTemplate || !dataTemplate) {
       console.error(
         '[API05] Modèles ou conteneurs Pick Up introuvables.',
         {
           datesContainer: !!datesContainer,
           dataContainer: !!dataContainer,
           dateTemplate: !!dateTemplate,
           dataTemplate: !!dataTemplate
         }
       );
     } else {
       // Supprime les clones précédents uniquement
       datesContainer
         .querySelectorAll('[data-tz-pickup-generated="true"]')
         .forEach(el => el.remove());

       dataContainer
         .querySelectorAll('[data-tz-pickup-generated="true"]')
         .forEach(el => el.remove());

       // Les modèles restent masqués : ils servent uniquement au clonage
       dateTemplate.style.display = 'none';
       dataTemplate.style.display = 'none';

       // Format des dates
       const formatDate = value => {
         if (!value) return '—';

         const parts = String(value).split('-').map(Number);

         if (parts.length !== 3 || parts.some(Number.isNaN)) {
           return '—';
         }

         const date = new Date(parts[0], parts[1] - 1, parts[2]);

         const jour = new Intl.DateTimeFormat('fr-FR', {
           weekday: 'long'
         }).format(date);

         const jourNumero = parts[2];

         const mois = new Intl.DateTimeFormat('fr-FR', {
           month: 'long'
         }).format(date);

         const annee = parts[0];

         const jourCapitalise =
           jour.charAt(0).toUpperCase() + jour.slice(1);

         const moisCapitalise =
           mois.charAt(0).toUpperCase() + mois.slice(1);

         const numeroFormate = String(jourNumero).padStart(2, '0');

         if (jourNumero === 1) {
           return `${jourCapitalise} ${numeroFormate}<sup>er</sup> ${moisCapitalise} ${annee}`;
         }

         return `${jourCapitalise} ${numeroFormate} ${moisCapitalise} ${annee}`;
       };

       // Format des variations avec couleurs
       const formatVariation = (value, suffix = '') => {
         if (value === null || value === undefined || value === '') {
           return { text: '—', color: '#6B7280' };
         }

         const number = Number(value);

         if (!Number.isFinite(number)) {
           return { text: '—', color: '#6B7280' };
         }

         const formatted = Math.abs(number).toLocaleString('fr-FR', {
           maximumFractionDigits: 2
         });

         const sign = number > 0 ? '+' : number < 0 ? '-' : '';

         const color = number > 0
           ? '#16A34A'
           : number < 0
             ? '#DC2626'
             : '#6B7280';

         return {
           text: `${sign}${formatted}${suffix ? ` ${suffix}` : ''}`,
           color
         };
       };

       // Couleurs alternées : blanc / bleu clair
       const getRowBackground = index =>
         index % 2 === 0 ? '#FFFFFF' : '#E8F0FE';

       // Génération des lignes
       pickupData.forEach((row, index) => {
         const rowBackground = getRowBackground(index);

         // Clone de la date dans la colonne fixe
         const dateClone = dateTemplate.cloneNode(true);

         dateClone.removeAttribute('id');
         dateClone.setAttribute('data-tz-pickup-generated', 'true');
         dateClone.style.display = '';
         dateClone.style.backgroundColor = rowBackground;

         dateClone.innerHTML = formatDate(row.date);
         dateClone.style.color = '#111111';

         datesContainer.appendChild(dateClone);

         
         // Clone de la ligne de données
         const dataClone = dataTemplate.cloneNode(true);
         dataClone.removeAttribute('id');
         dataClone.setAttribute('data-tz-pickup-generated', 'true');
         dataClone.style.display = '';
         dataClone.style.backgroundColor = 'transparent';

         // Appliquer le fond directement à chaque case
         dataClone.querySelectorAll(
           '#pick-up-j-1, #pick-up-j-7, #pick-up-to, #pick-up-pm, #pick-up-ca'
         ).forEach(cell => {
           cell.style.setProperty('background-color', rowBackground, 'important');
         });

         const fields = [
           ['pick-up-j-1', row.pickup_24h, ''],
           ['pick-up-j-7', row.pickup_7d, ''],
           ['pick-up-to', row.pickup_to, '%'],
           ['pick-up-pm', row.pickup_pm, '€'],
           ['pick-up-ca', row.pickup_ca, '€']
         ];

         fields.forEach(([fieldId, value, suffix]) => {
           const cell = dataClone.querySelector(`#${CSS.escape(fieldId)}`);

           if (!cell) {
             console.warn(
               `[API05] Élément #${fieldId} introuvable dans la ligne modèle.`
             );
             return;
           }

           cell.removeAttribute('id');

           const formatted = formatVariation(value, suffix);

           cell.textContent = formatted.text;
           cell.style.color = formatted.color;
         });

         dataContainer.appendChild(dataClone);
       });

       console.log(
         '📊 [API05] Pick Up chargé :',
         pickupData.length,
         'dates'
       );
     }
   }
 } catch (err05) {
   console.error('[API05] Erreur inattendue :', err05.message);
 }

 
    
    
    // ----------------------------------------------------------
    // API06 — CONCURRENCE
    // ----------------------------------------------------------
    try {
      const response06 = await fetch(
        `${API_BASE_URL}/api/v1/competition?hotel_id=${encodeURIComponent(targetHotelId)}`,
        {
          method: 'GET',
          headers: requestHeaders
        }
      );

      if (!response06.ok) {
        console.error('[API06] Erreur HTTP :', response06.status);
      } else {
        const result06 = await response06.json();
        const competitors = result06?.competitors ?? {};
        const competitionData = Array.isArray(result06?.data)
          ? result06.data
          : [];

        // 1. En-têtes des concurrents
        const headerNames = [
          ['name-concurrent-1', competitors.competitor_1_name],
          ['name-concurrent-2', competitors.competitor_2_name],
          ['name-concurrent-3', competitors.competitor_3_name]
        ];

        headerNames.forEach(([id, name]) => {
          const element = document.getElementById(id);

          if (element) {
            element.textContent = name || 'Concurrent non renseigné';
          } else {
            console.warn(`[API06] Élément #${id} introuvable.`);
          }
        });

        // 2. Conteneurs et modèles Webflow
        const datesContainer = document.getElementById(
          'colonne-date-fixe-concurrence'
        );

        const dataContainer = document.getElementById(
          'colonne-date-scroll-concurrence'
        );

        const dateTemplate = document.getElementById('date-concurrence');
        const dataTemplate = document.getElementById('line-concurrence');

        if (!datesContainer || !dataContainer || !dateTemplate || !dataTemplate) {
          console.error('[API06] Conteneurs ou modèles introuvables.', {
            datesContainer: !!datesContainer,
            dataContainer: !!dataContainer,
            dateTemplate: !!dateTemplate,
            dataTemplate: !!dataTemplate
          });
        } else {
          // 3. Supprimer les anciennes lignes générées
          datesContainer
            .querySelectorAll('[data-tz-concurrence-generated="true"]')
            .forEach(element => element.remove());

          dataContainer
            .querySelectorAll('[data-tz-concurrence-generated="true"]')
            .forEach(element => element.remove());

          // Masquer les modèles originaux
          dateTemplate.style.display = 'none';
          dataTemplate.style.display = 'none';

          // 4. Format de date : Jeudi 01er Octobre 2026
          const formatDate = value => {
            if (!value) return '—';

            const parts = String(value).split('-').map(Number);

            if (parts.length !== 3 || parts.some(Number.isNaN)) {
              return '—';
            }

            const date = new Date(parts[0], parts[1] - 1, parts[2]);

            const weekday = new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long'
            }).format(date);

            const month = new Intl.DateTimeFormat('fr-FR', {
              month: 'long'
            }).format(date);

            const weekdayCapitalized =
              weekday.charAt(0).toUpperCase() + weekday.slice(1);

            const monthCapitalized =
              month.charAt(0).toUpperCase() + month.slice(1);

            const day = String(parts[2]).padStart(2, '0');

            if (parts[2] === 1) {
              return `${weekdayCapitalized} ${day}<sup>er</sup> ${monthCapitalized} ${parts[0]}`;
            }

            return `${weekdayCapitalized} ${day} ${monthCapitalized} ${parts[0]}`;
          };

          // 5. Format des tarifs en euros
          const formatPrice = value => {
            if (value === null || value === undefined || value === '') {
              return '—';
            }

            const number = Number(value);

            if (!Number.isFinite(number)) return '—';

            return number.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) + ' €';
          };

          // 6. Alternance des fonds : blanc / bleu clair
          const getRowBackground = index =>
            index % 2 === 0 ? '#FFFFFF' : '#E8F0FE';

          // 7. Générer une date et une ligne tarifaire par relevé
          competitionData.forEach((row, index) => {
            const rowBackground = getRowBackground(index);

            // Colonne fixe des dates
            const dateClone = dateTemplate.cloneNode(true);

            dateClone.removeAttribute('id');
            dateClone.setAttribute(
              'data-tz-concurrence-generated',
              'true'
            );
            dateClone.style.display = '';
            dateClone.style.backgroundColor = rowBackground;
            dateClone.innerHTML = formatDate(row.date);
            dateClone.style.color = '#111111';

            datesContainer.appendChild(dateClone);

            // Ligne des tarifs
            const dataClone = dataTemplate.cloneNode(true);

            dataClone.removeAttribute('id');
            dataClone.setAttribute(
              'data-tz-concurrence-generated',
              'true'
            );
            dataClone.style.display = '';
            dataClone.style.backgroundColor = 'transparent';

            // Appliquer le fond directement aux cinq cases
            dataClone.querySelectorAll(
              '#tarif-mon-hotel, #tarif-concurrent-1, #tarif-concurrent-2, #tarif-concurrent-3, #tarif-median'
            ).forEach(cell => {
              cell.style.setProperty(
                'background-color',
                rowBackground,
                'important'
              );
            });

            const fields = [
              ['tarif-mon-hotel', row.hotel_price],
              ['tarif-concurrent-1', row.competitor_1_price],
              ['tarif-concurrent-2', row.competitor_2_price],
              ['tarif-concurrent-3', row.competitor_3_price],
              ['tarif-median', row.competitor_median]
            ];

            fields.forEach(([fieldId, value]) => {
              const cell = dataClone.querySelector(`#${fieldId}`);

              if (!cell) {
                console.warn(
                  `[API06] Champ #${fieldId} introuvable dans la ligne modèle.`
                );
                return;
              }

              cell.textContent = formatPrice(value);

              // 8. Couleur du tarif de mon hôtel selon le tarif médian
              if (fieldId === 'tarif-mon-hotel') {
                const hasHotelPrice =
                  value !== null &&
                  value !== undefined &&
                  value !== '';

                const hasMedian =
                  row.competitor_median !== null &&
                  row.competitor_median !== undefined &&
                  row.competitor_median !== '';

                const hotelPrice = Number(value);
                const medianPrice = Number(row.competitor_median);

                if (
                  !hasHotelPrice ||
                  !hasMedian ||
                  !Number.isFinite(hotelPrice) ||
                  !Number.isFinite(medianPrice)
                ) {
                  cell.style.color = '#6B7280';
                } else if (hotelPrice >= medianPrice) {
                  cell.style.color = '#16A34A';
                } else {
                  cell.style.color = '#DC2626';
                }
              }

              cell.removeAttribute('id');
            });

            dataContainer.appendChild(dataClone);
          });

          console.log('📊 [API06] Concurrence chargée :', {
            dates: competitionData.length,
            concurrents: competitors
          });
        }
      }
    } catch (err06) {
      console.error('[API06] Erreur de chargement :', err06);
    }

 

 // 8. API08 — PERFORMANCE
 try {
   const response08 = await fetch(
     `${API_BASE_URL}/api/v1/performance?hotel_id=${encodeURIComponent(targetHotelId)}`,
     {
       method: 'GET',
       headers: requestHeaders
     }
   );

   if (!response08.ok) {
     console.error(
       `[API08 - HTTP ${response08.status}] Erreur lors de la récupération des performances.`
     );
   } else {
     const data08 = await response08.json();

     // Gain réel du mois
     const elGainMonth = document.getElementById(
       'gain-real-month-performance'
     );
     if (elGainMonth) {
       elGainMonth.innerText = formatGainReal(
         data08.gain_real_month
       );
     }

     // Gain réel cumulé
     const elGainTotal = document.getElementById(
       'gain-real-total-performance'
     );
     if (elGainTotal) {
       elGainTotal.innerText = formatGainReal(
         data08.gain_real_total
       );
     }

     // Nombre total de recommandations traitées
     const elTotalRecos = document.getElementById(
       'total-nbre-reco-performance'
     );
     if (elTotalRecos) {
       elTotalRecos.innerText =
         data08.recommandations_total ?? 0;
     }

     // Taux d'application
     const elApplicationRate = document.getElementById(
       'application-rate-performance'
     );
     if (elApplicationRate) {
       elApplicationRate.innerText =
         `${Number(data08.application_rate ?? 0).toLocaleString('fr-FR')} %`;
     }

     // Rentabilité de l'abonnement
     const elSubscriptionProfitability =
       document.getElementById(
         'subscription-profitability-performance'
       );


if (elSubscriptionProfitability) {
  if (data08.subscription_profitability === 'PROFITABLE') {
    elSubscriptionProfitability.innerHTML =
      '✅ TarifZen est rentabilisé !';
  } else if (
    data08.subscription_profitability === 'NOT_PROFITABLE'
  ) {
    const remaining = Number(
      data08.remaining_to_profitability ?? 0
    ).toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    elSubscriptionProfitability.innerHTML =
      `🎯 Encore ${remaining} € pour rentabiliser TarifZen`;
  } else {
    elSubscriptionProfitability.innerText = '—';
  }
}


     console.log('📊 [API08] Performances chargées :', data08);
   }
 } catch (err08) {
   console.error(
     '[API08] Erreur inattendue :',
     err08.message
   );
 }


} catch (err) {
console.error(
" Erreur globale lors de l'initialisation :",
err.message
);
}
}


  
function renderEventsPage(events) {
  const futureContainer = document.getElementById('event-card-future');
  const pastContainer = document.getElementById('event-card-past');

  if (!futureContainer || !pastContainer) {
    console.log('[API09] Conteneurs de la page Événements absents.');
    return;
  }

  

function renderGroup(container, groupEvents) {
  const parent = container.parentElement;

  // Le conteneur complet sert de modèle.
  const template = container;

  if (!parent || !template.querySelector('.block-event')) {
    console.error('[API09] Modèle ou parent introuvable :', container.id);
    return;
  }

  // Supprimer les anciens clones associés à ce modèle.
  parent
    .querySelectorAll(
      `[data-api09-generated="true"][data-api09-group="${container.id}"]`
    )
    .forEach(card => card.remove());

  // Garder le modèle Webflow masqué, même si une règle CSS le réaffiche.
template.style.setProperty('display', 'none', 'important');

  const formatDate = value => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
  };

  groupEvents.forEach(event => {
    // Cloner la carte complète.
    const card = template.cloneNode(true);

    // Le clone ne doit pas conserver l'ID du modèle.
    card.removeAttribute('id');
    card.dataset.api09Generated = 'true';
    card.dataset.api09Group = container.id;

    // Remplir les données dans .block-event.
    const block = card.querySelector('.block-event');

    if (!block) {
      console.error('[API09] .block-event absent du clone.');
      return;
    }

    const startEl = block.querySelector('#date-debut');
    const endEl = block.querySelector('#date-fin');
    const nameEl = block.querySelector('#text-nom-event');
    const impactEl = block.querySelector('#impact-event');

    if (startEl) {
      startEl.textContent = formatDate(event.start_date);
    }

    if (endEl) {
      endEl.textContent = formatDate(event.end_date);
    }

    if (nameEl) {
      nameEl.textContent = event.name || '';
    }

    if (impactEl) {
      const impact = String(event.impact || '').trim();

      const impactIcons = {
        fort: '🔥',
        moyen: '⚡',
        faible: '📅'
      };

      const icon = impactIcons[impact.toLowerCase()] || '📅';
      impactEl.textContent = `${icon} ${impact}`;
    }

    // Insérer la carte complète après le modèle.
parent.appendChild(card);
card.style.display = 'flex';
card.style.flexDirection = 'row';
card.style.alignItems = 'center';

    console.log('[API09] Carte événement ajoutée :', {
      nom: event.name,
      modèle: container.id
    });
  });
}

  const futureEvents = events.filter(
    event => event.period_status !== 'PAST'
  );

  const pastEvents = events.filter(
    event => event.period_status === 'PAST'
  );

  renderGroup(futureContainer, futureEvents);
  renderGroup(pastContainer, pastEvents);

  
  
  // Gestion du popup de suppression pour les cartes générées
  [futureContainer, pastContainer].forEach(container => {
  container.parentElement?.querySelectorAll(
    '[data-api09-generated="true"] #btn-delete-event'
  ).forEach(button => {
      if (button.dataset.deletePopupBound === 'true') return;

      button.dataset.deletePopupBound = 'true';

      button.addEventListener('click', event => {
        event.preventDefault();

        const card = button.closest('.block-event');
        const popup = document.querySelector('.div-block-75');

        if (!card || !popup) {
          console.error('[API09] Carte ou popup introuvable.');
          return;
        }

        const getText = selector =>
          card.querySelector(selector)?.textContent.trim() || '';

        const startDate = getText('#date-debut');
        const endDate = getText('#date-fin');
        const eventName = getText('#text-nom-event');
        const impact = getText('#impact-event');

        const displayFields = {
          '#date-debut-display': startDate,
          '#date-fin-display': endDate,
          '#nom-event-display': eventName,
          '#impact-display': impact
        };

        Object.entries(displayFields).forEach(([selector, value]) => {
          const element = popup.querySelector(selector);

          if (element) {
            element.textContent = value;
          } else {
            console.warn(`[API09] Élément du popup introuvable : ${selector}`);
          }
        });

        popup.style.display = 'flex';
      });
    });
  });


  
  const emptyFuture = document.getElementById('empty-events-future');
  const emptyPast = document.getElementById('empty-events-past');

// Afficher le conteneur uniquement s'il contient des événements.
futureContainer.style.setProperty('display', 'none', 'important');
pastContainer.style.setProperty('display', 'none', 'important');

futureContainer.style.flexDirection = 'column';
pastContainer.style.flexDirection = 'column';

  if (emptyFuture) {
    emptyFuture.style.display =
      futureEvents.length > 0 ? 'none' : 'block';
  }

  if (emptyPast) {
    emptyPast.style.display =
      pastEvents.length > 0 ? 'none' : 'block';
  }
}

async function initEventsPage() {
  try {
    const futureContainer = document.getElementById('event-card-future');
    const pastContainer = document.getElementById('event-card-past');

    if (!futureContainer || !pastContainer) return;

    const {
      data: { session },
      error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
      console.warn('[API09] Aucune session Supabase active.');
      return;
    }

    const {
      data: userData,
      error: userError
    } = await supabaseClient
      .from('users')
      .select('hotel_id, role')
      .eq('auth_user_id', session.user.id)
      .single();

    if (userError || !userData) {
      console.error('[API09] Profil utilisateur introuvable :', userError?.message);
      return;
    }

    let targetHotelId = userData.hotel_id;

    if (userData.role === 'FOUNDER') {
      const match = window.location.pathname.match(/\/hotels\/([^/]+)/);
      const urlSlug = match ? decodeURIComponent(match[1]).trim() : '';

      if (!urlSlug) {
        console.error('[API09] Slug hôtel absent de l’URL.');
        return;
      }

      targetHotelId = await getHotelIdFromSlug(urlSlug);
    }

    if (!targetHotelId) {
      console.error('[API09] Impossible de déterminer le hotel_id.');
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/events?hotel_id=${encodeURIComponent(targetHotelId)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${String(session.access_token).trim()}`
        }
      }
    );

    if (!response.ok) {
      console.error(`[API09 - HTTP ${response.status}] Échec du chargement des événements.`);
      return;
    }

    const result = await response.json();
    const eventData = result?.data || {};

    const allEvents = [
      ...(eventData.upcoming || []),
      ...(eventData.ongoing || []),
      ...(eventData.past || [])
    ];

    console.log('[API09] Événements pour la page :', allEvents);

    renderEventsPage(allEvents);

  } catch (error) {
    console.error('[API09] Erreur lors du chargement de la page Événements :', error);
  }
}

/* ============================================================
   API07 — RENDU DES CARTES HISTORIQUE
   ============================================================ */
function renderHistory(historyData, activeTab = 'APPLIED') {

  // Conteneurs des deux onglets
  const treatedContainer = document.querySelector('#notif-list-historic');
  const ignoredContainer = document.querySelector('#notif-list-historic-ignore');

  // Conteneur correspondant à l'onglet actif
  const container = activeTab === 'IGNORED'
    ? ignoredContainer
    : treatedContainer;

  // Modèle commun des cartes
  const template = document.querySelector('#card-historic');

  if (!container || !template) {
    console.warn('[API07] Conteneur ou carte modèle introuvable.', {
      activeTab,
      containerFound: !!container,
      templateFound: !!template
    });
    return;
  }


  // Le modèle reste toujours masqué.
  // Seules les cartes clonées contenant des données sont affichées.
  template.style.display = 'none';

  // Les clones reprennent l'affichage prévu pour les cartes réelles.
  template.dataset.historyTemplateDisplay = 'block';

  

  // Supprimer uniquement les anciennes cartes de l'onglet rendu
container
  .querySelectorAll('[data-tz-history-generated="true"]')
  .forEach(card => card.remove());


  // Filtrer et trier les actions de l'onglet actif
  const filteredData = (Array.isArray(historyData) ? historyData : [])
    .filter(item => item.action === activeTab)
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0).getTime();
      const dateB = new Date(b.created_at || b.date || 0).getTime();
      return dateB - dateA;
    });

  // Affichage du message si l'historique de l'onglet est vide
  const emptyTraitee = document.querySelector('.empty-historic-traitee');
  const emptyIgnore = document.querySelector('.empty-historic-ignore');

  if (emptyTraitee) {
    emptyTraitee.style.display =
      activeTab === 'APPLIED' && filteredData.length === 0
        ? 'block'
        : 'none';
  }

  if (emptyIgnore) {
    emptyIgnore.style.display =
      activeTab === 'IGNORED' && filteredData.length === 0
        ? 'block'
        : 'none';
  }

  // ------------------------------------------------------------
  // Formatage
  // ------------------------------------------------------------
  
const formatDate = value => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const formatted = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris'
  }).format(date);

  // Première lettre du mois en majuscule
  return formatted.replace(
    /(\d{2}\s+)([a-zà-ÿ])/i,
    (match, prefix, letter) => prefix + letter.toLocaleUpperCase('fr-FR')
  );
};


  // Arrondi à l'euro uniquement pour l'affichage
  const formatEuro = value => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    const number = Number(value);
    if (!Number.isFinite(number)) return '—';

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(Math.round(number));
  };

  // Hausse exprimée en euros, et non en pourcentage
  const formatVariation = value => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    const number = Number(value);
    if (!Number.isFinite(number)) return '—';

    const rounded = Math.round(number);
    const formatted = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(Math.abs(rounded));

    if (rounded > 0) return `+${formatted} €`;
    if (rounded < 0) return `-${formatted} €`;
    return '0 €';
  };

  const setText = (card, selector, value) => {
    const element = card.querySelector(selector);
    if (element) element.textContent = value ?? '';
  };

  const cleanText = value => {
    if (value === null || value === undefined) return '';

    return String(value)
      .replace(/[\r\n\t]+/g, ' ')
      .trim();
  };

  // ------------------------------------------------------------
  // Événements API09
  // Même règle que les cartes API02 :
  // event.start_date === item.date
  // ------------------------------------------------------------
  const events = Array.isArray(window.tarifZenEventsData)
    ? window.tarifZenEventsData
    : [];

  const getEventIcon = impact => {
    const normalized = cleanText(impact).toLocaleLowerCase('fr-FR');

    if (normalized === 'fort') return '🔥';
    if (normalized === 'moyen') return '⚡';
    if (normalized === 'faible') return '📅';

    return '📅';
  };

  // ------------------------------------------------------------
  // Création des cartes
  // ------------------------------------------------------------
  filteredData.forEach(item => {
    const card = template.cloneNode(true);

    card.removeAttribute('id');
    card.dataset.tzHistoryGenerated = 'true';
    card.style.display =
      template.dataset.historyTemplateDisplay || 'block';

    // Dates
    
const formatRecommendationDate = value => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris'
  }).format(date);

  // Majuscule au jour et au mois
  return formatted.replace(
    /^([a-zà-ÿ]+)(\s+\d{2}\s+)([a-zà-ÿ])/i,
    (match, weekday, separator, month) =>
      weekday.charAt(0).toLocaleUpperCase('fr-FR') +
      weekday.slice(1) +
      separator +
      month.toLocaleUpperCase('fr-FR')
  );
};

setText(
  card,
  '#date-reco-historic',
  formatRecommendationDate(item.date)
);

    // Libellé adapté au type d'action
const dateLabel = card.querySelector('.text-block-151');

if (dateLabel) {
  dateLabel.textContent = item.action === 'IGNORED'
    ? 'Ignorée le :'
    : 'Appliquée le :';
}

// Date de traitement de l'action
setText(
  card,
  '#date-application-historic',
  formatDate(item.created_at)
);

    // Titre original de la recommandation
    const title = cleanText(item.title);

    setText(
      card,
      '#titre-action-historic',
      title || (
        item.rule_code
          ? `Action historique — ${item.rule_code}`
          : 'Action historique'
      )
    );


// ======================================================
// MESSAGE ORIGINAL + GAINS AFFICHÉS DANS LE MESSAGE
// ======================================================

// Message court utilisé sur la mini-carte
const originalMessage = item.message
  ? String(item.message).trim()
  : '';

// Message long destiné à la popup d'information
const longMessage = item.long_message
  ? String(item.long_message).trim()
  : originalMessage;

console.log('[API07] Messages disponibles pour la popup :', {
  message: item.message,
  long_message: item.long_message,
  keys: Object.keys(item),
  messageLength: item.message?.length,
  longMessageLength: item.long_message?.length
});

// Normalisation du message court affiché sur la carte
const normalizedOriginalMessage = originalMessage
  .replace(/\r\n/g, '\n')
  .replace(/\r/g, '\n')
  .replace(/\n+/g, '\n')
  .replace(
    /(Augmentation\s+de[^\n]*)\n\s*(Tarif\s+cible\s*:[^\n]*)/i,
    '$1 $2'
  );

const messageElement = card.querySelector('#text-reco-historic');

// ======================================================
// MESSAGE COMPLET TRANSMIS À LA POPUP D'INFORMATION
// ======================================================

const historyInfoIcon = card.querySelector(
  '.icon-info-mini, .icon-info-carte, .info-trigger, .info'
);

if (historyInfoIcon) {
  historyInfoIcon.setAttribute(
    'data-message',
    longMessage
  );

  historyInfoIcon.setAttribute(
    'data-date',
    item.date || ''
  );
}

console.log('[API07] Message transmis à la popup :', {
  iconFound: !!historyInfoIcon,
  messageLength: historyInfoIcon?.getAttribute('data-message')?.length,
  message: historyInfoIcon?.getAttribute('data-message')
});

// ======================================================
// AFFICHAGE DU MESSAGE COURT SUR LA CARTE HISTORIQUE
// ======================================================

if (messageElement) {
  const messageLines = [
    normalizedOriginalMessage ||
      'Détail de la recommandation indisponible.'
  ];

  const potentialGain = Number(item.gain_potential);

  if (
    item.gain_potential !== null &&
    item.gain_potential !== undefined &&
    item.gain_potential !== '' &&
    Number.isFinite(potentialGain)
  ) {
    messageLines.push(
      `Gain potentiel estimé : ${formatEuro(potentialGain)}.`
    );
  }

  const realGain = Number(item.gain_real);

  if (
    item.gain_real !== null &&
    item.gain_real !== undefined &&
    item.gain_real !== '' &&
    Number.isFinite(realGain) &&
    realGain > 0
  ) {
    messageLines.push(
      `Gain réel constaté : ${formatEuro(realGain)}.`
    );
  }

  const escapeHtml = text => String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const messageWithLineBreaks = messageLines
    .map(line => escapeHtml(line))
    .join('\n');

  messageElement.innerHTML = formatShortMessage(messageWithLineBreaks);
  messageElement.style.whiteSpace = 'normal';

  if (Number.isFinite(potentialGain) && potentialGain > 0) {
    messageElement.querySelectorAll('div').forEach(line => {
      if (line.textContent.includes('Gain potentiel estimé :')) {
        line.innerHTML = line.innerHTML.replace(
          /(Gain potentiel estimé\s*:\s*)(.*)/i,
          '$1<span style="color:#27ae60;font-weight:600;">$2</span>'
        );
      }
    });
  }

  if (Number.isFinite(realGain) && realGain > 0) {
    messageElement.querySelectorAll('div').forEach(line => {
      if (line.textContent.includes('Gain réel constaté :')) {
        line.innerHTML = line.innerHTML.replace(
          /(Gain réel constaté\s*:\s*)(.*)/i,
          '$1<span style="color:#27ae60;font-weight:600;">$2</span>'
        );
      }
    });
  }
}

    // Prix et hausses : arrondis uniquement à l'affichage
    setText(card, '#prix-avant-historic', formatEuro(item.price_before));
    setText(card, '#prix-apres-historic', formatEuro(item.price_after));

    setText(
      card,
      '#hausse-recommandee-historic',
      formatVariation(item.recommended_price_change)
    );

    setText(
      card,
      '#hausse-appliquee-historic',
      formatVariation(item.applied_price_change)
    );

    // Gains
    setText(card, '#gain-potentiel-historic', formatEuro(item.gain_potential));
    setText(card, '#gain-reel-historic', formatEuro(item.gain_real));

    // Restrictions : ignorer les chaînes qui ne contiennent que des espaces
    const appliedRestriction = cleanText(item.applied_restriction);
    const recommendedRestriction = cleanText(item.recommended_restriction);
    const restriction = appliedRestriction || recommendedRestriction;

    const restrictionElement = card.querySelector('#restriction-historic');

    if (restrictionElement) {
      restrictionElement.textContent = restriction;
      restrictionElement.style.display = restriction ? '' : 'none';
    }

    // Événement : uniquement icône + nom, sans dates
    const eventElement = card.querySelector('#event-historic');

    if (eventElement) {
      const matchedEvent = events.find(
        event => event.start_date === item.date
      );

      if (matchedEvent) {
        const eventName = cleanText(matchedEvent.name);
        const eventIcon = getEventIcon(matchedEvent.impact);

        eventElement.textContent = eventName
          ? `${eventIcon} ${eventName}`
          : '';

        eventElement.style.display = eventName ? '' : 'none';
      } else {
        eventElement.textContent = '';
        eventElement.style.display = 'none';
      }
    }

    // Score RM d'origine
    const scoreElement = card.querySelector('#text-score-rm-historic');

    if (scoreElement) {
      const score = item.score_rm;

      scoreElement.textContent =
        score !== null &&
        score !== undefined &&
        score !== '' &&
        Number.isFinite(Number(score))
          ? String(Number(score))
          : '—';
    }

    // Badges de priorité
    // Règle TarifZen : priorité <= 5 = rouge ; priorité >= 6 = orange
    const orangeBadge = card.querySelector('#badge-rm-orange-historic');
    const redBadge = card.querySelector('#badge-rm-rouge-historic');

    if (orangeBadge) orangeBadge.style.display = 'none';
    if (redBadge) redBadge.style.display = 'none';

    const priority = Number(item.priority);
    const hasPriority =
      item.priority !== null &&
      item.priority !== undefined &&
      item.priority !== '' &&
      Number.isFinite(priority);

    
if (hasPriority) {
  if (priority <= 5) {
    if (redBadge) redBadge.style.display = 'block';
  } else {
    if (orangeBadge) orangeBadge.style.display = 'block';
  }
}


    container.appendChild(card);
  });

  console.log('[API07] Cartes affichées :', {
    onglet: activeTab,
    count: filteredData.length,
    events_count: events.length
  });
}
/* ============================================================
   API07 — INITIALISATION DE L'HISTORIQUE
   ============================================================ */
async function initHistory() {
  try {
    // 1. Vérifier la session Supabase
    const {
      data: { session },
      error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
      console.warn('[API07] Aucune session Supabase active.');
      return;
    }

    // 2. Récupérer le profil utilisateur
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
        '[API07] Impossible de récupérer le profil utilisateur :',
        userError?.message
      );
      return;
    }

    // 3. Déterminer le hotel_id
    let targetHotelId = userData.hotel_id;

    if (userData.role === 'FOUNDER') {
      const match = window.location.pathname.match(/\/hotels\/([^/]+)/);
      const urlSlug = match
        ? decodeURIComponent(match[1]).trim()
        : '';

      if (!urlSlug) {
        console.error('[API07] Aucun slug hôtel trouvé dans l’URL.');
        return;
      }

      targetHotelId = await getHotelIdFromSlug(urlSlug);
    }

    if (!targetHotelId) {
      console.error('[API07] Impossible de déterminer le hotel_id.');
      return;
    }

    // 4. Préparer les en-têtes authentifiés
    const cleanToken = String(session.access_token || '').trim();

    if (!cleanToken) {
      console.error('[API07] Aucun access_token disponible.');
      return;
    }

    const requestHeaders = {
      Accept: 'application/json',
      Authorization: `Bearer ${cleanToken}`
    };

    // 5. Récupérer l'historique API07
    const historyResponse = await fetch(
      `${API_BASE_URL}/api/v1/history?hotel_id=${encodeURIComponent(targetHotelId)}`,
      {
        method: 'GET',
        headers: requestHeaders
      }
    );

    const historyResult = await historyResponse.json();

    if (!historyResponse.ok) {
      throw new Error(
        historyResult?.details ||
        historyResult?.error ||
        `Erreur API07 HTTP ${historyResponse.status}`
      );
    }

    const historyData = Array.isArray(historyResult?.data)
      ? historyResult.data
      : [];

    // Conserver les données pour les changements d'onglet
    window.tarifZenHistoryData = historyData;

    console.log('[API07] Historique chargé :', {
      hotel_id: targetHotelId,
      count: historyData.length,
      data: historyData
    });

    console.table(
  historyData.map(item => ({
    action: item.action,
    recommendation_id: item.recommendation_id,
    date: item.date,
    created_at: item.created_at,
    title: item.title
  }))
);

console.log('[API07] Répartition des actions :', {
  APPLIED: historyData.filter(item => item.action === 'APPLIED').length,
  IGNORED: historyData.filter(item => item.action === 'IGNORED').length,
  autres: historyData.filter(
    item => !['APPLIED', 'IGNORED'].includes(item.action)
  ).length
});

    // 6. Charger les événements API09 pour le même hôtel
    // Une erreur API09 ne doit pas empêcher l'affichage de l'historique.
    let allEvents = [];

    try {
      const eventsResponse = await fetch(
        `${API_BASE_URL}/api/v1/events?hotel_id=${encodeURIComponent(targetHotelId)}`,
        {
          method: 'GET',
          headers: requestHeaders
        }
      );

      const eventsResult = await eventsResponse.json();

      if (!eventsResponse.ok) {
        throw new Error(
          eventsResult?.details ||
          eventsResult?.error ||
          `Erreur API09 HTTP ${eventsResponse.status}`
        );
      }

      const eventData = eventsResult?.data || {};

      allEvents = [
        ...(Array.isArray(eventData.upcoming) ? eventData.upcoming : []),
        ...(Array.isArray(eventData.ongoing) ? eventData.ongoing : []),
        ...(Array.isArray(eventData.past) ? eventData.past : [])
      ];

      window.tarifZenEventsData = allEvents;

      console.log('[API09] Événements chargés pour l’historique :', {
        hotel_id: targetHotelId,
        count: allEvents.length,
        events: allEvents
      });

    } catch (eventsError) {
      window.tarifZenEventsData = [];

      console.error(
        '[API09] Impossible de charger les événements de l’historique :',
        eventsError.message
      );
    }

    
    
    // 7. Afficher les actions appliquées par défaut
    renderHistory(historyData, 'APPLIED');

    
    // 8. Afficher les actions ignorées lors de l'ouverture de l'onglet Webflow
    const ignoredTabLink = document.querySelector(
      '.w-tab-link[href="#w-tabs-2-data-w-pane-1"]'
    );

    if (ignoredTabLink) {
      ignoredTabLink.addEventListener('click', () => {
        renderHistory(window.tarifZenHistoryData, 'IGNORED');
      });
    } else {
      console.warn('[API07] Lien Webflow de l’onglet "Autres" introuvable.');
    }



  } catch (error) {
    console.error('[API07] Erreur de chargement :', error.message);
  }
}

/* ============================================================
   LANCEMENT AU CHARGEMENT DU DOM
   ============================================================ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initEventsPage();
    initHistory();
  });
} else {
  initDashboard();
  initEventsPage();
  initHistory();
}
})();
