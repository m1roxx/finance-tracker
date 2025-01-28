const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login';
}

const expenseModal = new bootstrap.Modal(document.getElementById('expenseModal'));
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

async function loadExpenses() {
    try {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const url = categoryFilter
            ? `/api/expenses?category=${encodeURIComponent(categoryFilter)}`
            : '/api/expenses';

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw response;
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
                        <small class="text-muted">Category: ${expense.category}</small><br>
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
        await handleApiError(error, 'Failed to load expenses');
    }
}

document.getElementById('categoryFilter').addEventListener('change', loadExpenses);

document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
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
            body: JSON.stringify({ description, amount, category })
        });

        if (!response.ok) {
            throw new Error('Failed to save expense');
        }

        expenseModal.hide();
        loadExpenses();
        resetForm();
    } catch (error) {
        await handleApiError(error, 'Failed to save expense');
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
        document.getElementById('category').value = expense.category;

        document.getElementById('modalTitle').textContent = 'Edit Expense';
        editing = true;
        expenseModal.show();
    } catch (error) {
        await handleApiError(error, 'Failed to load expense details');
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
        await handleApiError(error, 'Failed to delete expense');
    }
}

document.getElementById('expenseModal').addEventListener('hidden.bs.modal', resetForm);

function resetForm() {
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseId').value = '';
    document.getElementById('modalTitle').textContent = 'Add Expense';
    editing = false;
}

const viewBudgetsModal = new bootstrap.Modal(document.getElementById('viewBudgetsModal'));

async function loadBudgets() {
    try {
        const response = await fetch('/api/budgets', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw response;
        }

        const budgets = await response.json();
        const budgetsList = document.getElementById('budgetsList');
        budgetsList.innerHTML = '';

        budgets.forEach(budget => {
            budgetsList.innerHTML += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${budget.category}</h6>
                        <small class="text-muted">Planned Amount: $${budget.plannedAmount.toFixed(2)}</small>
                    </div>
                    <button class="btn btn-sm btn-danger" 
                            onclick="deleteBudget('${budget.category.replace(/'/g, "\\'")}')">
                        Delete
                    </button>
                </div>
            `;
        });
    } catch (error) {
        await handleApiError(error, 'Failed to load budgets');
    }
}

async function deleteBudget(category) {
    if (!confirm('Are you sure you want to delete this budget?')) {
        return;
    }

    try {
        const encodedCategory = encodeURIComponent(category);
        const response = await fetch(`/api/budgets/${encodedCategory}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw response;
        }

        await loadBudgets();
    } catch (error) {
        await handleApiError(error, 'Failed to delete budget');
    }
}

document.getElementById('viewBudgetsModal').addEventListener('show.bs.modal', loadBudgets);

document.getElementById('budgetForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const category = document.getElementById('budgetCategory').value;
    const plannedAmount = document.getElementById('plannedAmount').value;

    try {
        const response = await fetch('/api/budgets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ categoryId: category, plannedAmount: parseFloat(plannedAmount) })
        });

        if (response.ok) {
            alert('Budget added successfully');
            document.getElementById('budgetForm').reset();
            const budgetModal = bootstrap.Modal.getInstance(document.getElementById('budgetModal'));
            budgetModal.hide();
            loadBudgets();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error adding budget:', error);
        alert('An error occurred while adding the budget');
    }
});

loadExpenses();