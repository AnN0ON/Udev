const bodyEl = document.querySelector('body');
const resultEl = document.querySelector('#result');
const currencyFromSelect = document.querySelector('#currencyFrom');
const amountFromInput = document.querySelector('#amountFrom');
const currencyToSelect = document.querySelector('#currencyTo');

let currencyFromValue = currencyFromSelect.value;
let amountFromValue = amountFromInput.value;
let currencyToValue = currencyToSelect.value;

currencyFromSelect.addEventListener('change', () => {
    currencyFromValue = currencyFromSelect.value;
    bodyEl.className = '';
    bodyEl.classList.add(currencyFromSelect.value);
    updateCurrencyToOptions(); // Ensure this function call is here
    validate();
});

amountFromInput.addEventListener('change', () => {
    amountFromValue = amountFromInput.value;
    validate();
});

currencyToSelect.addEventListener('change', () => {
    currencyToValue = currencyToSelect.value;
    validate();
});

// Define the available conversion options based on the first selection
const conversionOptions = {
    "ETH": ["SHARDS", "GEMSTONE"],
    "SHARDS": ["GEMSTONE"],
    "GEMSTONE": ["ETH"]
};

// Update the options available in the second selection dropdown based on the first selection
function updateCurrencyToOptions() {
    const fromCurrency = currencyFromSelect.value;
    const toOptions = conversionOptions[fromCurrency];
    
    // Remove existing options
    currencyToSelect.innerHTML = '';
    
    // Add new options
    toOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        currencyToSelect.appendChild(optionElement);
    });

    // Dispatch a change event on currencyToSelect
    currencyToSelect.dispatchEvent(new Event('change'));
}

// Pre-fill options in currencyToSelect on page load
updateCurrencyToOptions();

// Check input values and submit or show message.
function validate() {
    if (
        currencyFromValue !== '' &&
        amountFromValue !== '' &&
        currencyToValue !== ''
    ) {
        submit();
    } else {
        resultEl.innerText = 'Select some currencies and an amount to convert';
    }
}

// Multiplies two floats without losing precision.
function multFloats(x, y) {
    if (String(x).length > 1 && String(y).length > 1) {
        const xP = String(x).split('.')[1].length;
        const yP = String(y).split('.')[1].length;
        const _x = x * (Math.pow(10, xP));
        const _y = y * (Math.pow(10, yP));  
        return (_x * _y) / Math.pow(10, xP + yP);
    } else {
        return x * y;
    }  
}

function formatFloat(number) {
    // Check if the input is a number
    if (typeof number !== 'number') {
        return null; // Return null if input is not a number
    }

    // Convert the number to a string
    let strNumber = number.toString();

    // Check if the number already has two decimal places
    if (strNumber.includes('.')) {
        const decimalCount = strNumber.split('.')[1].length;
        if (decimalCount === 2) {
            return strNumber; // Return the number as is if it already has two decimal places
        } else if (decimalCount === 1) {
            return strNumber + '0'; // Add one more zero decimal place if it has one decimal place
        } else {
            return strNumber; // Return the number as is if it has more than two decimal places
        }
    } else {
        // Add two decimal places if the number doesn't have any decimals
        return strNumber + '.00';
    }
}

function convert(fromCurrency, toCurrency, amount) {
    // Define exchange rates
    const ethToShardsRate = 100 / 0.00050; // Calculate the rate dynamically
    const gemstoneToShardsRate = 100; // 1 unit of GEMSTONE is worth 100 SHARDS
    const gemstoneToEthRate = 0.0005; // 1 GEMSTONE is worth 0.0005 ETH

    // Conversion logic
    if (fromCurrency === toCurrency) {
        return amount.toFixed(2); // Return the amount formatted as a float with two decimal places if converting to the same currency
    } else if (fromCurrency === "ETH" && toCurrency === "SHARDS") {
        // Calculate how many shards the amount of ETH is worth
        return (amount * ethToShardsRate).toFixed(2);
    } else if (fromCurrency === "GEMSTONE" && toCurrency === "SHARDS") {
        // Calculate how many shards the amount of GEMSTONE is worth
        return (amount * gemstoneToShardsRate).toFixed(2);
    } else if (fromCurrency === "ETH" && toCurrency === "GEMSTONE") {
        // Convert ETH to SHARDS, then SHARDS to GEMSTONE
        return ((amount * ethToShardsRate) / gemstoneToShardsRate).toFixed(2);
    } else if (fromCurrency === "SHARDS" && toCurrency === "ETH") {
        // Convert SHARDS to ETH
        return (amount / ethToShardsRate / 100).toFixed(8);
    } else if (fromCurrency === "SHARDS" && toCurrency === "GEMSTONE") {
        // Calculate how many gemstones the amount of SHARDS is worth
        return (amount / gemstoneToShardsRate).toFixed(2);
    } else if (fromCurrency === "GEMSTONE" && toCurrency === "ETH") {
        // Convert GEMSTONE to SHARDS, then SHARDS to ETH
        return ((amount * gemstoneToShardsRate) / ethToShardsRate / 100).toFixed(8);
    } else {
        return null; // Return null for unsupported conversions
    }
}

// Setup variables with result info and do request.
function submit() {
    const inputAmount = parseFloat(amountFromValue);
    const fromText = `${amountFromValue} ${currencyFromValue}`;
    const resultAmount = convert(currencyFromValue, currencyToValue, inputAmount);
    const toText = `${resultAmount} ${currencyToValue}`;
    resultEl.innerText = `${fromText} = ${toText}`;
}
