document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, confirmPassword }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            if (data.requiresTwoFactor) {
                localStorage.setItem('tempToken', data.tempToken);
                const twoFactorModal = new bootstrap.Modal(document.getElementById('twoFactorModal'));
                twoFactorModal.show();
            } else {
                localStorage.setItem('token', data.token);
                window.location.href = '/settings';
            }
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Something went wrong');
    }
});

document.getElementById('twoFactorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = document.getElementById('verificationCode').value;
    const tempToken = localStorage.getItem('tempToken');

    try {
        const response = await fetch('/api/users/verify-2fa', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tempToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.removeItem('tempToken');
            localStorage.setItem('token', data.token);
            window.location.href = '/settings';
        } else {
            alert(data.message || 'Verification failed');
        }
    } catch (error) {
        console.error('Error during 2FA verification:', error);
        alert('Something went wrong');
    }
});