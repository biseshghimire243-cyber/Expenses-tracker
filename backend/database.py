import sqlite3

DATABASE = "expenses.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():

    connection = get_db_connection()

    # =========================
    # EXPENSES TABLE
    # =========================

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


    # =========================
    # SAVINGS GOALS TABLE
    # =========================

    connection.execute("""
        CREATE TABLE IF NOT EXISTS savings_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            goal_name TEXT NOT NULL,
            target_amount REAL NOT NULL,
            saved_amount REAL DEFAULT 0,
            target_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)


    connection.commit()

    connection.close()