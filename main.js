import { animate } from 'motion';
import Chart from 'chart.js/auto';

// Global variables for charts to destroy and recreate if necessary
let costsChartInstance = null;
let osChartInstance = null;

// Currency Formatter Helper
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// 1. Unified Navigation Controller
// Maps desktop sidebar IDs to mobile bottom nav targets and vice-versa
const SECTION_META = {
  'visao-geral': {
    title: 'Visão Geral',
    subtitle: 'Plataforma Inteligente de Gestão Operacional',
    mobileGroup: 'geral'
  },
  'video-demonstrativo': {
    title: 'Vídeo Demonstrativo',
    subtitle: 'Apresentação Prática do Sistema',
    mobileGroup: 'geral'
  },
  'desafios': {
    title: 'Desafios & Solução',
    subtitle: 'Ecossistema Integrado NEXUS',
    mobileGroup: 'geral'
  },
  'modulos': {
    title: 'Módulos da Plataforma',
    subtitle: 'Explorando os Módulos do Sistema',
    mobileGroup: 'modulos'
  },
  'powerbi': {
    title: 'Simulador Power BI',
    subtitle: 'Acompanhamento Executivo em Tempo Real',
    mobileGroup: 'graficos'
  },
  'roi': {
    title: 'Retorno e ROI',
    subtitle: 'Viabilidade Financeira e Ganhos Anuais',
    mobileGroup: 'periodo'
  },
  'cronograma': {
    title: 'Cronograma',
    subtitle: 'Plano de Implantação e Futuro',
    mobileGroup: 'periodo'
  },
  'investimento': {
    title: 'Investimento',
    subtitle: 'Valores e Contratação do Serviço',
    mobileGroup: 'investimento'
  }
};

// Mobile group → which sidebar section to highlight as active
const MOBILE_GROUP_PRIMARY_SECTION = {
  'geral': 'visao-geral',
  'modulos': 'modulos',
  'graficos': 'powerbi',
  'periodo': 'roi',
  'investimento': 'investimento'
};

// Mobile group → section IDs to show
const MOBILE_GROUP_SECTIONS = {
  'geral': ['visao-geral', 'video-demonstrativo', 'desafios'],
  'modulos': ['modulos'],
  'graficos': ['powerbi'],
  'periodo': ['roi', 'cronograma'],
  'investimento': ['investimento']
};

// Core navigation: show one or more sections, hide the rest
// sectionIds = array of section IDs to show
const showSections = (sectionIds) => {
  const allSections = document.querySelectorAll('.content-section');
  allSections.forEach(sec => {
    const shouldShow = sectionIds.includes(sec.id);
    // Always clear any inline display/opacity so CSS + class can take over
    sec.style.removeProperty('display');
    sec.style.removeProperty('opacity');
    if (shouldShow) {
      sec.classList.add('active');
      animate(
        sec,
        { opacity: [0, 1], y: [10, 0] },
        { duration: 0.4, easing: 'ease-out' }
      );
    } else {
      sec.classList.remove('active');
    }
  });

  // Re-render charts when Power BI section is shown
  if (sectionIds.includes('powerbi')) {
    renderCharts();
  }

  // Scroll to top
  const wrapper = document.querySelector('.content-wrapper');
  if (wrapper) wrapper.scrollTo({ top: 0, behavior: 'smooth' });
};

const initNavigation = () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sectionTitleDisplay = document.querySelector('.section-title-display');
  const sectionSubtitleDisplay = document.querySelector('.section-subtitle-display');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = item.getAttribute('data-target');
      if (!targetId) return;

      // Update active state on sidebar nav
      navItems.forEach(nav => {
        nav.classList.remove('active');
        nav.setAttribute('aria-selected', 'false');
      });
      item.classList.add('active');
      item.setAttribute('aria-selected', 'true');

      // Update header text
      const meta = SECTION_META[targetId];
      if (meta && sectionTitleDisplay) sectionTitleDisplay.textContent = meta.title;
      if (meta && sectionSubtitleDisplay) sectionSubtitleDisplay.textContent = meta.subtitle;

      // Show section
      showSections([targetId]);

      // Sync mobile bottom nav active state
      if (meta) {
        syncMobileNav(meta.mobileGroup);
      }
    });
  });

  // Watch Video CTA handler
  const watchVideoBtns = document.querySelectorAll('.btn-watch-video');
  watchVideoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target') || 'video-demonstrativo';
      const navItem = document.querySelector(`.nav-item[data-target="${targetId}"]`);
      if (navItem) {
        navItem.click();
      }
    });
  });
};

// 2. Modules Sub-Tabs Controller
const initModulesTabs = () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const tabNavigation = document.querySelector('.tab-navigation');

  const switchTab = (btn) => {
    const targetTabId = btn.getAttribute('data-tab');
    
    // Update active tab buttons and aria-selected states
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.focus();
    
    // Update active tab pane
    tabPanes.forEach(pane => {
      pane.classList.remove('active');
    });
    
    const activePane = document.getElementById(targetTabId);
    activePane.classList.add('active');
    
    // Animate pane content fade
    animate(
      activePane,
      { opacity: [0, 1] },
      { duration: 0.3 }
    );
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn));
  });

  // Keyboard navigation for sub-tabs (Arrow keys)
  if (tabNavigation) {
    tabNavigation.addEventListener('keydown', (e) => {
      const activeBtn = document.activeElement;
      if (!activeBtn || !activeBtn.classList.contains('tab-btn')) return;

      const btnArray = Array.from(tabBtns);
      const index = btnArray.indexOf(activeBtn);
      let targetIndex = null;

      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % btnArray.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + btnArray.length) % btnArray.length;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        switchTab(btnArray[targetIndex]);
      }
    });
  }
};

// 3. Power BI Mock Charts Initialization
const renderCharts = () => {
  const colors = {
    brandDark: '#3b1670',
    brandMedium: '#7C3AED',
    brandLight: '#A78BFA',
    brandPastel: '#DAB3E6',
    brandTint: '#C084FC',
    textMain: '#F3EFFA',
    textMuted: '#9E96B7',
  };

  // Cost by sector chart (Doughnut)
  const costsCtx = document.getElementById('costsChart');
  if (costsCtx) {
    if (costsChartInstance) {
      costsChartInstance.destroy();
    }
    costsChartInstance = new Chart(costsCtx, {
      type: 'doughnut',
      data: {
        labels: ['Manutenção', 'Limpeza', 'Segurança', 'Almoxarifado', 'Operação Geral'],
        datasets: [{
          data: [35, 25, 20, 12, 8],
          backgroundColor: [
            colors.brandDark,
            colors.brandMedium,
            colors.brandLight,
            colors.brandPastel,
            colors.brandTint
          ],
          borderColor: 'rgba(9, 6, 22, 0.8)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: colors.textMain,
              font: { family: 'Outfit', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#15112e',
            titleColor: '#fff',
            bodyColor: colors.textMuted,
            borderColor: colors.brandMedium,
            borderWidth: 1
          }
        }
      }
    });
  }

  // OS open vs closed ratio (Bar Chart)
  const osCtx = document.getElementById('osRatioChart');
  if (osCtx) {
    if (osChartInstance) {
      osChartInstance.destroy();
    }
    osChartInstance = new Chart(osCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
          {
            label: 'OS Resolvidas',
            data: [115, 130, 155, 178, 205, 248],
            backgroundColor: colors.brandMedium,
            borderRadius: 4,
          },
          {
            label: 'OS Pendentes (Backlog)',
            data: [32, 28, 22, 19, 16, 14],
            backgroundColor: colors.brandPastel,
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: colors.textMuted,
              font: { family: 'Outfit' }
            }
          },
          y: {
            grid: { color: 'rgba(180, 152, 222, 0.1)' },
            ticks: {
              color: colors.textMuted,
              font: { family: 'Outfit' }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: colors.textMain,
              font: { family: 'Outfit', size: 12 }
            }
          },
          tooltip: {
            backgroundColor: '#15112e',
            titleColor: '#fff',
            bodyColor: colors.textMuted,
            borderColor: colors.brandMedium,
            borderWidth: 1
          }
        }
      }
    });
  }

  // Animate numeric KPIs in Power BI section
  animateValue('bi-disponibilidade', 90, 98.4, 1500, '%');
  animateValue('bi-mttr', 5.5, 2.8, 1500, 'h');
  animateValue('bi-sla', 88, 97.2, 1500, '%');
  animateValue('bi-backlog', 45, 14, 1500, '');
};

// Numeric KPIs animation helper
const animateValue = (id, start, end, duration, suffix = '') => {
  const obj = document.getElementById(id);
  if (!obj) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Smooth transition
    let val = progress * (end - start) + start;
    
    // Check if it's float or int
    if (end % 1 === 0) {
      obj.innerHTML = Math.floor(val) + suffix;
    } else {
      obj.innerHTML = val.toFixed(1) + suffix;
    }
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

// 4. ROI Calculator Logic
const initRoiCalculator = () => {
  const costInput = document.getElementById('monthly-cost-input');
  const calcSavingsEl = document.getElementById('calc-savings');
  const calcNetReturnEl = document.getElementById('calc-net-return');
  const calcRoiEl = document.getElementById('calc-roi');

  if (!costInput) return;

  const calculate = () => {
    const monthlyCost = parseFloat(costInput.value) || 0;
    const annualCost = monthlyCost * 12;
    
    // Nexus Investment Details
    const nexusSetup = 2500;
    const nexusMonthly = 1500;
    const nexusAnnualTotal = nexusSetup + (nexusMonthly * 12); // R$ 20.500
    
    // Assuming 20% average savings based on the 10-30% range mentioned in slides
    const savingsRate = 0.20;
    const annualSavings = annualCost * savingsRate;
    const netReturn = annualSavings - nexusAnnualTotal;
    
    // Calculate ROI
    const roiPercentage = nexusAnnualTotal > 0 ? (netReturn / nexusAnnualTotal) * 100 : 0;

    // Display updates
    calcSavingsEl.textContent = formatCurrency(annualSavings);
    calcNetReturnEl.textContent = formatCurrency(netReturn);
    
    // Format net return color
    if (netReturn >= 0) {
      calcNetReturnEl.className = 'calc-value text-good bold-text';
    } else {
      calcNetReturnEl.className = 'calc-value text-bad bold-text';
    }

    // Format ROI string
    if (roiPercentage >= 0) {
      calcRoiEl.textContent = `${roiPercentage.toFixed(1)}%`;
      calcRoiEl.className = 'calc-value text-highlight font-large bold-text';
    } else {
      calcRoiEl.textContent = `${roiPercentage.toFixed(1)}%`;
      calcRoiEl.className = 'calc-value text-bad font-large bold-text';
    }
  };

  // Recalculate on user input
  costInput.addEventListener('input', calculate);
  
  // Initial calculation
  calculate();
};

// 5. Proposal Acceptance Workflow
const initProposalAcceptance = () => {
  const acceptBtns = document.querySelectorAll('.btn-accept-proposal');
  const modal = document.getElementById('accept-modal');
  const closeModalBtn = document.querySelector('.btn-close-modal');
  const modalCloseX = document.querySelector('.modal-close-btn');
  const statusBadge = document.querySelector('.status-badge');

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.classList.remove('menu-open');
  };

  acceptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Show modal
      modal.classList.add('active');
      
      // 2. Trigger particles explosion
      triggerConfetti();
      
      // 3. Update top status badge to approved state
      if (statusBadge) {
        statusBadge.className = 'status-badge approved';
        const statusText = statusBadge.querySelector('.status-text');
        if (statusText) {
          statusText.textContent = 'Proposta Aprovada!';
        }
      }
    });
  });

  // Close modal when clicking on the overlay backdrop, close X, or bottom close button
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.modal-close-btn') || e.target.closest('.btn-close-modal')) {
      closeModal();
    }
  });

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
};

// Custom lightweight particle burst for celebrations
const triggerConfetti = () => {
  const colors = ['#8859B5', '#B498DE', '#DAB3E6', '#10b981', '#38bdf8', '#ff70a6'];
  const particleCount = 100;
  
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-particle';
    
    // Random styling
    const size = Math.random() * 8 + 6;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.position = 'fixed';
    p.style.top = '50%';
    p.style.left = '50%';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    p.style.zIndex = '9999';
    p.style.pointerEvents = 'none';
    
    document.body.appendChild(p);

    // Random trajectory
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 300 + 100;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance + (Math.random() * 100 + 100); // add gravity drop

    // Animate particle explosion using Motion
    animate(
      p,
      {
        x: [0, destX],
        y: [0, destY],
        opacity: [1, 0],
        scale: [1, 0.2],
        rotate: [0, Math.random() * 720 - 360]
      },
      {
        duration: Math.random() * 1.5 + 1.0,
        easing: 'ease-out'
      }
    ).then(() => {
      // Remove element when finished
      p.remove();
    });
  }
};

// Helper: sync mobile bottom nav active button (called by desktop nav too)
const syncMobileNav = (mobileGroup) => {
  const mobileMenuItems = document.querySelectorAll('.menu.mobile-nav .menu__item');
  mobileMenuItems.forEach(btn => {
    const target = btn.getAttribute('data-target');
    const isActive = target === mobileGroup;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    const text = btn.querySelector('.menu__text');
    if (text) text.classList.toggle('active', isActive);
    if (isActive) {
      btn.style.setProperty('--lineWidth', text ? `${text.offsetWidth}px` : '0px');
    } else {
      btn.style.setProperty('--lineWidth', '0px');
    }
  });
};

// Helper: sync desktop sidebar nav active link (called by mobile nav too)
const syncDesktopNav = (primarySectionId) => {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(nav => {
    const isActive = nav.getAttribute('data-target') === primarySectionId;
    nav.classList.toggle('active', isActive);
    nav.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
};

// 6. Mobile Bottom Navigation Controller
const initMobileNavigation = () => {
  const mobileMenuItems = document.querySelectorAll('.menu.mobile-nav .menu__item');
  const sectionTitleDisplay = document.querySelector('.section-title-display');
  const sectionSubtitleDisplay = document.querySelector('.section-subtitle-display');

  const mobileHeaders = {
    'geral': { title: 'Visão Geral', subtitle: 'Plataforma Inteligente de Gestão Operacional' },
    'modulos': { title: 'Módulos da Plataforma', subtitle: 'Explorando os Módulos do Sistema' },
    'graficos': { title: 'Simulador Power BI', subtitle: 'Acompanhamento Executivo em Tempo Real' },
    'periodo': { title: 'Retorno & Cronograma', subtitle: 'Viabilidade e Plano de Implantação' },
    'investimento': { title: 'Investimento', subtitle: 'Valores e Contratação do Serviço' }
  };

  mobileMenuItems.forEach(item => {
    item.addEventListener('click', () => {
      const mobileGroup = item.getAttribute('data-target');
      if (!mobileGroup) return;

      // Update mobile nav active state
      syncMobileNav(mobileGroup);

      // Update header
      const header = mobileHeaders[mobileGroup];
      if (header) {
        if (sectionTitleDisplay) sectionTitleDisplay.textContent = header.title;
        if (sectionSubtitleDisplay) sectionSubtitleDisplay.textContent = header.subtitle;
      }

      // Show sections
      const sectionIds = MOBILE_GROUP_SECTIONS[mobileGroup] || [];
      showSections(sectionIds);

      // Sync desktop sidebar nav
      const primarySection = MOBILE_GROUP_PRIMARY_SECTION[mobileGroup];
      if (primarySection) syncDesktopNav(primarySection);
    });
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 820) {
      syncMobileNav(
        document.querySelector('.menu.mobile-nav .menu__item.active')?.getAttribute('data-target') || 'geral'
      );
    }
  });

  // Initial state: on mobile, ensure only the active mobile group's sections are visible
  if (window.innerWidth <= 820) {
    const activeBtn = document.querySelector('.menu.mobile-nav .menu__item.active');
    const mobileGroup = activeBtn?.getAttribute('data-target') || 'geral';
    const sectionIds = MOBILE_GROUP_SECTIONS[mobileGroup] || ['visao-geral'];
    showSections(sectionIds);
    if (sectionTitleDisplay && mobileHeaders[mobileGroup]) {
      sectionTitleDisplay.textContent = mobileHeaders[mobileGroup].title;
    }
    setTimeout(() => syncMobileNav(mobileGroup), 100);
  }
};

// 7. Global initialization on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModulesTabs();
  initRoiCalculator();
  initProposalAcceptance();
  initMobileNavigation();
  
  // Render Power BI charts on startup (but hidden until active)
  renderCharts();
  
  // Entry animations for sidebar (desktop only) and main hero card
  if (window.innerWidth > 820) {
    animate(
      '.sidebar',
      { x: [-100, 0], opacity: [0, 1] },
      { duration: 0.5, easing: 'ease-out' }
    );
  }
  
  animate(
    '.hero-card',
    { scale: [0.95, 1], opacity: [0, 1] },
    { duration: 0.6, easing: 'ease-out', delay: 0.2 }
  );
});
