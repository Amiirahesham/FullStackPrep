import { fetchCurrencyData } from './api.js';

const domElements = {
    inputDiv: document.getElementById('base-currency'),
    btn: document.getElementById('fetch-btn'),
    status: document.getElementById('status-message'),
    list: document.getElementById('rates-list')
};

const renderData = (rates) => {
    const { list } = domElements;
    list.innerHTML = '';
    
    const ratesArray = Object.entries(rates);
    const [...topRates] = ratesArray.slice(0, 10);
    
    const listItems = topRates.map(([currencyCode, rateValue]) => {
        return `<li><span>${currencyCode}</span><span>${rateValue}</span></li>`;
    });
    
    list.innerHTML = listItems.join('');
};

const handleFetchEvent = async () => {
    const { inputDiv, btn, status, list } = domElements;
    const base = inputDiv.value.trim().toUpperCase();
    
    btn.disabled = true;
    status.textContent = "Loading data...";
    status.className = "loading";
    list.innerHTML = '';

    try {
        const fetchedData = await fetchCurrencyData(base);
        const { rates } = fetchedData;
        const completeRatesObj = { ...rates };
        
        status.textContent = "";
        status.className = "";
        
        renderData(completeRatesObj);
    } catch (error) {
        status.textContent = error.message;
        status.className = "error";
    } finally {
        btn.disabled = false;
    }
};

domElements.btn.addEventListener('click', handleFetchEvent);