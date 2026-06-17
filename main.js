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

// 1. Navigation Controller (Tabs & Section Switching)
const initNavigation = () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  const sectionTitleDisplay = document.querySelector('.section-title-display');
  const sectionSubtitleDisplay = document.querySelector('.section-subtitle-display');

  const sectionHeaders = {
    'visao-geral': {
      title: 'Visão Geral',
      subtitle: 'Plataforma Inteligente de Gestão Operacional'
    },
    'desafios': {
      title: 'Desafios & Solução',
      subtitle: 'Ecossistema Integrado NEXUS'
    },
    'modulos': {
      title: 'Módulos da Plataforma',
      subtitle: 'Explorando os Módulos do Sistema'
    },
    'powerbi': {
      title: 'Simulador Power BI',
      subtitle: 'Acompanhamento Executivo em Tempo Real'
    },
    'roi': {
      title: 'Retorno e ROI',
      subtitle: 'Viabilidade Financeira e Ganhos Anuais'
    },
    'cronograma': {
      title: 'Cronograma',
      subtitle: 'Plano de Implantação e Futuro'
    },
    'investimento': {
      title: 'Investimento',
      subtitle: 'Valores e Contratação do Serviço'
    }
  };

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = item.getAttribute('data-target');
      
      // Update active nav class and aria-selected
      navItems.forEach(nav => {
        nav.classList.remove('active');
        nav.setAttribute('aria-selected', 'false');
      });
      item.classList.add('active');
      item.setAttribute('aria-selected', 'true');
      
      // Update section headers
      if (sectionHeaders[targetId]) {
        sectionTitleDisplay.textContent = sectionHeaders[targetId].title;
        sectionSubtitleDisplay.textContent = sectionHeaders[targetId].subtitle;
      }
      
      // Deactivate all sections and reset inline display styles
      sections.forEach(sec => {
        sec.classList.remove('active');
        sec.style.opacity = 0;
        sec.style.display = '';
      });
      
      // Activate target section
      const activeSection = document.getElementById(targetId);
      if (activeSection) {
        activeSection.style.display = '';
        activeSection.classList.add('active');
        
        // Animate Section Fade-In & slide up using Motion
        animate(
          activeSection,
          { opacity: [0, 1], y: [10, 0] },
          { duration: 0.4, easing: 'ease-out' }
        );
      }
      
      // Re-trigger chart animation if switching to Power BI
      if (targetId === 'powerbi') {
        renderCharts();
      }

      // Smooth scroll back to top of container
      document.querySelector('.content-wrapper').scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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

// 6. Mobile Bottom Navigation Controller (Interactive Menu from menumobile.txt)
const initMobileNavigation = () => {
  const mobileMenuItems = document.querySelectorAll('.menu.mobile-nav .menu__item');
  const sections = document.querySelectorAll('.content-section');
  const sectionTitleDisplay = document.querySelector('.section-title-display');

  const updateMobileMenuIndicator = () => {
    const activeItem = document.querySelector('.menu.mobile-nav .menu__item.active');
    if (activeItem) {
      const text = activeItem.querySelector('.menu__text');
      if (text) {
        activeItem.style.setProperty('--lineWidth', `${text.offsetWidth}px`);
      }
    }
  };

  const navigateMobile = (targetLabel) => {
    const headers = {
      'geral': 'Visão Geral',
      'modulos': 'Módulos da Plataforma',
      'graficos': 'Simulador Power BI',
      'periodo': 'Retorno & Cronograma',
      'investimento': 'Investimento'
    };

    if (sectionTitleDisplay && headers[targetLabel]) {
      sectionTitleDisplay.textContent = headers[targetLabel];
    }

    let targetSectionIds = [];
    if (targetLabel === 'geral') {
      targetSectionIds = ['visao-geral', 'desafios'];
    } else if (targetLabel === 'modulos') {
      targetSectionIds = ['modulos'];
    } else if (targetLabel === 'graficos') {
      targetSectionIds = ['powerbi'];
    } else if (targetLabel === 'periodo') {
      targetSectionIds = ['roi', 'cronograma'];
    } else if (targetLabel === 'investimento') {
      targetSectionIds = ['investimento'];
    }

    // Deactivate all sections and hide them
    sections.forEach(sec => {
      sec.classList.remove('active');
      sec.style.opacity = 0;
      sec.style.display = 'none';
    });

    // Activate selected sections
    targetSectionIds.forEach(id => {
      const sec = document.getElementById(id);
      if (sec) {
        sec.style.display = 'block';
        sec.classList.add('active');
        animate(
          sec,
          { opacity: [0, 1], y: [10, 0] },
          { duration: 0.4, easing: 'ease-out' }
        );
      }
    });

    // Re-render charts if switching to Power BI
    if (targetLabel === 'graficos') {
      renderCharts();
    }

    // Scroll wrapper to top
    document.querySelector('.content-wrapper').scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  mobileMenuItems.forEach(item => {
    item.addEventListener('click', () => {
      mobileMenuItems.forEach(b => {
        b.classList.remove('active');
        const text = b.querySelector('.menu__text');
        if (text) text.classList.remove('active');
        b.style.setProperty('--lineWidth', '0px');
      });
      item.classList.add('active');
      const text = item.querySelector('.menu__text');
      if (text) text.classList.add('active');
      
      const target = item.getAttribute('data-target');
      navigateMobile(target);
      updateMobileMenuIndicator();
    });
  });

  // Handle window resize indicator updates
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 820) {
      updateMobileMenuIndicator();
    }
  });

  // Set initial configuration for mobile load
  if (window.innerWidth <= 820) {
    sections.forEach(sec => {
      if (sec.id === 'visao-geral' || sec.id === 'desafios') {
        sec.style.display = 'block';
        sec.style.opacity = 1;
        sec.classList.add('active');
      } else {
        sec.style.display = 'none';
        sec.style.opacity = 0;
        sec.classList.remove('active');
      }
    });
    
    if (sectionTitleDisplay) {
      sectionTitleDisplay.textContent = 'Visão Geral';
    }
    
    setTimeout(updateMobileMenuIndicator, 100);
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
