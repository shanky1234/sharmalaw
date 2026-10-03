(() => {
  const form = document.querySelector('#fee-calculator');
  if (!form) return;

  const forum = document.querySelector('#forum');
  const applicantType = document.querySelector('#applicant-type');
  const applicantRow = document.querySelector('#applicant-row');
  const amountLabel = document.querySelector('#amount-label');
  const amountInput = document.querySelector('#claim-amount');
  const amountHelp = document.querySelector('#amount-help');
  const resultKicker = document.querySelector('#result-kicker');
  const feeValue = document.querySelector('#fee-value');
  const resultAmount = document.querySelector('#result-amount');
  const breakdown = document.querySelector('#calculation-breakdown');
  const registryNote = document.querySelector('#registry-note');
  const rupee = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const lakh = 100000;

  const definitions = {
    'drat-appeal': {
      label: 'DRAT — Appeal under Section 20',
      input: 'Amount appealed against (₹)',
      help: 'Use the amount appealed against, including the amount determined by the DRT where applicable.',
      note: 'A statutory deposit under the applicable Act may be separate from the filing fee. This calculator does not calculate any pre-deposit.',
    },
    'drt-oa': {
      label: 'DRT — Original Application',
      input: 'Claim amount (₹)',
      help: 'Enter the total claim amount used for the Original Application. The calculator rounds additional lakhs upward where the schedule says “or part thereof.”',
      note: 'This estimate does not decide tribunal jurisdiction, limitation, valuation or the correct filing procedure.',
    },
    sarfaesi: {
      label: 'SARFAESI — Section 17 / Section 18',
      input: 'Debt due amount (₹)',
      help: 'Enter the debt due amount relevant to the application or appeal. Applicant category affects the Rule 13 fee.',
      note: 'A Section 18 appeal may require a separate statutory pre-deposit. It is not included in this filing-fee estimate.',
    },
  };

  function parseAmount(value) {
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    const amount = Number(cleaned);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }

  function displayMoney(value) {
    return `₹${rupee.format(Math.round(value))}`;
  }

  function partialLakhs(value) {
    return Math.ceil(value / lakh);
  }

  function calculateDRATOA(amount) {
    if (amount < 10 * lakh) {
      return { fee: 12000, rule: 'Rule 8(2): claim below ₹10 lakh — flat filing fee of ₹12,000.' };
    }
    if (amount < 30 * lakh) {
      return { fee: 20000, rule: 'Rule 8(2): ₹10 lakh to below ₹30 lakh — flat filing fee of ₹20,000.' };
    }
    return { fee: 30000, rule: 'Rule 8(2): ₹30 lakh and above — flat filing fee of ₹30,000.' };
  }

  function calculateDRTOriginalApplication(amount) {
    if (amount <= 10 * lakh) {
      return { fee: 12000, rule: 'Rule 7(2): up to ₹10 lakh — flat filing fee of ₹12,000.' };
    }
    const additionalLakhs = partialLakhs(amount - 10 * lakh);
    const fee = Math.min(150000, 12000 + additionalLakhs * 1000);
    const cap = fee === 150000 ? ' The ₹1,50,000 maximum has been applied.' : '';
    return { fee, rule: `Rule 7(2): ₹12,000 + ₹1,000 × ${additionalLakhs} additional lakh(s), rounded up for a part thereof.${cap}` };
  }

  function calculateSarfaesi(amount, applicant) {
    const borrower = applicant === 'borrower';
    const baseFee = borrower ? 5000 : 1250;
    const rate = borrower ? 250 : 125;
    const underTenRate = borrower ? 500 : 125;
    const maximum = borrower ? 100000 : 50000;
    const role = borrower ? 'borrower' : 'other aggrieved party';

    if (amount < 10 * lakh) {
      const countedLakhs = partialLakhs(amount);
      return { fee: countedLakhs * underTenRate, rule: `Rule 13: ${role} — ₹${underTenRate} × ${countedLakhs} lakh(s), rounded up for a part thereof.` };
    }
    const additionalLakhs = partialLakhs(amount - 10 * lakh);
    const fee = Math.min(maximum, baseFee + additionalLakhs * rate);
    const cap = fee === maximum ? ` The ₹${rupee.format(maximum)} maximum has been applied.` : '';
    return { fee, rule: `Rule 13: ${role} — ₹${rupee.format(baseFee)} + ₹${rate} × ${additionalLakhs} additional lakh(s), rounded up for a part thereof.${cap}` };
  }

  function currentEstimate() {
    const type = forum.value;
    const amount = parseAmount(amountInput.value);
    if (!amount) return null;
    if (type === 'drt-oa') return calculateDRTOriginalApplication(amount);
    if (type === 'sarfaesi') return calculateSarfaesi(amount, applicantType.value);
    return calculateDRATOA(amount);
  }

  function setForumState() {
    const details = definitions[forum.value];
    const isSarfaesi = forum.value === 'sarfaesi';
    applicantRow.hidden = !isSarfaesi;
    amountLabel.firstChild.textContent = `${details.input}\n              `;
    amountHelp.textContent = details.help;
    resultKicker.textContent = details.label;
    registryNote.textContent = details.note;
    updateResult();
  }

  function updateResult() {
    const amount = parseAmount(amountInput.value);
    const estimate = currentEstimate();
    if (!estimate) {
      feeValue.textContent = '₹—';
      resultAmount.textContent = 'Enter an amount to calculate.';
      breakdown.textContent = 'The applicable fee rule will appear here.';
      return;
    }
    feeValue.textContent = displayMoney(estimate.fee);
    resultAmount.textContent = `Based on an amount of ${displayMoney(amount)}.`;
    breakdown.textContent = estimate.rule;
  }

  function applyQueryString() {
    const value = new URLSearchParams(window.location.search).get('forum');
    if (value && definitions[value]) forum.value = value;
  }

  forum.addEventListener('change', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('forum', forum.value);
    window.history.replaceState({}, '', url);
    setForumState();
  });
  applicantType.addEventListener('change', updateResult);
  amountInput.addEventListener('input', updateResult);
  form.addEventListener('submit', (event) => { event.preventDefault(); updateResult(); });
  amountInput.addEventListener('blur', () => {
    const amount = parseAmount(amountInput.value);
    if (amount) amountInput.value = rupee.format(Math.round(amount));
  });

  applyQueryString();
  setForumState();
})();
