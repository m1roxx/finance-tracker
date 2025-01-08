const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login';
}

const fetchUserData = async () => {
    try {
        const response = await fetch('/api/users/me', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('welcomeMessage').textContent = `Welcome, ${user.email}!`;
        } else {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
});

// Currency Converter
const BASE_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

async function loadCurrencies() {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        const currencies = Object.keys(data.rates);

        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');

        currencies.forEach(currency => {
            fromSelect.innerHTML += `<option value="${currency}">${currency}</option>`;
            toSelect.innerHTML += `<option value="${currency}">${currency}</option>`;
        });

        fromSelect.value = 'USD';
        toSelect.value = 'KZT';
    } catch (error) {
        console.error('Error loading currencies:', error);
        alert('Failed to load currencies');
    }
}

// Handle currency conversion
document.getElementById('converterForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    try {
        const response = await fetch('/api/currency/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                amount,
                fromCurrency,
                toCurrency
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('convertResult').innerHTML = `
                <div class="alert alert-success">
                    ${amount} ${fromCurrency} = ${data.result} ${toCurrency}
                </div>
            `;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error converting currency:', error);
        document.getElementById('convertResult').innerHTML = `
            <div class="alert alert-danger">
                Failed to convert currency. Please try again.
            </div>
        `;
    }
});

fetchUserData();
loadCurrencies();