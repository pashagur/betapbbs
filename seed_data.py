#!/usr/bin/env python3
"""
Seed script to populate the database with default users and sample messages.
"""

import os
import sys
import psycopg2
from psycopg2 import sql
import bcrypt
from datetime import datetime, timedelta
import random

def get_database_url():
    """Get database URL from environment variables."""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL environment variable not found")
        print("Make sure you're running this in the same environment as your app")
        sys.exit(1)
    return database_url

def hash_password(password):
    """Hash a password using bcrypt."""
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_sample_users():
    """Create sample users as specified."""
    database_url = get_database_url()
    
    # Users to create as specified
    sample_users = [
        {
            'username': 'bob',
            'email': 'bob@example.com',
            'password': 'Password123!',
            'role': 0  # user
        },
        {
            'username': 'alice',
            'email': 'alice@example.com',
            'password': 'Password123!',
            'role': 0  # user
        },
        {
            'username': 'admin',
            'email': 'admin@example.com',
            'password': 'Password123!',
            'role': 1  # admin
        },
        {
            'username': 'canary',
            'email': 'canary@example.com',
            'password': 'Password123!',
            'role': 0  # user
        }
    ]
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        created_users = []
        
        for user_data in sample_users:
            # Check if user already exists
            cur.execute("SELECT id, username, email FROM users WHERE username = %s", (user_data['username'],))
            existing_user = cur.fetchone()
            
            if existing_user:
                print(f"User {user_data['username']} already exists:")
                print(f"  - ID: {existing_user[0]}")
                print(f"  - Email: {existing_user[2]}")
                print(f"  - Password: {user_data['password']} (original seed password)")
                print()
                created_users.append(existing_user[0])  # Store the ID
                continue
            
            # Hash the password
            password_hash = hash_password(user_data['password'])
            
            # Insert new user
            cur.execute("""
                INSERT INTO users (username, email, password_hash, role, is_active, post_count)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_data['username'],
                user_data['email'],
                password_hash,
                user_data['role'],
                True,
                0
            ))
            
            user_id = cur.fetchone()[0]
            created_users.append(user_id)
            
            role_name = "admin" if user_data['role'] == 1 else "user"
            print(f"Created user: {user_data['username']}")
            print(f"  - ID: {user_id}")
            print(f"  - Email: {user_data['email']}")
            print(f"  - Password: {user_data['password']}")
            print(f"  - Role: {role_name}")
            print()
        
        # Commit the user creation
        conn.commit()
        return created_users
        
    except psycopg2.Error as e:
        print(f"Database error while creating users: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error while creating users: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def create_sample_messages(user_ids):
    """Create sample messages from the users."""
    if not user_ids:
        print("No users available to create messages")
        return
    
    database_url = get_database_url()
    
    sample_messages = [
        "Welcome to our bulletin board! This is a great place to share ideas and connect with others.",
        "Has anyone tried the new Python 3.12 features? They look amazing, especially the improved error messages!",
        "Looking for recommendations on good web development tutorials for beginners.",
        "Just deployed my first web application. Feeling accomplished! 🎉",
        "Does anyone know the best practices for database optimization in PostgreSQL?",
        "Coffee or tea? The eternal developer question ☕ What's your preference?",
        "Working on a machine learning project. Any dataset suggestions for sentiment analysis?",
        "The new CSS Grid features are really nice for responsive design. Anyone using them?",
        "Debugging can be frustrating, but finding that elusive bug is so satisfying!",
        "What's everyone's favorite code editor? I'm curious to hear different opinions.",
        "Just learned about React hooks. State management is much cleaner now!",
        "Anyone attending any tech conferences this year? Looking for recommendations.",
        "CSS Grid vs Flexbox - when do you use which one? Still learning the differences.",
        "Successfully optimized our API response time by 40% today. Small wins matter!",
        "What are your thoughts on TypeScript? Worth learning for JavaScript developers?",
        "Setting up CI/CD pipelines can be tricky. Any good resources to recommend?",
        "The documentation for this new framework is excellent. Makes learning so much easier!",
        "Anyone else excited about the upcoming tech developments in AI and web development?",
        "Code reviews are so valuable for learning. Love seeing different approaches to problems.",
        "Just finished a challenging algorithm problem. Problem-solving skills are improving!"
    ]
    
    try:
        # Connect to database
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        message_count = 0
        
        # Create 3-5 messages per user
        for user_id in user_ids:
            num_messages = random.randint(3, 5)
            user_messages = random.sample(sample_messages, min(num_messages, len(sample_messages)))
            
            for content in user_messages:
                # Create timestamp within the last 30 days
                days_ago = random.randint(1, 30)
                hours_ago = random.randint(0, 23)
                minutes_ago = random.randint(0, 59)
                timestamp = datetime.utcnow() - timedelta(
                    days=days_ago,
                    hours=hours_ago,
                    minutes=minutes_ago
                )
                
                cur.execute("""
                    INSERT INTO messages (content, user_id, timestamp)
                    VALUES (%s, %s, %s)
                """, (content, user_id, timestamp))
                
                message_count += 1
        
        # Update post counts for users
        cur.execute("""
            UPDATE users 
            SET post_count = (
                SELECT COUNT(*) 
                FROM messages 
                WHERE messages.user_id = users.id
            )
        """)
        
        # Commit the changes
        conn.commit()
        print(f"Created {message_count} sample messages")
        print("Updated user post counts")
        
    except psycopg2.Error as e:
        print(f"Database error while creating messages: {e}")
        if conn:
            conn.rollback()
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error while creating messages: {e}")
        if conn:
            conn.rollback()
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
            print(f"Error: Missing tables: {', '.join(missing_tables)}")
            print("You may need to run database migrations first (npm run db:push)")
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

def seed_database():
    """Main function to seed the database with sample data."""
    print("Database Seeding Utility")
    print("=" * 40)
    
    # Verify database structure first
    if not verify_database_structure():
        print("Database structure verification failed. Exiting.")
        sys.exit(1)
    
    print("Seeding database with sample data...")
    print()
    
    # Create sample users
    user_ids = create_sample_users()
    
    # Create sample messages
    create_sample_messages(user_ids)
    
    print()
    print("Database seeding completed!")
    print("=" * 40)
    print("Created users:")
    print("- bob (bob@example.com) - Password: Password123! - Role: user")
    print("- alice (alice@example.com) - Password: Password123! - Role: user") 
    print("- admin (admin@example.com) - Password: Password123! - Role: admin")
    print("- canary (canary@example.com) - Password: Password123! - Role: user")
    print()
    print("You can now log in with any of these accounts!")

if __name__ == "__main__":
    seed_database()