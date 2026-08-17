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

const categoryFilter =
    document.getElementById("categoryFilter");

const monthFilter =
    document.getElementById("monthFilter");

const clearFilters =
    document.getElementById("clearFilters");

const highestCategory =
    document.getElementById("highestCategory");

const highestExpense =
    document.getElementById("highestExpense");

let expenses = [];
let editingExpenseId = null;

let categoryChart = null;
let monthlyChart = null;


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

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                Rs. ${Number(expense.amount).toFixed(2)}
            </td>

            <td>
                ${expense.category}
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

        const description =
            document.getElementById("description").value;

        const expenseDate =
            document.getElementById("expenseDate").value;


        const expenseData = {

            amount: Number(amount),

            category: category,

            description: description,

            expense_date: expenseDate

        };


        try {

            let response;


            /* UPDATE */

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
                            JSON.stringify(
                                expenseData
                            )

                    }
                );

            }


            /* ADD */

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
                            JSON.stringify(
                                expenseData
                            )

                    }
                );

            }


            if (!response.ok) {

                throw new Error(
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

        }


        catch (error) {

            console.error(error);

            alert(
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
            expense => expense.id === id
        );


    if (!expense) {

        alert("Expense not found.");

        return;

    }


    editingExpenseId = id;


    document.getElementById(
        "amount"
    ).value = expense.amount;


    document.getElementById(
        "category"
    ).value = expense.category;


    document.getElementById(
        "description"
    ).value =
        expense.description || "";


    document.getElementById(
        "expenseDate"
    ).value =
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

    }


    catch (error) {

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


    const count =
        data.length;


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


    const selectedMonth =
        monthFilter.value;


    const filteredExpenses =
        expenses.filter(expense => {


            /* SEARCH */

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
                    .includes(searchTerm);


            /* CATEGORY */

            const matchesCategory =

                selectedCategory === ""

                ||

                expense.category ===
                    selectedCategory;


            /* MONTH */

            const matchesMonth =

                selectedMonth === ""

                ||

                expense.expense_date
                    .startsWith(selectedMonth);


            return (

                matchesSearch &&

                matchesCategory &&

                matchesMonth

            );

        });


    displayExpenses(
        filteredExpenses
    );


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

        monthFilter.value = "";


        displayExpenses(
            expenses
        );


        updateSummary();


        updateAnalytics(
            expenses
        );

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

            categoryTotals[category] =
                0;

        }


        categoryTotals[category] +=
            amount;

    });


    /* =========================
       HIGHEST CATEGORY
    ========================= */

    const categoryEntries =
        Object.entries(
            categoryTotals
        );


    if (categoryEntries.length > 0) {

        const highest =
            categoryEntries.reduce(
                (max, current) => {

                    return current[1] >
                        max[1]
                        ? current
                        : max;

                }
            );


        highestCategory.textContent =
            `${highest[0]} — Rs. ${highest[1].toFixed(2)}`;

    }

    else {

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

                    return Number(
                        current.amount
                    ) >

                    Number(
                        max.amount
                    )

                        ? current
                        : max;

                }
            );


        highestExpense.textContent =
            `Rs. ${Number(
                highest.amount
            ).toFixed(2)} (${highest.category})`;

    }

    else {

        highestExpense.textContent =
            "Rs. 0.00";

    }


    /* =========================
       CATEGORY CHART
    ========================= */

    const categoryLabels =
        Object.keys(
            categoryTotals
        );


    const categoryValues =
        Object.values(
            categoryTotals
        );


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
            expense.expense_date
                .substring(0, 7);


        const amount =
            Number(expense.amount);


        if (!monthlyTotals[month]) {

            monthlyTotals[month] =
                0;

        }


        monthlyTotals[month] +=
            amount;

    });


    const monthlyLabels =
        Object.keys(
            monthlyTotals
        ).sort();


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