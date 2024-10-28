from apscheduler.schedulers.background import BackgroundScheduler # type: ignore
from datetime import datetime, time
from .sms_client import send_sms # type: ignore
sms_queue = [] ## list of queued appointment SMS messages

def send_sms_queue():
    current_time = datetime.now()
    if current_time.weekday() == 0:
        if current_time.hour == 15 and current_time.minute == 00: ## change this to 3:00pm, Tuesday when pushing to GitBranch
            for x in sms_queue:
                ph_num = x["phone_number"]
                text = x["text"]
                send_sms(text, ph_num)
            sms_queue.clear()

automator = BackgroundScheduler()
automator.add_job(send_sms_queue, "interval", seconds = 30)
automator.start()

## TODO:
## run this and test it. 

## Days of the week
## 0 = Monday
## 1 = Tuesday
## 2 = Wednesday
## 3 = Thursday
## 4 = Friday
## 5 = Saturday
## 6 = Sunday