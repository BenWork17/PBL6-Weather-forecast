from apscheduler.schedulers.background import BackgroundScheduler
from .scripts.collect_data import collect_weather_data

scheduler = BackgroundScheduler()

def start_scheduler():
    # Collect data every hour
    scheduler.add_job(collect_weather_data, 'interval', hours=1)
    scheduler.start() 