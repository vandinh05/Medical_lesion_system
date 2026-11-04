"""
Create the very first admin account.

Run once after the database schema has been created:

    cd backend
    python create_admin.py

It will prompt for a username and password interactively (password
input is hidden). You can also pass them as arguments for scripting:

    python create_admin.py --username admin --password "S3cret!"
"""

import argparse
import getpass
import sys

from app.database import SessionLocal
from app.models.user import User
from app.models.session import SessionRecord
from app.models.conversation import Conversation
from app.models.audit_log import AuditLog
from app.utils.security import hash_password


def main():
    parser = argparse.ArgumentParser(description="Create the first admin account.")
    parser.add_argument("--username", help="Admin username")
    parser.add_argument("--password", help="Admin password")
    args = parser.parse_args()

    username = args.username or input("Admin username: ").strip()
    password = args.password or getpass.getpass("Admin password: ")

    if not username or not password:
        print("Username and password are required.")
        sys.exit(1)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            print(f"User '{username}' already exists (role: {existing.role}). Aborting.")
            sys.exit(1)

        admin = User(
            username=username,
            hashed_password=hash_password(password),
            role="admin",
        )
        db.add(admin)
        db.commit()
        print(f"Admin account '{username}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
