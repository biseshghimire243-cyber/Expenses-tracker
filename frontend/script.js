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

let expenses = [];
let editingExpenseId = null;


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

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the Python server.");

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

expenseForm.addEventListener("submit", async function(event) {

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
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(expenseData)
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
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(expenseData)
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


    } catch (error) {

        console.error(error);

        alert(
            "Unable to save expense."
        );

    }

});


/* =========================
   EDIT EXPENSE
========================= */

function editExpense(id) {

    const expense = expenses.find(
        expense => expense.id === id
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

        const response = await fetch(
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

    const total =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );


    const count =
        expenses.length;


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
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    function() {

        const searchTerm =
            searchInput.value.toLowerCase();


        const filteredExpenses =
            expenses.filter(expense => {

                return (

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

                );

            });


        displayExpenses(
            filteredExpenses
        );

    }
);


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