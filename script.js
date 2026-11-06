/**
 * Modern Scientific & Standard Calculator
 * Fully responsive, keyboard supported, audio feedback & history
 */

class ModernCalculator {
  constructor() {
    this.currentInput = '0';
    this.expression = '';
    this.lastResult = null;
    this.isCalculated = false;
    this.memory = 0;
    this.angleMode = 'deg'; // 'deg' or 'rad'
    this.soundEnabled = true;
    this.isScientific = false;
    this.history = this.loadHistory();

    // Web Audio Context for tactile feedback
    this.audioCtx = null;

    this.cacheDom();
    this.bindEvents();
    this.updateDisplay();
    this.renderHistory();
    this.initTheme();
  }

  cacheDom() {
    this.mainDisplay = document.getElementById('main-display');
    this.expressionDisplay = document.getElementById('expression-display');
    this.calculatorContainer = document.querySelector('.calculator-container');
    this.scientificSection = document.getElementById('scientific-section');
    this.modeToggleBtn = document.getElementById('mode-toggle-btn');
    this.modeIndicator = document.getElementById('mode-indicator');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.moonIcon = document.querySelector('.moon-icon');
    this.sunIcon = document.querySelector('.sun-icon');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.soundOnIcon = document.querySelector('.sound-on-icon');
    this.soundOffIcon = document.querySelector('.sound-off-icon');
    this.historyToggleBtn = document.getElementById('history-toggle-btn');
    this.closeHistoryBtn = document.getElementById('close-history-btn');
    this.historyDrawer = document.getElementById('history-drawer');
    this.historyList = document.getElementById('history-list');
    this.clearHistoryBtn = document.getElementById('clear-history-btn');
    this.copyBtn = document.getElementById('copy-btn');
    this.copyTooltip = document.querySelector('.copy-tooltip');
    this.angleModeBtn = document.getElementById('angle-mode-btn');
    this.sciRadToggle = document.getElementById('sci-rad-toggle');
    this.memoryIndicator = document.getElementById('memory-indicator');
  }

  bindEvents() {
    // Keypad clicks (standard & scientific)
    document.querySelector('.calculator-container').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const key = btn.dataset.key;
      const action = btn.dataset.action;

      if (key !== undefined) {
        this.playBeep(btn.classList.contains('op-key') ? 560 : 440);
        this.handleKeyInput(key, btn.classList.contains('op-key'));
      } else if (action) {
        this.playBeep(action === 'calculate' ? 660 : 480);
        this.handleAction(action);
      }
    });

    // Angle mode toggles
    this.angleModeBtn.addEventListener('click', () => this.toggleAngleMode());
    if (this.sciRadToggle) {
      this.sciRadToggle.addEventListener('click', () => this.toggleAngleMode());
    }

    // Header controls
    this.modeToggleBtn.addEventListener('click', () => this.toggleScientificMode());
    this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
    this.historyToggleBtn.addEventListener('click', () => this.toggleHistory(true));
    this.closeHistoryBtn.addEventListener('click', () => this.toggleHistory(false));
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    this.copyBtn.addEventListener('click', () => this.copyToClipboard());

    // Physical Keyboard support
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  // --- Sound Effects (Web Audio API) ---
  playBeep(freq = 440) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.06);
    } catch {
      // Audio might be blocked by browser policy
    }
  }

  // --- Input Handling ---
  handleKeyInput(key, isOperator = false) {
    if (this.isCalculated && !isOperator) {
      // Starting new number after a calculation
      this.currentInput = key === '.' ? '0.' : key;
      this.expression = '';
      this.isCalculated = false;
      this.updateDisplay();
      return;
    }

    if (this.isCalculated && isOperator) {
      this.expression = this.currentInput + ' ' + this.formatOperatorSymbol(key) + ' ';
      this.currentInput = '';
      this.isCalculated = false;
      this.updateDisplay();
      return;
    }

    if (isOperator) {
      this.appendOperator(key);
      return;
    }

    // Number or decimal input
    if (key === '.') {
      if (!this.currentInput.includes('.')) {
        this.currentInput = this.currentInput === '' ? '0.' : this.currentInput + '.';
      }
    } else {
      if (this.currentInput === '0') {
        this.currentInput = key;
      } else {
        this.currentInput += key;
      }
    }

    this.updateDisplay();
  }

  formatOperatorSymbol(op) {
    switch (op) {
      case '*': return '×';
      case '/': return '÷';
      case '-': return '−';
      case '+': return '+';
      default: return op;
    }
  }

  appendOperator(op) {
    const symbol = this.formatOperatorSymbol(op);

    if (this.currentInput !== '') {
      this.expression += this.currentInput + ' ' + symbol + ' ';
      this.currentInput = '';
    } else if (this.expression !== '') {
      // Replace last operator if already ended in an operator
      this.expression = this.expression.trimEnd();
      const lastChar = this.expression.slice(-1);
      if (['+', '−', '×', '÷'].includes(lastChar)) {
        this.expression = this.expression.slice(0, -1) + symbol + ' ';
      } else {
        this.expression += ' ' + symbol + ' ';
      }
    }
    this.updateDisplay();
  }

  handleAction(action) {
    switch (action) {
      case 'all-clear':
        this.clearAll();
        break;
      case 'backspace':
        this.deleteLastDigit();
        break;
      case 'calculate':
        this.calculate();
        break;
      case 'negate':
        this.toggleSign();
        break;
      case 'percent':
        this.applyPercent();
        break;
      case 'parenthesis-open':
        this.appendParenthesis('(');
        break;
      case 'parenthesis-close':
        this.appendParenthesis(')');
        break;
      
      // Scientific actions
      case 'deg-rad':
        this.toggleAngleMode();
        break;
      case 'sin':
      case 'cos':
      case 'tan':
      case 'ln':
      case 'log':
      case 'sqrt':
        this.applyPrefixFunction(action);
        break;
      case 'square':
        this.applyDirectPower(2);
        break;
      case 'power':
        this.appendOperator('^');
        break;
      case 'factorial':
        this.applyFactorial();
        break;
      case 'reciprocal':
        this.applyReciprocal();
        break;
      case 'abs':
        this.applyAbs();
        break;
      case 'pi':
        this.insertConstant(Math.PI);
        break;
      case 'e':
        this.insertConstant(Math.E);
        break;
      case 'exp':
        this.appendExp();
        break;

      // Memory actions
      case 'mc':
        this.memory = 0;
        this.updateMemoryBadge();
        break;
      case 'mr':
        this.currentInput = String(this.memory);
        this.updateDisplay();
        break;
      case 'm-plus':
        this.memory += this.getCurrentValue();
        this.updateMemoryBadge();
        break;
      case 'm-minus':
        this.memory -= this.getCurrentValue();
        this.updateMemoryBadge();
        break;
      case 'ms':
        this.memory = this.getCurrentValue();
        this.updateMemoryBadge();
        break;
    }
  }

  getCurrentValue() {
    const val = parseFloat(this.currentInput);
    return isNaN(val) ? 0 : val;
  }

  updateMemoryBadge() {
    if (this.memory !== 0) {
      this.memoryIndicator.classList.remove('hidden');
      this.memoryIndicator.textContent = `M: ${this.formatNumber(this.memory)}`;
    } else {
      this.memoryIndicator.classList.add('hidden');
    }
  }

  clearAll() {
    this.currentInput = '0';
    this.expression = '';
    this.lastResult = null;
    this.isCalculated = false;
    this.updateDisplay();
  }

  deleteLastDigit() {
    if (this.isCalculated) {
      this.clearAll();
      return;
    }
    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
      if (this.currentInput === '-') this.currentInput = '0';
    } else {
      this.currentInput = '0';
    }
    this.updateDisplay();
  }

  toggleSign() {
    if (this.currentInput === '0' || this.currentInput === '') return;
    if (this.currentInput.startsWith('-')) {
      this.currentInput = this.currentInput.substring(1);
    } else {
      this.currentInput = '-' + this.currentInput;
    }
    this.updateDisplay();
  }

  applyPercent() {
    const val = parseFloat(this.currentInput);
    if (!isNaN(val)) {
      this.currentInput = String(val / 100);
      this.updateDisplay();
    }
  }

  appendParenthesis(paren) {
    if (paren === '(') {
      if (this.currentInput !== '' && this.currentInput !== '0') {
        this.expression += this.currentInput + ' × ( ';
      } else {
        this.expression += '( ';
      }
      this.currentInput = '';
    } else {
      if (this.currentInput !== '') {
        this.expression += this.currentInput + ' ) ';
        this.currentInput = '';
      } else {
        this.expression += ') ';
      }
    }
    this.updateDisplay();
  }

  // --- Scientific Operations ---
  applyPrefixFunction(fn) {
    const val = parseFloat(this.currentInput);
    if (isNaN(val)) return;

    let res = 0;
    try {
      switch (fn) {
        case 'sin':
          res = this.angleMode === 'deg' ? Math.sin((val * Math.PI) / 180) : Math.sin(val);
          // Round floating artifacts for values like sin(180)
          if (Math.abs(res) < 1e-15) res = 0;
          break;
        case 'cos':
          res = this.angleMode === 'deg' ? Math.cos((val * Math.PI) / 180) : Math.cos(val);
          if (Math.abs(res) < 1e-15) res = 0;
          break;
        case 'tan':
          if (this.angleMode === 'deg' && Math.abs(val % 180) === 90) {
            throw new Error('Undefined');
          }
          res = this.angleMode === 'deg' ? Math.tan((val * Math.PI) / 180) : Math.tan(val);
          break;
        case 'ln':
          if (val <= 0) throw new Error('Invalid Input');
          res = Math.log(val);
          break;
        case 'log':
          if (val <= 0) throw new Error('Invalid Input');
          res = Math.log10(val);
          break;
        case 'sqrt':
          if (val < 0) throw new Error('Invalid Input');
          res = Math.sqrt(val);
          break;
      }
      this.saveHistoryItem(`${fn}(${val})`, this.formatNumber(res));
      this.currentInput = String(res);
      this.isCalculated = true;
      this.updateDisplay();
    } catch (err) {
      this.showError(err.message || 'Error');
    }
  }

  applyDirectPower(power) {
    const val = parseFloat(this.currentInput);
    if (isNaN(val)) return;
    const res = Math.pow(val, power);
    this.saveHistoryItem(`${val}²`, this.formatNumber(res));
    this.currentInput = String(res);
    this.isCalculated = true;
    this.updateDisplay();
  }

  applyFactorial() {
    const val = parseInt(this.currentInput, 10);
    if (isNaN(val) || val < 0 || val > 170) {
      this.showError('Invalid Input');
      return;
    }
    let res = 1;
    for (let i = 2; i <= val; i++) res *= i;
    this.saveHistoryItem(`${val}!`, String(res));
    this.currentInput = String(res);
    this.isCalculated = true;
    this.updateDisplay();
  }

  applyReciprocal() {
    const val = parseFloat(this.currentInput);
    if (val === 0 || isNaN(val)) {
      this.showError('Cannot divide by zero');
      return;
    }
    const res = 1 / val;
    this.saveHistoryItem(`1/(${val})`, this.formatNumber(res));
    this.currentInput = String(res);
    this.isCalculated = true;
    this.updateDisplay();
  }

  applyAbs() {
    const val = parseFloat(this.currentInput);
    if (isNaN(val)) return;
    this.currentInput = String(Math.abs(val));
    this.updateDisplay();
  }

  insertConstant(constVal) {
    this.currentInput = String(constVal);
    this.isCalculated = true;
    this.updateDisplay();
  }

  appendExp() {
    if (!this.currentInput.includes('e')) {
      this.currentInput += 'e+0';
      this.updateDisplay();
    }
  }

  toggleAngleMode() {
    this.angleMode = this.angleMode === 'deg' ? 'rad' : 'deg';
    const text = this.angleMode.toUpperCase();
    this.angleModeBtn.textContent = text;
    if (this.sciRadToggle) {
      this.sciRadToggle.textContent = this.angleMode === 'deg' ? 'RAD' : 'DEG';
    }
  }

  // --- Calculation Engine ---
  calculate() {
    let fullExpr = this.expression;
    if (this.currentInput !== '') {
      fullExpr += this.currentInput;
    }

    fullExpr = fullExpr.trim();
    if (!fullExpr) return;

    try {
      // Sanitize and replace display operators with JS operators
      let evalExpr = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**');

      // Auto-close unclosed parentheses
      const openCount = (evalExpr.match(/\(/g) || []).length;
      const closeCount = (evalExpr.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        evalExpr += ')'.repeat(openCount - closeCount);
        fullExpr += ')'.repeat(openCount - closeCount);
      }

      // Check for illegal patterns (prevent arbitrary execution)
      if (/[^0-9+\-*/().\s*eE]/.test(evalExpr.replace(/\*\*/g, ''))) {
        throw new Error('Invalid Expression');
      }

      // Safe evaluation using Function with strictly sanitized string
      const result = Function(`'use strict'; return (${evalExpr})`)();

      if (!isFinite(result) || isNaN(result)) {
        if (result === Infinity || result === -Infinity) {
          throw new Error('Cannot divide by zero');
        }
        throw new Error('Math Error');
      }

      const formattedResult = this.formatNumber(result);
      this.saveHistoryItem(fullExpr, formattedResult);

      this.expression = fullExpr + ' =';
      this.currentInput = String(formattedResult);
      this.isCalculated = true;
      this.updateDisplay();
    } catch (err) {
      this.showError(err.message || 'Error');
    }
  }

  formatNumber(num) {
    if (isNaN(num)) return 'Error';
    // Round to avoid floating point precision quirks (e.g. 0.1 + 0.2)
    const rounded = Math.round((num + Number.EPSILON) * 1e12) / 1e12;
    // For very large or very small numbers, use exponential format
    if (Math.abs(rounded) > 1e14 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
      return rounded.toExponential(6).replace(/\+?0*([0-9]+)$/, '$1');
    }
    return String(rounded);
  }

  showError(msg) {
    this.mainDisplay.textContent = msg;
    this.mainDisplay.style.color = '#ef4444';
    this.isCalculated = true;
    setTimeout(() => {
      this.mainDisplay.style.color = '';
    }, 2000);
  }

  // --- Display & Rendering ---
  updateDisplay() {
    this.expressionDisplay.textContent = this.expression;
    this.mainDisplay.textContent = this.currentInput || '0';

    // Auto adjust font size if text is very long
    const len = this.mainDisplay.textContent.length;
    if (len > 14) {
      this.mainDisplay.style.fontSize = '22px';
    } else if (len > 9) {
      this.mainDisplay.style.fontSize = '28px';
    } else {
      this.mainDisplay.style.fontSize = '';
    }
  }

  // --- UI Toggles & Extras ---
  toggleScientificMode() {
    this.isScientific = !this.isScientific;
    if (this.isScientific) {
      this.scientificSection.classList.remove('hidden');
      this.calculatorContainer.classList.add('scientific-active');
      this.modeIndicator.textContent = 'ON';
      this.modeIndicator.classList.add('active');
      this.angleModeBtn.classList.remove('hidden');
    } else {
      this.scientificSection.classList.add('hidden');
      this.calculatorContainer.classList.remove('scientific-active');
      this.modeIndicator.textContent = 'OFF';
      this.modeIndicator.classList.remove('active');
      this.angleModeBtn.classList.add('hidden');
    }
  }

  initTheme() {
    const saved = localStorage.getItem('calc_theme') || 'dark';
    if (saved === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      this.moonIcon.classList.add('hidden');
      this.sunIcon.classList.remove('hidden');
    }
  }

  toggleTheme() {
    const isLight = document.body.classList.contains('theme-light');
    if (isLight) {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      this.sunIcon.classList.add('hidden');
      this.moonIcon.classList.remove('hidden');
      localStorage.setItem('calc_theme', 'dark');
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      this.moonIcon.classList.add('hidden');
      this.sunIcon.classList.remove('hidden');
      localStorage.setItem('calc_theme', 'light');
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      this.soundOnIcon.classList.remove('hidden');
      this.soundOffIcon.classList.add('hidden');
    } else {
      this.soundOnIcon.classList.add('hidden');
      this.soundOffIcon.classList.remove('hidden');
    }
  }

  toggleHistory(open) {
    if (open) {
      this.historyDrawer.classList.add('open');
      this.historyDrawer.setAttribute('aria-hidden', 'false');
    } else {
      this.historyDrawer.classList.remove('open');
      this.historyDrawer.setAttribute('aria-hidden', 'true');
    }
  }

  async copyToClipboard() {
    const val = this.mainDisplay.textContent;
    try {
      await navigator.clipboard.writeText(val);
      this.copyTooltip.classList.add('show');
      setTimeout(() => {
        this.copyTooltip.classList.remove('show');
      }, 1500);
    } catch {
      // Fallback
    }
  }

  // --- Calculation History ---
  loadHistory() {
    try {
      const data = localStorage.getItem('calc_history');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveHistoryItem(expression, result) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const item = { expression, result, time };
    this.history.unshift(item);
    if (this.history.length > 30) this.history.pop();
    try {
      localStorage.setItem('calc_history', JSON.stringify(this.history));
    } catch {}
    this.renderHistory();
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.historyList.innerHTML = `
        <div class="empty-history">
          <svg style="width:36px;height:36px;opacity:0.4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>No calculation history yet</span>
        </div>
      `;
      return;
    }

    this.historyList.innerHTML = this.history
      .map((item, idx) => `
        <div class="history-item" data-index="${idx}">
          <div class="history-item-header">
            <span>Result</span>
            <span>${item.time}</span>
          </div>
          <div class="history-item-expr">${item.expression}</div>
          <div class="history-item-result">= ${item.result}</div>
        </div>
      `)
      .join('');

    // Attach click to reuse history item
    this.historyList.querySelectorAll('.history-item').forEach((elem) => {
      elem.addEventListener('click', () => {
        const idx = elem.dataset.index;
        const item = this.history[idx];
        if (item) {
          this.currentInput = item.result;
          this.expression = item.expression + ' =';
          this.isCalculated = true;
          this.updateDisplay();
          this.toggleHistory(false);
        }
      });
    });
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
    this.renderHistory();
  }

  // --- Physical Keyboard Binding ---
  handleKeyboard(e) {
    const key = e.key;

    // Visual button press simulation
    const highlightKey = (selector) => {
      const btn = document.querySelector(selector);
      if (btn) {
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 120);
      }
    };

    if (key >= '0' && key <= '9') {
      highlightKey(`.num-key[data-key="${key}"]`);
      this.playBeep(440);
      this.handleKeyInput(key, false);
    } else if (key === '.') {
      highlightKey(`.num-key[data-key="."]`);
      this.playBeep(440);
      this.handleKeyInput('.', false);
    } else if (['+', '-', '*', '/'].includes(key)) {
      highlightKey(`.op-key[data-key="${key}"]`);
      this.playBeep(560);
      this.handleKeyInput(key, true);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      highlightKey(`.equals-key`);
      this.playBeep(660);
      this.calculate();
    } else if (key === 'Backspace') {
      highlightKey(`.footer-btn[data-action="backspace"]`);
      this.playBeep(480);
      this.deleteLastDigit();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
      highlightKey(`.clear-key`);
      this.playBeep(480);
      this.clearAll();
    } else if (key === '(' || key === ')') {
      this.playBeep(480);
      this.appendParenthesis(key);
    } else if (key === '%') {
      this.playBeep(480);
      this.applyPercent();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.calculator = new ModernCalculator();
});
