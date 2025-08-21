#!/usr/bin/env python3
"""
Cleanup script to remove all users and messages from the Beta BSS database.
WARNING: This will permanently delete all data!
"""

import os
import sys
import psycopg2
from psycopg2 import sql

def get_database_url():
    """Get database URL from environment variables."""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL environment variable not found")
        print("Make sure you're running this in the same environment as your app")
        sys.exit(1)
    return database_url

def cleanup_database():
    """Remove all messages and users from the database."""
    database_url = get_database_url()
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        print("Cleaning up database...")
        
        # Count existing records before deletion
        cur.execute("SELECT COUNT(*) FROM messages")
        message_count = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM users")
        user_count = cur.fetchone()[0]
        
        print(f"Found {message_count} messages and {user_count} users")
        
        if message_count == 0 and user_count == 0:
            print("Database is already clean!")
            return
        
        # Delete all messages first (due to foreign key constraints)
        cur.execute("DELETE FROM messages")
        print(f"Deleted {message_count} messages")
        
        # Delete all users
        cur.execute("DELETE FROM users")
        print(f"Deleted {user_count} users")
        
        # Reset auto-increment sequences
        cur.execute("ALTER SEQUENCE messages_id_seq RESTART WITH 1")
        print("Reset messages ID sequence")
        
        # Commit the changes
        conn.commit()
        print("Database cleanup completed successfully!")
        
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def verify_database_structure():
    """Verify that the required tables exist."""
    database_url = get_database_url()
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Check if required tables exist
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'messages')
        """)
        
        existing_tables = [row[0] for row in cur.fetchall()]
        required_tables = ['users', 'messages']
        
        missing_tables = [table for table in required_tables if table not in existing_tables]
        
        if missing_tables:
            print(f"Warning: Missing tables: {', '.join(missing_tables)}")
            print("You may need to run database migrations first")
            return False
        
        print("Database structure verified - all required tables found")
        return True
        
    except psycopg2.Error as e:
        print(f"Database error while verifying structure: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error while verifying structure: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def cleanup_all():
    """Main function to clean up all data."""
    print("Beta BSS Database Cleanup Utility")
    print("=" * 40)
    
    # Verify database structure first
    if not verify_database_structure():
        print("Database structure verification failed. Exiting.")
        sys.exit(1)
    
    # Check for /delete_all parameter
    if len(sys.argv) > 1 and sys.argv[1] == "/delete_all":
        print("Non-interactive mode: Proceeding with deletion...")
        cleanup_database()
        
        print("\nCleanup completed successfully!")
        print("The database has been cleared of all user data and messages.")
        print("You can now register new users and post new messages.")
        
    else:
        print("WARNING: This will permanently delete ALL data!")
        print("- All user accounts and profiles")
        print("- All messages and posts")
        print("- All user sessions")
        print("- All activity statistics")
        print("=" * 40)
        
        confirm = input("Are you sure you want to proceed? Type 'DELETE ALL' to confirm: ")
        
        if confirm == "DELETE ALL":
            print("\nStarting cleanup process...")
            cleanup_database()
            
            print("\nCleanup completed successfully!")
            print("The database has been cleared of all user data and messages.")
            print("You can now register new users and post new messages.")
            
        else:
            print("Cleanup cancelled. No data was deleted.")

if __name__ == "__main__":
    cleanup_all()