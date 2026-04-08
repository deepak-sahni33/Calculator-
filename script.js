let currentMode = 'calc';
let exchangeRates = {};
const defaultCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CNY', 'CHF', 'SGD'];

class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.isResult = false;
    }

    delete() {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        if (this.currentOperand === '0' || this.isResult) return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') this.clear();
        if (this.isResult) {
            this.currentOperand = '';
            this.isResult = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') this.clear();
        if (this.currentOperand === '') {
            if (this.previousOperand !== '') {
                this.operation = operation;
            }
            return;
        }
        if (this.previousOperand !== '') {
            this.compute(false); 
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.isResult = false;
    }

    applyPercent() {
        if (this.currentOperand === 'Error' || this.currentOperand === '') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
    }

    compute(isEqualPress = true) {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    this.isResult = true;
                    return;
                }
                computation = prev / current;
                break;
            default: return;
        }
        computation = Math.round(computation * 10000000000) / 10000000000;
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        if (isEqualPress) this.isResult = true;
    }

    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';
        const stringNumber = number.toString();
        if (stringNumber === '') return '';
        
        if (stringNumber.includes('e')) return parseFloat(stringNumber).toExponential(4);
        
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (stringNumber.startsWith('-') && integerDigits === 0) {
             integerDisplay = '-' + integerDisplay;
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        // Update Calculator Display
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        if (this.currentOperandTextElement.innerText.length > 9) {
            this.currentOperandTextElement.style.fontSize = '2.5rem';
        } else if (this.currentOperandTextElement.innerText.length > 6) {
            this.currentOperandTextElement.style.fontSize = '3rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '4rem';
        }

        if (this.operation != null) {
            this.previousOperandTextElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }

        // Trigger currency conversion if active
        if (currentMode === 'currency') {
            updateCurrencyConversion();
        }
    }
}

// Selectors
const numberButtons = document.querySelectorAll('.number');
const operatorButtons = document.querySelectorAll('.operator');
const equalsButton = document.querySelector('#equals');
const deleteButton = document.querySelector('#delete');
const clearButton = document.querySelector('#clear');
const percentButton = document.querySelector('[data-action="percent"]');
const previousOperandTextElement = document.querySelector('#previous-operand');
const currentOperandTextElement = document.querySelector('#current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Event Listeners
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});
percentButton.addEventListener('click', () => {
    calculator.applyPercent();
    calculator.updateDisplay();
});
equalsButton.addEventListener('click', () => {
    calculator.compute(true);
    calculator.updateDisplay();
});
clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});
deleteButton.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Keyboard Support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') { calculator.appendNumber(e.key); calculator.updateDisplay(); }
    if (e.key === '.') { calculator.appendNumber(e.key); calculator.updateDisplay(); }
    if (e.key === '=' || e.key === 'Enter') { e.preventDefault(); calculator.compute(true); calculator.updateDisplay(); }
    if (e.key === 'Backspace') { calculator.delete(); calculator.updateDisplay(); }
    if (e.key === 'Escape') { calculator.clear(); calculator.updateDisplay(); }
    if (e.key === '*' || e.key === 'x') { calculator.chooseOperation('×'); calculator.updateDisplay(); }
    if (e.key === '/') { e.preventDefault(); calculator.chooseOperation('÷'); calculator.updateDisplay(); }
    if (e.key === '+' || e.key === '-') { calculator.chooseOperation(e.key); calculator.updateDisplay(); }
    if (e.key === '%') { calculator.applyPercent(); calculator.updateDisplay(); }
});

// Currency Converter Logic
const tabs = document.querySelectorAll('.tab');
const calcDisplay = document.getElementById('calc-display');
const currencyDisplay = document.getElementById('currency-display');
const fromSelect = document.getElementById('currency-from');
const toSelect = document.getElementById('currency-to');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.target;
        
        if (currentMode === 'currency') {
            calcDisplay.style.display = 'none';
            currencyDisplay.style.display = 'flex';
            if (Object.keys(exchangeRates).length === 0) fetchRates();
            calculator.updateDisplay();
        } else {
            calcDisplay.style.display = 'flex';
            currencyDisplay.style.display = 'none';
        }
    });
});

async function fetchRates() {
    document.getElementById('exchange-rate-info').innerText = 'Loading rates...';
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        exchangeRates = data.rates;
        populateCurrencyDropdowns();
        calculator.updateDisplay();
        document.getElementById('exchange-rate-info').innerText = `Rates updated: ${new Date().toLocaleDateString()}`;
    } catch (e) {
        document.getElementById('exchange-rate-info').innerText = 'Failed to load rates. Use internet connection.';
    }
}

function populateCurrencyDropdowns() {
    // Get all currencies provided by the API and sort them alphabetically
    const availableCurrencies = Object.keys(exchangeRates).sort();
    
    // Reset dropdowns
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    
    availableCurrencies.forEach(currency => {
        fromSelect.add(new Option(currency, currency));
        toSelect.add(new Option(currency, currency));
    });
    
    // Set some defaults
    if(availableCurrencies.includes('USD')) fromSelect.value = 'USD';
    if(availableCurrencies.includes('INR')) toSelect.value = 'INR'; else if (availableCurrencies.includes('EUR')) toSelect.value = 'EUR';
}

function updateCurrencyConversion() {
    const fromCurr = fromSelect.value;
    const toCurr = toSelect.value;
    
    if (!fromCurr || !toCurr || Object.keys(exchangeRates).length === 0) return;
    
    let baseAmount = parseFloat(calculator.currentOperand);
    if (isNaN(baseAmount)) baseAmount = 0;
    
    const rateFrom = exchangeRates[fromCurr] || 1;
    const rateTo = exchangeRates[toCurr] || 1;
    
    // Convert to target currency
    const usdAmount = baseAmount / rateFrom;
    const finalAmount = usdAmount * rateTo;
    
    // Check if it's got decimals, nicely round it
    let resultDisplay = finalAmount;
    if (finalAmount % 1 !== 0) {
        resultDisplay = parseFloat(finalAmount.toFixed(4));
    }
    
    document.getElementById('currency-from-value').innerText = calculator.getDisplayNumber(calculator.currentOperand);
    document.getElementById('currency-to-value').innerText = resultDisplay.toLocaleString('en', { maximumFractionDigits: 4 });
}

fromSelect.addEventListener('change', () => calculator.updateDisplay());
toSelect.addEventListener('change', () => calculator.updateDisplay());
