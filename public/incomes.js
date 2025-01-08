const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login';
}

const incomeModal = new bootstrap.Modal(document.getElementById('incomeModal'));
let editing = false;

async function loadIncomes() {
    try {
        const response = await fetch('/api/incomes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch incomes');
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
        console.error('Error:', error);
        alert('Failed to load incomes');
    }
}

// Handle form submission
document.getElementById('incomeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
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
            body: JSON.stringify({ description, amount })
        });

        if (!response.ok) {
            throw new Error('Failed to save income');
        }

        incomeModal.hide();
        loadIncomes();
        resetForm();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save income');
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

        document.getElementById('modalTitle').textContent = 'Edit Income';
        editing = true;
        incomeModal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load income details');
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
        console.error('Error:', error);
        alert('Failed to delete income');
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