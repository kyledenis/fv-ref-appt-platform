from django.conf import settings
import requests
import json

def send_sms(text, phone_numbers):
    url = 'https://cellcast.com.au/api/v3/send-sms'

    headers = {
        'APPKEY': settings.CELLCAST_APP_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    payload = {
        'sms_text': text,
        'numbers': phone_numbers ## This could be one or n phone numbers 
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


