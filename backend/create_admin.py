"""
Create admin user for testing
Run this script once to create the default admin account
"""
from app.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.username == 'admin').first()
        if existing:
            print("⚠️  Admin user already exists")
            return
        
        # Create admin user
        admin = User(
            username='admin',
            email='admin@polda.id',
            hashed_password=get_password_hash('admin123'),
            full_name='Administrator',
            role='admin',
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        
        print("✅ Admin user created successfully!")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Email: admin@polda.id")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
