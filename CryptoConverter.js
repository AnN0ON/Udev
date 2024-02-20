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
    amountFromInput.value = ''; // Clear the amount input field
    amountFromValue = ''; // Reset the amount value
    resultEl.innerText = ''; // Clear the result text
    validate();
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
    "SATS": ["SHARDS", "GEMSTONE"],
    "SHARDS": ["GEMSTONE"],
    "GEMSTONE": ["SHARDS","SATS"]
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
        case 'SATS':
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
        case 'SATS':
            if (inputAmount < 0) {
                errorMessage.textContent = 'Negative values are not allowed for SATS';
                resultEl.innerText = ''; // Clear the result element if there are error messages
            }
            break;
        case 'SHARDS':
            if (inputAmount < 0 || inputAmount % 100 !== 0) {
                errorMessage.textContent = 'SHARDS amount must be greater than 0 and multiple of 100 ( ex: 100,200,300)';
                resultEl.innerText = ''; // Clear the result element if there are error messages
            }
            break;
        case 'GEMSTONE':
            if (inputAmount < 0 || !Number.isInteger(inputAmount)) {
                errorMessage.textContent = 'GEMSTONE amount must be greater than 0 without decimals';
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
function preciseDivision(dividend, divisor, precision) {
    const multiplier = Math.pow(10, precision);
    const result = (dividend * multiplier) / divisor;
    return Math.round(result) / multiplier;
}

function convert(fromCurrency, toCurrency, amount) {
    const satsToShardsRate = 0.05;
    const shardsToGemstoneRate = 100;
    const satsToGemstoneRate = 2000;

    if (fromCurrency === "SATS" && toCurrency === "SHARDS") {
        // Calculate the previous multiple of 2000 SATS
        const previousMultiple = Math.floor(amount / satsToGemstoneRate) * satsToGemstoneRate;
        // Calculate the number of SHARDS based on the previous multiple of 2000 SATS
        const shards = Math.floor(previousMultiple * satsToShardsRate);
        // Round down the number of SHARDS to the nearest hundred
        const roundedShards = Math.floor(shards / 100) * 100;
        return roundedShards;
    } else if (fromCurrency === "SHARDS" && toCurrency === "SATS") {
        // Convert SHARDS to SATS and remove trailing zeros
        return parseFloat((amount / satsToShardsRate).toFixed(8)).toString();
    } else if (fromCurrency === "SHARDS" && toCurrency === "GEMSTONE") {
        // Calculate the number of GEMSTONE based on the SHARDS amount
        const gemstones = Math.floor(amount / shardsToGemstoneRate);
        // Round down the number of GEMSTONE to the nearest integer
        return Math.floor(gemstones);
    } else if (fromCurrency === "GEMSTONE" && toCurrency === "SHARDS") {
        // Convert GEMSTONE to SHARDS
        return (amount * shardsToGemstoneRate).toFixed(2);
    } else if (fromCurrency === "GEMSTONE" && toCurrency === "SATS") {
        // Convert GEMSTONE to SATS
        return (amount * satsToGemstoneRate);
    } else if (fromCurrency === "SATS" && toCurrency === "GEMSTONE") {
        // Calculate the number of GEMSTONE based on the SATS amount
        const gemstones = Math.floor(amount / satsToGemstoneRate);
        return gemstones;
    } else {
        return null;
    }
}
