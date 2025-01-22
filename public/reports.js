const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login';
}

let incomeChart, expenseChart, comparisonChart;

async function fetchData() {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
        const currentYear = currentDate.getFullYear();

        const [incomesResponse, expensesResponse, reportResponse] = await Promise.all([
            fetch('/api/incomes', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('/api/expenses', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`/api/reports/${currentMonth}/${currentYear}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const [incomes, expenses] = await Promise.all([
            incomesResponse.json(),
            expensesResponse.json()
        ]);

        let report;
        if (reportResponse.ok) {
            report = await reportResponse.json();
        } else {
            report = await createMonthlyReport(currentMonth, currentYear, incomes, expenses);
        }

        return processData(incomes, expenses, report);
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function createMonthlyReport(month, year, incomes, expenses) {
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const plannedBudget = totalIncome;

    const incomeCategories = Object.entries(groupByCategory(incomes))
        .map(([category, amount]) => ({
            category,
            planned: amount,
            actual: amount
        }));

    const expenseCategories = Object.entries(groupByCategory(expenses))
        .map(([category, amount]) => ({
            category,
            planned: amount,
            actual: amount
        }));

    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                month,
                year,
                budget: {
                    planned: plannedBudget,
                    income: incomeCategories,
                    expense: expenseCategories
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create report');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating report:', error);
        return null;
    }
}

function processData(incomes, expenses, report) {
    const incomesByCategory = groupByCategory(incomes);
    const expensesByCategory = groupByCategory(expenses);

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
        incomeData: incomesByCategory,
        expenseData: expensesByCategory,
        budget: {
            totalIncome,
            totalExpense,
            remaining: totalIncome - totalExpense,
            planned: totalIncome,
            actualRemaining: totalIncome - totalExpense
        },
        report
    };
}

function groupByCategory(items) {
    const grouped = {};
    items.forEach(item => {
        grouped[item.category] = (grouped[item.category] || 0) + item.amount;
    });
    return grouped;
}

function updateBudgetInfo(budgetData) {
    const budgetInfo = document.getElementById('budgetInfo');
    budgetInfo.innerHTML = `
        <div class="d-flex justify-content-between mb-2">
            <span>Total Income:</span>
            <span>$${budgetData.totalIncome.toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
            <span>Total Expenses:</span>
            <span>$${budgetData.totalExpense.toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Remaining Budget:</span>
            <span class="${budgetData.remaining >= 0 ? 'positive' : 'negative'}">
                $${budgetData.remaining.toFixed(2)}
            </span>
        </div>
    `;
}

function createCharts(data) {
    // Income Pie Chart
    const incomeCtx = document.getElementById('incomeChart').getContext('2d');
    if (incomeChart) incomeChart.destroy();
    incomeChart = new Chart(incomeCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(data.incomeData),
            datasets: [{
                data: Object.values(data.incomeData),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income by Category'
                }
            }
        }
    });

    // Expense Pie Chart
    const expenseCtx = document.getElementById('expenseChart').getContext('2d');
    if (expenseChart) expenseChart.destroy();
    expenseChart = new Chart(expenseCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(data.expenseData),
            datasets: [{
                data: Object.values(data.expenseData),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expenses by Category'
                }
            }
        }
    });

    // Comparison Bar Chart
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    if (comparisonChart) comparisonChart.destroy();
    comparisonChart = new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: ['Income vs Expenses'],
            datasets: [
                {
                    label: 'Income',
                    data: [data.budget.totalIncome],
                    backgroundColor: '#36A2EB'
                },
                {
                    label: 'Expenses',
                    data: [data.budget.totalExpense],
                    backgroundColor: '#FF6384'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Income vs Expenses Comparison'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function updateDashboard() {
    const data = await fetchData();
    if (data) {
        updateBudgetInfo(data.budget);
        createCharts(data);
    }
}

document.getElementById('periodSelect').addEventListener('change', updateDashboard);

updateDashboard();