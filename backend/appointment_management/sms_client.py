import vonage_client
from django.conf import settings


client = vonage_client.Client(settings.VONAGE_API_KEY, settings.VONAGE_API_SECRET)
sms = vonage_client.Sms(client)

responseData = sms.send_message(from_num, to_num,
    {
        "from": from_num,
        "to": to_num,
        "text": "A text message sent using the Nexmo SMS API",
    }
)

if responseData["messages"][0]["status"] == "0":
    print("Message sent successfully.")
else:
    print(f"Message failed with error: {responseData['messages'][0]['error-text']}")