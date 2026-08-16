from flask import Flask, request, jsonify
from flask_cors import CORS

from database import get_db_connection, initialize_database

app = Flask(__name__)
CORS(app)

initialize_database()


@app.route("/")
def home():
    return jsonify({
        "message": "Expense Tracker API is running!"
    })


@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    connection = get_db_connection()

    expenses = connection.execute(
        "SELECT * FROM expenses ORDER BY id DESC"
    ).fetchall()

    connection.close()

    return jsonify([dict(expense) for expense in expenses])


@app.route("/api/expenses", methods=["POST"])
def add_expense():
    data = request.get_json()

    amount = data.get("amount")
    category = data.get("category")
    description = data.get("description", "")
    expense_date = data.get("expense_date")

    if not amount or not category or not expense_date:
        return jsonify({
            "error": "Amount, category and date are required"
        }), 400

    connection = get_db_connection()

    cursor = connection.execute(
        """
        INSERT INTO expenses
        (amount, category, description, expense_date)
        VALUES (?, ?, ?, ?)
        """,
        (amount, category, description, expense_date)
    )

    connection.commit()

    expense_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "message": "Expense added successfully",
        "id": expense_id
    }), 201


@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    connection = get_db_connection()

    cursor = connection.execute(
        "DELETE FROM expenses WHERE id = ?",
        (expense_id,)
    )

    connection.commit()

    deleted = cursor.rowcount

    connection.close()

    if deleted == 0:
        return jsonify({
            "error": "Expense not found"
        }), 404

    return jsonify({
        "message": "Expense deleted successfully"
    })


@app.route("/api/expenses/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    data = request.get_json()

    amount = data.get("amount")
    category = data.get("category")
    description = data.get("description", "")
    expense_date = data.get("expense_date")

    if not amount or not category or not expense_date:
        return jsonify({
            "error": "Amount, category and date are required"
        }), 400

    connection = get_db_connection()

    cursor = connection.execute(
        """
        UPDATE expenses
        SET amount = ?,
            category = ?,
            description = ?,
            expense_date = ?
        WHERE id = ?
        """,
        (
            amount,
            category,
            description,
            expense_date,
            expense_id
        )
    )

    connection.commit()

    updated = cursor.rowcount

    connection.close()

    if updated == 0:
        return jsonify({
            "error": "Expense not found"
        }), 404

    return jsonify({
        "message": "Expense updated successfully"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)