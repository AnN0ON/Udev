const bodyEl = document.querySelector('body');
const resultEl = document.querySelector('#result');
const currencyFromSelect = document.querySelector('#currencyFrom');
const amountFromInput = document.querySelector('#amountFrom');
const currencyToSelect = document.querySelector('#currencyTo');
const errorMessage = document.querySelector('#error-message');

let currencyFromValue = currencyFromSelect.value;
let amountFromValue = amountFromInput.value;
let currencyToValue = currencyToSelect.value;

// Update currencyFromValue on page load
window.addEventListener('DOMContentLoaded', () => {
    currencyFromValue = currencyFromSelect.value;
    currencyFromSelect.dispatchEvent(new Event('change')); // Trigger change event after setting initial value
});

// Update currencyFromValue on page load
currencyFromSelect.addEventListener('DOMContentLoaded', () => {
    currencyFromValue = currencyFromSelect.value;
    bodyEl.className = '';
    bodyEl.classList.add(currencyFromSelect.value);
    updateCurrencyToOptions();
    adjustAmountFieldValidation();
    validate();
});

currencyFromSelect.addEventListener('change', () => {
    currencyFromValue = currencyFromSelect.value;
    bodyEl.className = '';
    bodyEl.classList.add(currencyFromSelect.value);
    updateCurrencyToOptions();
    adjustAmountFieldValidation();
    validate();
    amountFromInput.value = '';
});

amountFromInput.addEventListener('input', () => {
    amountFromValue = amountFromInput.value;
    validateAmount();
});

currencyToSelect.addEventListener('change', () => {
    currencyToValue = currencyToSelect.value;
    validate();
});

const conversionOptions = {
    "ETH": ["SHARDS", "GEMSTONE"],
    "SHARDS": ["GEMSTONE"],
    "GEMSTONE": ["ETH"]
};

function updateCurrencyToOptions() {
    const fromCurrency = currencyFromSelect.value;
    const toOptions = conversionOptions[fromCurrency];
    currencyToSelect.innerHTML = '';
    toOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        currencyToSelect.appendChild(optionElement);
    });
    currencyToSelect.dispatchEvent(new Event('change'));
}

function adjustAmountFieldValidation() {
    const amountInput = document.querySelector('#amountFrom');
    switch (currencyFromValue) {
        case 'ETH':
            amountInput.min = '0';
            amountInput.step = 'any';
            amountInput.pattern = '\\d*\\.?\\d*';
            break;
        case 'SHARDS':
            amountInput.min = '0';
            amountInput.step = '100';
            amountInput.pattern = '\\d*';
            break;
        case 'GEMSTONE':
            amountInput.min = '0';
            amountInput.step = '1';
            amountInput.pattern = '\\d*';
            break;
        default:
            break;
    }
}

function validate() {
    if (
        currencyFromValue !== '' &&
        amountFromValue !== '' &&
        currencyToValue !== ''
    ) {
        submit();
    } else {
        errorMessage.textContent = '';
        resultEl.innerText = 'Select some currencies and an amount to convert';
    }
}

function validateAmount() {
    errorMessage.textContent = ''; // Clear any previous error message
    const inputAmount = parseFloat(amountFromValue);

    // Check if the amount is a valid number
    if (isNaN(inputAmount)) {
        errorMessage.textContent = 'Invalid input: Please enter a valid number';
        resultEl.innerText = ''; // Clear the result element if there are error messages
        return;
    }

    // Check if the amount is non-negative based on the selected currency
    switch (currencyFromValue) {
        case 'ETH':
            if (inputAmount < 0) {
                errorMessage.textContent = 'Negative values are not allowed for ETH';
                resultEl.innerText = ''; // Clear the result element if there are error messages
            }
            break;
        case 'SHARDS':
            if (inputAmount < 0 || inputAmount % 100 !== 0) {
                errorMessage.textContent = 'SHARDS amount must be a non-negative multiple of 100';
                resultEl.innerText = ''; // Clear the result element if there are error messages
            }
            break;
        case 'GEMSTONE':
            if (inputAmount < 0 || !Number.isInteger(inputAmount)) {
                errorMessage.textContent = 'GEMSTONE amount must be a non-negative integer';
                resultEl.innerText = ''; // Clear the result element if there are error messages
            }
            break;
        default:
            break;
    }

    // Validate overall form after checking amount
    validate();
}

function submit() {
    if (errorMessage.textContent === '') {
        const inputAmount = parseFloat(amountFromValue);
        const fromText = `${amountFromValue} ${currencyFromValue}`;
        const resultAmount = convert(currencyFromValue, currencyToValue, inputAmount);
        const toText = `${resultAmount} ${currencyToValue}`;
        resultEl.innerText = `${fromText} = ${toText}`;
    }
}

function convert(fromCurrency, toCurrency, amount) {
    const ethToShardsRate = 100 / 0.00050;
    const gemstoneToShardsRate = 100;
    const gemstoneToEthRate = 0.0005;

    if (fromCurrency === toCurrency) {
        return amount.toFixed(2);
    } else if (fromCurrency === "ETH" && toCurrency === "SHARDS") {
        const roundedAmount = Math.floor(amount / 0.00050) * 0.00050;
        return (roundedAmount * ethToShardsRate).toFixed(2);
    } else if (fromCurrency === "GEMSTONE" && toCurrency === "SHARDS") {
        return (amount * gemstoneToShardsRate).toFixed(2);
    } else if (fromCurrency === "ETH" && toCurrency === "GEMSTONE") {
        return ((amount * ethToShardsRate) / gemstoneToShardsRate).toFixed(2);
    } else if (fromCurrency === "SHARDS" && toCurrency === "ETH") {
        return (amount / ethToShardsRate / 100).toFixed(8);
    } else if (fromCurrency === "SHARDS" && toCurrency === "GEMSTONE") {
        return (amount / gemstoneToShardsRate).toFixed(2);
    } else if (fromCurrency === "GEMSTONE" && toCurrency === "ETH") {
        return ((amount * gemstoneToShardsRate) / ethToShardsRate / 100).toFixed(8);
    } else {
        return null;
    }
}
