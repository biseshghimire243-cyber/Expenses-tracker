import sqlite3

DATABASE = "expenses.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():

    connection = get_db_connection()

    # Create the table if it doesn't exist
    connection.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            expense_date TEXT NOT NULL,
            payment_method TEXT DEFAULT 'Cash'
        )
    """)

    # Check existing columns
    columns = connection.execute(
        "PRAGMA table_info(expenses)"
    ).fetchall()

    column_names = [
        column["name"]
        for column in columns
    ]

    # Add payment_method to an existing database
    if "payment_method" not in column_names:

        connection.execute("""
            ALTER TABLE expenses
            ADD COLUMN payment_method TEXT DEFAULT 'Cash'
        """)

    connection.commit()
    connection.close()