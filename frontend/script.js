const API_URL = "http://127.0.0.1:5000/api/expenses";

const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTableBody");
const noExpenses = document.getElementById("noExpenses");
const searchInput = document.getElementById("searchInput");

const totalExpenses = document.getElementById("totalExpenses");
const totalTransactions = document.getElementById("totalTransactions");
const averageExpense = document.getElementById("averageExpense");

const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

const categoryFilter = document.getElementById("categoryFilter");
const paymentFilter = document.getElementById("paymentFilter");
const monthFilter = document.getElementById("monthFilter");
const clearFilters = document.getElementById("clearFilters");

const highestCategory = document.getElementById("highestCategory");
const highestExpense = document.getElementById("highestExpense");


/* =========================
   BUDGET ELEMENTS
========================= */

const budgetInput = document.getElementById("budgetInput");
const setBudgetButton = document.getElementById("setBudgetButton");
const budgetAmount = document.getElementById("budgetAmount");
const budgetSpent = document.getElementById("budgetSpent");
const budgetRemaining = document.getElementById("budgetRemaining");
const budgetPercentage = document.getElementById("budgetPercentage");
const budgetProgress = document.getElementById("budgetProgress");
const budgetMessage = document.getElementById("budgetMessage");


let expenses = [];
let editingExpenseId = null;

let categoryChart = null;
let monthlyChart = null;


/* =========================
   MONTHLY BUDGET
========================= */

let monthlyBudget =
    Number(localStorage.getItem("monthlyBudget")) || 0;


/* =========================
   LOAD EXPENSES
========================= */

async function loadExpenses() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }

        expenses = await response.json();

        displayExpenses(expenses);

        updateSummary();

        updateAnalytics(expenses);

        updateBudget();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the Python server."
        );
    }
}


/* =========================
   DISPLAY EXPENSES
========================= */

function displayExpenses(data) {

    expenseTableBody.innerHTML = "";

    if (data.length === 0) {

        noExpenses.style.display = "block";

        return;
    }

    noExpenses.style.display = "none";


    data.forEach(expense => {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                Rs. ${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                ${expense.category}
            </td>

            <td>
                ${getPaymentIcon(expense.payment_method)}
                ${expense.payment_method || "Cash"}
            </td>

            <td>
                ${expense.description || "-"}
            </td>

            <td>
                ${expense.expense_date}
            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editExpense(${expense.id})"
                >
                    ✏️ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                >
                    🗑️ Delete
                </button>

            </td>

        `;


        expenseTableBody.appendChild(row);

    });
}


/* =========================
   PAYMENT METHOD ICON
========================= */

function getPaymentIcon(paymentMethod) {

    switch (paymentMethod) {

        case "Cash":
            return "💵";

        case "Bank":
            return "🏦";

        case "Card":
            return "💳";

        case "eSewa":
            return "📱";

        case "Khalti":
            return "📱";

        default:
            return "💰";
    }
}


/* =========================
   ADD / UPDATE EXPENSE
========================= */

expenseForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const amount =
            document.getElementById("amount").value;

        const category =
            document.getElementById("category").value;

        const paymentMethod =
            document.getElementById("paymentMethod").value;

        const description =
            document.getElementById("description").value;

        const expenseDate =
            document.getElementById("expenseDate").value;


        const expenseData = {

            amount: Number(amount),

            category: category,

            payment_method: paymentMethod,

            description: description,

            expense_date: expenseDate
        };


        try {

            let response;


            /* =========================
               UPDATE
            ========================= */

            if (editingExpenseId !== null) {

                response = await fetch(
                    `${API_URL}/${editingExpenseId}`,
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(expenseData)
                    }
                );

            }


            /* =========================
               ADD
            ========================= */

            else {

                response = await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(expenseData)
                    }
                );
            }


            if (!response.ok) {

                const errorData =
                    await response.json().catch(() => ({}));

                throw new Error(
                    errorData.error ||
                    "Failed to save expense"
                );
            }


            if (editingExpenseId !== null) {

                alert(
                    "Expense updated successfully! ✏️"
                );

            } else {

                alert(
                    "Expense added successfully! 💰"
                );
            }


            resetForm();

            await loadExpenses();


        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Unable to save expense."
            );
        }

    }
);


/* =========================
   EDIT EXPENSE
========================= */

function editExpense(id) {

    const expense =
        expenses.find(
            expense =>
                expense.id === id
        );


    if (!expense) {

        alert("Expense not found.");

        return;
    }


    editingExpenseId = id;


    document.getElementById("amount").value =
        expense.amount;


    document.getElementById("category").value =
        expense.category;


    document.getElementById("paymentMethod").value =
        expense.payment_method || "Cash";


    document.getElementById("description").value =
        expense.description || "";


    document.getElementById("expenseDate").value =
        expense.expense_date;


    formTitle.textContent =
        "✏️ Edit Expense";


    submitButton.textContent =
        "💾 Update Expense";


    cancelButton.style.display =
        "inline-block";


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });
}


/* =========================
   CANCEL EDIT
========================= */

cancelButton.addEventListener(
    "click",
    function() {

        resetForm();

    }
);


/* =========================
   RESET FORM
========================= */

function resetForm() {

    expenseForm.reset();

    editingExpenseId = null;


    formTitle.textContent =
        "Add New Expense";


    submitButton.textContent =
        "➕ Add Expense";


    cancelButton.style.display =
        "none";


    setTodayDate();
}


/* =========================
   DELETE EXPENSE
========================= */

async function deleteExpense(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete expense"
            );
        }


        alert(
            "Expense deleted successfully! 🗑️"
        );


        await loadExpenses();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete expense."
        );
    }
}


/* =========================
   UPDATE SUMMARY
========================= */

function updateSummary() {

    updateFilteredSummary(expenses);

}


/* =========================
   FILTERED SUMMARY
========================= */

function updateFilteredSummary(data) {

    const total =
        data.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );


    const count = data.length;


    const average =
        count > 0
            ? total / count
            : 0;


    totalExpenses.textContent =
        `Rs. ${total.toFixed(2)}`;


    totalTransactions.textContent =
        count;


    averageExpense.textContent =
        `Rs. ${average.toFixed(2)}`;
}


/* =========================
   SEARCH + FILTERS
========================= */

function applyFilters() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedCategory =
        categoryFilter.value;


    const selectedPayment =
        paymentFilter.value;


    const selectedMonth =
        monthFilter.value;


    const filteredExpenses =
        expenses.filter(expense => {


            /* SEARCH */

            const paymentMethod =
                expense.payment_method ||
                "Cash";


            const matchesSearch =

                expense.category
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                (expense.description || "")
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                expense.expense_date
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                paymentMethod
                    .toLowerCase()
                    .includes(searchTerm);


            /* CATEGORY */

            const matchesCategory =

                selectedCategory === ""

                ||

                expense.category ===
                    selectedCategory;


            /* PAYMENT METHOD */

            const matchesPayment =

                selectedPayment === ""

                ||

                paymentMethod ===
                    selectedPayment;


            /* MONTH */

            const matchesMonth =

                selectedMonth === ""

                ||

                expense.expense_date
                    .startsWith(selectedMonth);


            return (

                matchesSearch &&

                matchesCategory &&

                matchesPayment &&

                matchesMonth

            );

        });


    displayExpenses(filteredExpenses);


    updateFilteredSummary(
        filteredExpenses
    );


    updateAnalytics(
        filteredExpenses
    );
}


/* =========================
   SEARCH EVENT
========================= */

searchInput.addEventListener(
    "input",
    applyFilters
);


/* =========================
   CATEGORY FILTER
========================= */

categoryFilter.addEventListener(
    "change",
    applyFilters
);


/* =========================
   PAYMENT FILTER
========================= */

paymentFilter.addEventListener(
    "change",
    applyFilters
);


/* =========================
   MONTH FILTER
========================= */

monthFilter.addEventListener(
    "change",
    applyFilters
);


/* =========================
   CLEAR FILTERS
========================= */

clearFilters.addEventListener(
    "click",
    function() {

        searchInput.value = "";

        categoryFilter.value = "";

        paymentFilter.value = "";

        monthFilter.value = "";


        displayExpenses(expenses);

        updateSummary();

        updateAnalytics(expenses);

    }
);


/* =========================
   EXPENSE ANALYTICS
========================= */

function updateAnalytics(data) {


    /* =========================
       CATEGORY TOTALS
    ========================= */

    const categoryTotals = {};


    data.forEach(expense => {

        const category =
            expense.category;


        const amount =
            Number(expense.amount);


        if (!categoryTotals[category]) {

            categoryTotals[category] = 0;
        }


        categoryTotals[category] += amount;

    });


    /* =========================
       HIGHEST CATEGORY
    ========================= */

    const categoryEntries =
        Object.entries(categoryTotals);


    if (categoryEntries.length > 0) {

        const highest =
            categoryEntries.reduce(
                (max, current) => {

                    return current[1] > max[1]
                        ? current
                        : max;

                }
            );


        highestCategory.textContent =
            `${highest[0]} — Rs. ${highest[1].toFixed(2)}`;

    } else {

        highestCategory.textContent =
            "-";
    }


    /* =========================
       HIGHEST SINGLE EXPENSE
    ========================= */

    if (data.length > 0) {

        const highest =
            data.reduce(
                (max, current) => {

                    return Number(current.amount) >
                        Number(max.amount)
                        ? current
                        : max;

                }
            );


        highestExpense.textContent =
            `Rs. ${Number(highest.amount).toFixed(2)}
            (${highest.category})`;

    } else {

        highestExpense.textContent =
            "Rs. 0.00";
    }


    /* =========================
       CATEGORY CHART
    ========================= */

    const categoryLabels =
        Object.keys(categoryTotals);


    const categoryValues =
        Object.values(categoryTotals);


    if (categoryChart) {

        categoryChart.destroy();
    }


    const categoryCanvas =
        document.getElementById(
            "categoryChart"
        );


    if (
        categoryCanvas &&
        typeof Chart !== "undefined"
    ) {

        categoryChart =
            new Chart(
                categoryCanvas,
                {

                    type: "doughnut",

                    data: {

                        labels:
                            categoryLabels,

                        datasets: [

                            {

                                data:
                                    categoryValues
                            }

                        ]
                    },

                    options: {

                        responsive: true,

                        plugins: {

                            legend: {

                                position:
                                    "bottom"
                            }
                        }
                    }
                }
            );
    }


    /* =========================
       MONTHLY TOTALS
    ========================= */

    const monthlyTotals = {};


    data.forEach(expense => {

        const month =
            expense.expense_date.substring(
                0,
                7
            );


        const amount =
            Number(expense.amount);


        if (!monthlyTotals[month]) {

            monthlyTotals[month] = 0;
        }


        monthlyTotals[month] += amount;

    });


    const monthlyLabels =
        Object.keys(monthlyTotals).sort();


    const monthlyValues =
        monthlyLabels.map(
            month =>
                monthlyTotals[month]
        );


    /* =========================
       MONTHLY CHART
    ========================= */

    if (monthlyChart) {

        monthlyChart.destroy();
    }


    const monthlyCanvas =
        document.getElementById(
            "monthlyChart"
        );


    if (
        monthlyCanvas &&
        typeof Chart !== "undefined"
    ) {

        monthlyChart =
            new Chart(
                monthlyCanvas,
                {

                    type: "bar",

                    data: {

                        labels:
                            monthlyLabels,

                        datasets: [

                            {

                                label:
                                    "Monthly Expenses",

                                data:
                                    monthlyValues

                            }

                        ]
                    },

                    options: {

                        responsive: true,

                        scales: {

                            y: {

                                beginAtZero:
                                    true

                            }

                        }

                    }

                }
            );
    }
}


/* =========================
   BUDGET MANAGEMENT
========================= */

function updateBudget() {

    const currentMonth =
        new Date()
            .toISOString()
            .substring(0, 7);


    const monthlyExpenses =
        expenses.filter(
            expense =>
                expense.expense_date
                    .startsWith(currentMonth)
        );


    const spent =
        monthlyExpenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );


    const remaining =
        monthlyBudget - spent;


    let percentage = 0;


    if (monthlyBudget > 0) {

        percentage =
            (spent / monthlyBudget) * 100;
    }


    const displayPercentage =
        Math.min(percentage, 100);


    budgetAmount.textContent =
        `Rs. ${monthlyBudget.toFixed(2)}`;


    budgetSpent.textContent =
        `Rs. ${spent.toFixed(2)}`;


    budgetRemaining.textContent =
        `Rs. ${remaining.toFixed(2)}`;


    budgetPercentage.textContent =
        `${percentage.toFixed(1)}%`;


    budgetProgress.style.width =
        `${displayPercentage}%`;


    /* =========================
       BUDGET MESSAGE
    ========================= */

    if (monthlyBudget === 0) {

        budgetMessage.textContent =
            "Set a monthly budget to start tracking.";

    }

    else if (spent > monthlyBudget) {

        budgetMessage.textContent =
            "⚠️ You have exceeded your monthly budget.";

    }

    else if (percentage >= 80) {

        budgetMessage.textContent =
            "⚠️ You are close to your monthly budget.";

    }

    else {

        budgetMessage.textContent =
            "✅ You are within your monthly budget.";
    }
}


/* =========================
   SET BUDGET
========================= */

if (setBudgetButton) {

    setBudgetButton.addEventListener(
        "click",
        function() {

            const value =
                Number(budgetInput.value);


            if (!value || value <= 0) {

                alert(
                    "Please enter a valid budget amount."
                );

                return;
            }


            monthlyBudget = value;


            localStorage.setItem(
                "monthlyBudget",
                monthlyBudget
            );


            budgetInput.value = "";


            updateBudget();


            alert(
                "Monthly budget saved successfully! 💰"
            );

        }
    );
}


/* =========================
   TODAY'S DATE
========================= */

function setTodayDate() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "expenseDate"
    ).value = today;
}


/* =========================
   START APPLICATION
========================= */

setTodayDate();

loadExpenses();