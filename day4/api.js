export const fetchCurrencyData = async (baseCurrency) => {
    const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error("Failed to fetch currency data. Please check the currency code.");
    }
    
    return response.json();
};