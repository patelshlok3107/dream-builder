/* ============================================================
   PRICING.JS — Dream Builder AI
   Currency toggle, plan highlighting, CTA interactions
   ============================================================ */

const PLANS = {
  inr: {
    seed:   { amount: '0',    period: '/mo', label: 'Free forever' },
    grind:  { amount: '999',  period: '/mo', label: 'Billed monthly' },
    empire: { amount: '2,999',period: '/mo', label: 'Billed monthly' },
  },
  usd: {
    seed:   { amount: '0',   period: '/mo', label: 'Free forever' },
    grind:  { amount: '12',  period: '/mo', label: 'Billed monthly' },
    empire: { amount: '36',  period: '/mo', label: 'Billed monthly' },
  },
};

const CURRENCY_SYMBOLS = { inr: '₹', usd: '$' };

let currentCurrency = 'inr';

function updatePricing(currency) {
  currentCurrency = currency;
  const plans   = PLANS[currency];
  const symbol  = CURRENCY_SYMBOLS[currency];

  // Update currency symbols
  document.querySelectorAll('.plan-currency').forEach((el, i) => {
    el.textContent = symbol;
  });

  // Update amounts
  const amounts = document.querySelectorAll('.plan-amount');
  const periods = document.querySelectorAll('.plan-period');
  const descs   = document.querySelectorAll('.plan-desc');

  const keys = ['seed', 'grind', 'empire'];
  keys.forEach((key, i) => {
    if (amounts[i]) {
      amounts[i].style.opacity = '0';
      amounts[i].style.transform = 'translateY(8px)';
      setTimeout(() => {
        amounts[i].textContent = plans[key].amount;
        amounts[i].style.opacity = '1';
        amounts[i].style.transform = 'translateY(0)';
      }, 150);
    }
    if (descs[i]) descs[i].textContent = plans[key].label;
  });

  // Toggle UI labels
  document.getElementById('toggle-inr').classList.toggle('active', currency === 'inr');
  document.getElementById('toggle-usd').classList.toggle('active', currency === 'usd');
  document.getElementById('currency-toggle').classList.toggle('usd', currency === 'usd');
}

function initPricing() {
  const toggle = document.getElementById('currency-toggle');
  const inrLabel = document.getElementById('toggle-inr');
  const usdLabel = document.getElementById('toggle-usd');

  if (!toggle) return;

  toggle.addEventListener('click', () => {
    updatePricing(currentCurrency === 'inr' ? 'usd' : 'inr');
  });
  inrLabel?.addEventListener('click', () => updatePricing('inr'));
  usdLabel?.addEventListener('click', () => updatePricing('usd'));

  // Animate amounts on scroll reveal
  const amounts = document.querySelectorAll('.plan-amount');
  amounts.forEach(el => {
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  });

  // Highlight popular plan CTA
  const popularBtn = document.querySelector('.pricing-card.popular .btn-primary');
  if (popularBtn) {
    popularBtn.addEventListener('mouseover', () => {
      popularBtn.style.boxShadow = '0 12px 40px rgba(124,58,237,0.6)';
    });
    popularBtn.addEventListener('mouseout', () => {
      popularBtn.style.boxShadow = '';
    });
  }
}

export { initPricing };
