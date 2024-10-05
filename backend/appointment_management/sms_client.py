from urllib import request
from django.conf import settings
import requests # type: ignore
import json
from rest_framework.response import Response
from rest_framework import status



## Investigate scheduled_time use as per documentation
## this will help if we want to schedule texts. 

def send_sms(text, phone_number):
    url = 'https://cellcast.com.au/api/v3/send-sms'

    headers = {
        'APPKEY': settings.CELLCAST_APP_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    payload = {
        'sms_text': text,
        'numbers': phone_number 
    }
 
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()

        result = response.json()
        return{
            "status": 200,
            "msg": "Sms sent successfully", 
            "result": result
        }
    except requests.exceptions.RequestException as e:
        return {
        "status": 400,
        "msg": "Something went wrong, please try again",
        "result": str(e)
    }





            





