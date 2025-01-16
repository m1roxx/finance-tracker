const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login';
}

const expenseModal = new bootstrap.Modal(document.getElementById('expenseModal'));
let editing = false;

async function loadExpenses() {
    try {
        const response = await fetch('/api/expenses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch expenses');
        }

        const expenses = await response.json();
        const expensesList = document.getElementById('expensesList');
        expensesList.innerHTML = '';

        expenses.forEach(expense => {
            const date = new Date(expense.date).toLocaleDateString();
            expensesList.innerHTML += `
                <div class="list-group-item expense-item d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${expense.description}</h5>
                        <small>Date: ${date}</small>
                    </div>
                    <div>
                        <span class="fs-5 me-3">$${expense.amount.toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editExpense('${expense._id}')">
                            Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense('${expense._id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load expenses');
    }
}

document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const expenseId = document.getElementById('expenseId').value;

    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/expenses/${expenseId}` : '/api/expenses';

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
            throw new Error('Failed to save expense');
        }

        expenseModal.hide();
        loadExpenses();
        resetForm();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save expense');
    }
});

async function editExpense(id) {
    try {
        const response = await fetch(`/api/expenses/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch expense');
        }

        const expense = await response.json();

        document.getElementById('expenseId').value = expense._id;
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;

        document.getElementById('modalTitle').textContent = 'Edit Expense';
        editing = true;
        expenseModal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load expense details');
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }

        loadExpenses();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete expense');
    }
}

document.getElementById('expenseModal').addEventListener('hidden.bs.modal', resetForm);

function resetForm() {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Expense';
    editing = false;
}

loadExpenses();