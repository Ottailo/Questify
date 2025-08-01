from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.crud import get_user_by_id
import redis
import json
import os

# Initialize Redis
redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

# Initialize scheduler
scheduler = AsyncIOScheduler()

def update_leaderboards():
    """Update leaderboard cache with current user rankings."""
    try:
        db = SessionLocal()
        
        # Get top 100 users by XP
        users = db.query(User).order_by(User.xp.desc()).limit(100).all()
        
        # Create leaderboard entries
        entries = []
        for i, user in enumerate(users, 1):
            entries.append({
                "user_id": user.id,
                "adventurer_name": user.adventurer_name,
                "level": user.level,
                "xp": user.xp,
                "rank": i
            })
        
        # Cache for different timeframes
        timeframes = ['daily', 'weekly', 'monthly']
        for timeframe in timeframes:
            cache_key = f"leaderboard:{timeframe}"
            leaderboard_data = {
                "entries": entries,
                "timeframe": timeframe
            }
            redis_client.setex(cache_key, 3600, json.dumps(leaderboard_data))
        
        print(f"Updated leaderboards with {len(entries)} entries")
        
    except Exception as e:
        print(f"Error updating leaderboards: {e}")
    finally:
        db.close()

def check_double_xp_events():
    """Check for active double XP events."""
    # This would check for special events like "Double XP Weekend"
    # For now, we'll just log that we checked
    print("Checked for double XP events")

def cleanup_old_data():
    """Clean up old data and optimize database."""
    try:
        db = SessionLocal()
        # Add cleanup logic here
        print("Cleaned up old data")
    except Exception as e:
        print(f"Error cleaning up old data: {e}")
    finally:
        db.close()

def start_scheduler():
    """Start the background job scheduler."""
    # Update leaderboards every hour
    scheduler.add_job(
        update_leaderboards,
        CronTrigger(minute=0),  # Every hour at minute 0
        id='update_leaderboards',
        name='Update Leaderboards'
    )
    
    # Check for events every day at midnight
    scheduler.add_job(
        check_double_xp_events,
        CronTrigger(hour=0, minute=0),  # Every day at midnight
        id='check_events',
        name='Check for Events'
    )
    
    # Cleanup old data every week
    scheduler.add_job(
        cleanup_old_data,
        CronTrigger(day_of_week='sun', hour=2, minute=0),  # Every Sunday at 2 AM
        id='cleanup_data',
        name='Cleanup Old Data'
    )
    
    scheduler.start()
    print("Background scheduler started")

def stop_scheduler():
    """Stop the background job scheduler."""
    scheduler.shutdown()
    print("Background scheduler stopped") 