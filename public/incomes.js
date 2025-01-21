const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login';
}

const incomeModal = new bootstrap.Modal(document.getElementById('incomeModal'));
let editing = false;

async function handleApiError(error, defaultMessage) {
    console.error('Error:', error);

    try {
        const errorData = await error.json();
        if (errorData.error?.code === 'DATABASE_UNAVAILABLE') {
            const errorHtml = `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>Service Temporarily Unavailable</strong>
                    <p>${errorData.message}</p>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            const container = document.querySelector('.container');
            container.insertAdjacentHTML('afterbegin', errorHtml);
        } else {
            alert(defaultMessage);
        }
    } catch (e) {
        alert(defaultMessage);
    }
}

async function loadIncomes() {
    try {
        const response = await fetch('/api/incomes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw response;
        }

        const incomes = await response.json();
        const incomesList = document.getElementById('incomesList');
        incomesList.innerHTML = '';

        incomes.forEach(income => {
            const date = new Date(income.date).toLocaleDateString();
            incomesList.innerHTML += `
                <div class="list-group-item income-item d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${income.description}</h5>
                        <small class="text-muted">Category: ${income.category}</small><br>
                        <small>Date: ${date}</small>
                    </div>
                    <div>
                        <span class="fs-5 me-3">$${income.amount.toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editIncome('${income._id}')">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteIncome('${income._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        await handleApiError(error, 'Failed to load incomes');
    }
}

// Handle form submission
document.getElementById('incomeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const incomeId = document.getElementById('incomeId').value;

    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/incomes/${incomeId}` : '/api/incomes';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description, amount, category })
        });

        if (!response.ok) {
            throw new Error('Failed to save income');
        }

        incomeModal.hide();
        loadIncomes();
        resetForm();
    } catch (error) {
        await handleApiError(error, 'Failed to save income');
    }
});

// Edit income
async function editIncome(id) {
    try {
        const response = await fetch(`/api/incomes/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch income');
        }

        const income = await response.json();

        document.getElementById('incomeId').value = income._id;
        document.getElementById('description').value = income.description;
        document.getElementById('amount').value = income.amount;
        document.getElementById('category').value = income.category;

        document.getElementById('modalTitle').textContent = 'Edit Income';
        editing = true;
        incomeModal.show();
    } catch (error) {
        await handleApiError(error, 'Failed to load income details');
    }
}

// Delete income
async function deleteIncome(id) {
    if (!confirm('Are you sure you want to delete this income?')) {
        return;
    }

    try {
        const response = await fetch(`/api/incomes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete income');
        }

        loadIncomes();
    } catch (error) {
        await handleApiError(error, 'Failed to delete income');
    }
}

document.getElementById('incomeModal').addEventListener('hidden.bs.modal', resetForm);

function resetForm() {
    document.getElementById('incomeForm').reset();
    document.getElementById('incomeId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Income';
    editing = false;
}

loadIncomes();