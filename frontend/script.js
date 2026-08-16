const API_URL = "http://127.0.0.1:5000/api/expenses";

const expenseForm = document.getElementById("expenseForm");
const expenseTableBody = document.getElementById("expenseTableBody");
const noExpenses = document.getElementById("noExpenses");
const searchInput = document.getElementById("searchInput");

const totalExpenses = document.getElementById("totalExpenses");
const totalTransactions = document.getElementById("totalTransactions");
const averageExpense = document.getElementById("averageExpense");

let expenses = [];


/* Load Expenses */

async function loadExpenses() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }

        expenses = await response.json();

        displayExpenses(expenses);
        updateSummary();

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the Python server.");

    }
}


/* Display Expenses */

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
            <td>Rs. ${Number(expense.amount).toFixed(2)}</td>

            <td>${expense.category}</td>

            <td>${expense.description || "-"}</td>

            <td>${expense.expense_date}</td>

            <td>
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


/* Add Expense */

expenseForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const expenseDate = document.getElementById("expenseDate").value;

    const expense = {

        amount: Number(amount),

        category: category,

        description: description,

        expense_date: expenseDate
    };


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(expense)
        });


        if (!response.ok) {

            throw new Error("Failed to add expense");

        }


        alert("Expense added successfully! 💰");

        expenseForm.reset();

        setTodayDate();

        loadExpenses();


    } catch (error) {

        console.error(error);

        alert("Unable to add expense.");

    }

});


/* Delete Expense */

async function deleteExpense(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error("Failed to delete expense");

        }


        alert("Expense deleted successfully!");

        loadExpenses();


    } catch (error) {

        console.error(error);

        alert("Unable to delete expense.");

    }

}


/* Update Summary */

function updateSummary() {

    const total = expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
    );

    const count = expenses.length;

    const average = count > 0
        ? total / count
        : 0;


    totalExpenses.textContent =
        `Rs. ${total.toFixed(2)}`;

    totalTransactions.textContent =
        count;

    averageExpense.textContent =
        `Rs. ${average.toFixed(2)}`;
}


/* Search */

searchInput.addEventListener("input", function() {

    const searchTerm =
        searchInput.value.toLowerCase();


    const filteredExpenses = expenses.filter(expense => {

        return (
            expense.category.toLowerCase().includes(searchTerm) ||

            (expense.description || "")
                .toLowerCase()
                .includes(searchTerm) ||

            expense.expense_date
                .toLowerCase()
                .includes(searchTerm)
        );

    });


    displayExpenses(filteredExpenses);

});


/* Today's Date */

function setTodayDate() {

    const today =
        new Date().toISOString().split("T")[0];

    document.getElementById("expenseDate").value =
        today;
}


/* Start Application */

setTodayDate();

loadExpenses();