/* =============================================
   FinTrack Pro — Application Logic
   ============================================= */
const addtransaction = document.querySelector(".addtransaction");
const model = document.querySelector(".model");
const overlay = document.querySelector(".model .card");
const cross = document.querySelector(".cross");
const dashboard = document.querySelector(".dashboard");
const settings = document.querySelector(".settings");
const todash = document.querySelector(".todash");
const toset = document.querySelector(".toset");
const username = document.querySelector(".username");
const settingNameInput = document.querySelector("#settingName");
const settingCurrencyInput = document.querySelector("#settingCurrency");
const searchInput = document.querySelector('.search input');
const typeFilter = document.getElementById('typeFilter');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
let userProfile = JSON.parse(localStorage.getItem('user'));

function initProfile() {
    if (!userProfile) return;
    username.innerText = userProfile.username;
    settingNameInput.value = userProfile.username;
    settingCurrencyInput.value = userProfile.currency || '$';
}

initProfile();
addtransaction.addEventListener("click", () => {
    model.style.display = "flex";
    document.body.style.overflow = "hidden";
    const txDate = document.getElementById('txDate');
    if (!txDate.value) {
        txDate.value = new Date().toISOString().split('T')[0];
    }
    closeSidebar();
});

cross.addEventListener("click", () => {
    model.style.display = "none";
    document.body.style.overflow = "";
});

model.addEventListener("click", () => {
    model.style.display = "none";
    document.body.style.overflow = "";
});

overlay.addEventListener("click", (e) => {
    e.stopPropagation();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && model.style.display === 'flex') {
        model.style.display = 'none';
        document.body.style.overflow = '';
    }
});
toset.addEventListener("click", (e) => {
    e.preventDefault();
    dashboard.style.display = "none";
    settings.style.display = "flex";
    todash.classList.remove("active");
    toset.classList.add("active");
    closeSidebar();
});

todash.addEventListener("click", (e) => {
    e.preventDefault();
    settings.style.display = "none";
    dashboard.style.display = "flex";
    toset.classList.remove("active");
    todash.classList.add("active");
    closeSidebar();
});
function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        const isOpen = sidebar && sidebar.classList.contains('open');
        if (isOpen) {
            closeSidebar();
        } else {
            if (sidebar) sidebar.classList.add('open');
            if (sidebarOverlay) sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}
const darkModeToggle = document.getElementById('darkModeToggle');
const savedDarkMode = localStorage.getItem('darkMode') === 'true';

if (savedDarkMode) {
    document.body.classList.add('dark');
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
    }
    renderChart();
});
const logoutBtn = document.querySelector('.logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.replace('login.html');
    });
}
let transactions = JSON.parse(localStorage.getItem(`transactions_${userProfile.username}`)) || [];

function saveTransactions() {
    localStorage.setItem(`transactions_${userProfile.username}`, JSON.stringify(transactions));
}
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

const CATEGORY_ICONS = {
    'Food & Dining': 'ri-restaurant-line',
    'Shopping': 'ri-shopping-bag-line',
    'Recharge & Bills': 'ri-smartphone-line',
    'Petrol & Auto': 'ri-roadster-line',
    'Utilities': 'ri-lightbulb-line',
    'Salary': 'ri-briefcase-line',
    'Entertainment': 'ri-film-line',
    'Other': 'ri-archive-line'
};
let cashFlowChart = null;

function renderChart() {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    const isDark = document.body.classList.contains('dark');

    if (cashFlowChart) {
        cashFlowChart.destroy();
        cashFlowChart = null;
    }

    if (transactions.length === 0) {
        cashFlowChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [
                    { label: 'Income', data: [0], backgroundColor: '#166534', borderRadius: 4 },
                    { label: 'Expenses', data: [0], backgroundColor: '#991B1B', borderRadius: 4 }
                ]
            },
            options: getChartOptions(isDark)
        });
        return;
    }

    const dateMap = {};
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(txn => {
        if (!dateMap[txn.date]) {
            dateMap[txn.date] = { income: 0, expense: 0 };
        }
        if (txn.type === 'income') {
            dateMap[txn.date].income += txn.amount;
        } else {
            dateMap[txn.date].expense += txn.amount;
        }
    });

    const labels = Object.keys(dateMap).map(d => formatDateShort(d));
    const incomeData = Object.values(dateMap).map(v => v.income);
    const expenseData = Object.values(dateMap).map(v => v.expense);

    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#166534',
                    borderRadius: 4,
                    maxBarThickness: 160
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#991B1B',
                    borderRadius: 4,
                    maxBarThickness: 160
                }
            ]
        },
        options: getChartOptions(isDark)
    });
}

function getChartOptions(isDark) {
    const gridColor = isDark ? 'rgba(163, 163, 163, 0.1)' : '#f0eff2';
    const textColor = isDark ? '#a3a3a3' : '#6B7280';
    const currency = userProfile.currency || '$';

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: textColor,
                    font: { family: "'Inter', sans-serif", size: 12 },
                    usePointStyle: false,
                    boxWidth: 20,
                    boxHeight: 14,
                    padding: 16
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1e1e1e' : '#1A1D21',
                titleColor: '#f5f5f5',
                bodyColor: '#d4d4d4',
                padding: 10,
                cornerRadius: 6,
                callbacks: {
                    label: function (context) {
                        return ' ' + context.dataset.label + ': ' + currency + context.raw.toFixed(2);
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: textColor,
                    font: { family: "'Inter', sans-serif", size: 11 },
                    maxRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                grid: { color: gridColor },
                ticks: {
                    color: textColor,
                    font: { family: "'Inter', sans-serif", size: 11 },
                    callback: function (value) { return currency + value.toLocaleString(); }
                }
            }
        }
    };
}

function formatDateShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function updateSummaryAndChart(list = transactions) {
    const currency = userProfile.currency || '$';
    const income = list.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = list.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;

    const cardValues = document.querySelectorAll('.container .card h3');
    if (cardValues.length >= 4) {
        cardValues[0].innerText = currency + balance.toFixed(2);
        cardValues[1].innerText = currency + income.toFixed(2);
        cardValues[2].innerText = currency + expense.toFixed(2);
        cardValues[3].innerText = list.length;
    }

    renderChart();
}
function renderTransactions(list = transactions) {
    const tbody = document.getElementById('transactionTableBody');
    const currency = userProfile.currency || '$';
    tbody.innerHTML = '';

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"></i><p>No transactions found</p></div></td></tr>';
        return;
    }

    const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(t => {
        const tr = document.createElement('tr');
        const isIncome = t.type === 'income';
        const iconClass = CATEGORY_ICONS[t.category] || 'ri-archive-line';

        tr.innerHTML =
            '<td>' + formatDateFull(t.date) + '</td>' +
            '<td style="font-weight:500;">' + escapeHtml(t.description) + '</td>' +
            '<td><span class="cat-tag">' + escapeHtml(t.category) + '</span></td>' +
            '<td style="font-weight:700; color:' + (isIncome ? 'var(--income)' : 'var(--expense)') + ';">' +
            (isIncome ? '+' : '-') + currency + t.amount.toFixed(2) +
            '</td>' +
            '<td><div style="display:flex;gap:6px;">' +
            '<button class="btn-edit" onclick="editTransaction(\'' + t.id + '\')"><i class="ri-pencil-line"></i> Edit</button>' +
            '<button class="btn-del" onclick="deleteTransaction(\'' + t.id + '\')"><i class="ri-delete-bin-line"></i> Delete</button>' +
            '</div></td>';

        tbody.appendChild(tr);
    });
}
document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('txId').value;
    const type = document.getElementById('txType').value;
    const description = document.getElementById('txDescription').value.trim();
    const amount = parseFloat(document.getElementById('txAmount').value);
    const date = document.getElementById('txDate').value;
    const category = document.getElementById('txCategory').value;

    if (!description) {
        alert('Please enter a description.');
        document.getElementById('txDescription').focus();
        return;
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        document.getElementById('txAmount').focus();
        return;
    }
    if (!date) {
        alert('Please select a date.');
        document.getElementById('txDate').focus();
        return;
    }
    if (!category) {
        alert('Please select a category.');
        document.getElementById('txCategory').focus();
        return;
    }

    if (id) {
        const index = transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            transactions[index] = { id, type, description, amount, date, category };
            alert('Transaction updated.');
        }
    } else {
        transactions.push({ id: Date.now().toString(), type, description, amount, date, category });
        alert('Transaction added.');
    }

    saveTransactions();
    updateSummaryAndChart();
    renderTransactions();
    applyFilters();
    model.style.display = 'none';
    document.body.style.overflow = "";
    e.target.reset();
    document.getElementById('txId').value = '';
});

function editTransaction(id) {
    const t = transactions.find(t => t.id === id);
    if (!t) return;
    document.getElementById('txId').value = t.id;
    document.getElementById('txType').value = t.type;
    document.getElementById('txDescription').value = t.description;
    document.getElementById('txAmount').value = t.amount;
    document.getElementById('txDate').value = t.date;
    document.getElementById('txCategory').value = t.category;
    model.style.display = 'flex';
    document.body.style.overflow = "hidden";
}

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateSummaryAndChart();
        renderTransactions();
        applyFilters();
        alert('Transaction deleted.');
    }
}
const settingsForm = document.querySelector("#settingsForm");
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newName = settingNameInput.value.trim();
    const newCurrency = settingCurrencyInput.value;

    if (!newName) {
        alert('Please enter a display name.');
        settingNameInput.focus();
        return;
    }

    if (newName !== userProfile.username) {
        const oldTransactions = localStorage.getItem(`transactions_${userProfile.username}`);
        localStorage.setItem(`transactions_${newName}`, oldTransactions || '[]');
        localStorage.removeItem(`transactions_${userProfile.username}`);
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = registeredUsers.findIndex(u => u.username === userProfile.username);
    if (userIndex !== -1) {
        registeredUsers[userIndex].username = newName;
        registeredUsers[userIndex].currency = newCurrency;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }

    userProfile.username = newName;
    userProfile.currency = newCurrency;
    localStorage.setItem('user', JSON.stringify(userProfile));

    transactions = JSON.parse(localStorage.getItem(`transactions_${userProfile.username}`)) || [];

    initProfile();
    updateSummaryAndChart();
    renderTransactions();
    alert('Settings saved successfully!');
});
document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('WARNING: This will delete all your transaction data permanently. This cannot be undone.\n\nContinue?')) {
        transactions = [];
        saveTransactions();
        localStorage.removeItem('darkMode');
        document.body.classList.remove('dark');
        darkModeToggle.checked = false;
        updateSummaryAndChart();
        renderTransactions();
        alert('All data has been reset.');
    }
});
function applyFilters() {
    const query = searchInput.value.toLowerCase();
    const type = typeFilter.value;

    const filtered = transactions.filter(t => {
        const matchSearch = t.description.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
        const matchType = type === 'all' || t.type === type;
        return matchSearch && matchType;
    });

    renderTransactions(filtered);
    updateSummaryAndChart(filtered);
}

searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);
renderChart();
updateSummaryAndChart();
renderTransactions();