# fv-appt-platform

The FV Referees department would like to provide a better experience for referees when appointing to football matches by improving their semi-automatic process. Appointment requires matching location, experience, maturity, and appropriate age to the match. It also requires accuracy, timing, and flexibility. The main goal is to fix the issue of mass declines in age groups of U12, 13, and 14’s fixtures which can impact the growth of football in Victoria. Having this platform run with the below requirements will help to ensure higher acceptance of appointments. This platform is to compliment the current use of Schedula which is the Referees Appointment System that does not have a graphical visualization but stores the Club's and Referees' information and history.

## Build front-end

1. Clone the repository and navigate to the root directory:

    ```bash
    git clone git@github.com:kyledenis/fv-appt-platform.git
    cd fv-appt-platform
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm start
    ```

4. Open `http://localhost:3000` to view the webapp in the browser.

> Keep terminal open to host front-end.

## Build back-end

1. In a separate terminal from the project's root directory, navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Create a virtual environment:

    ```bash
    python3 -m venv venv
    ```

3. Activate the virtual environment:
    - On Windows:

    ```bash
    venv\Scripts\activate
    ```

    - On macOS and Linux:

    ```bash
    source venv/bin/activate
    ```

4. Install the required packages:

    ```bash
    pip install -r requirements.txt
    ```

5. Set up your database:

    ```bash
    python3 manage.py migrate
    ```

6. Create a superuser for admin access (optional):

    ```bash
    python3 manage.py createsuperuser
    ```

7. Run the development server:

    ```bash
    python3 manage.py runserver
    ```

The backend will be available at `http://localhost:8000`.
> Keep terminal open to host backend.


## SMS Notifications

1. Install Pyngrok: This is used to host the server that routes incoming SMS messages through the webhook into the application. 
    ```bash
   pip install pyngrok
   ```

2. Install APScheduler: This used to schedule messages to be sent out at 3:00PM each Monday (per the product documents).
   ```bash
   pip install APScheduler
   ```

3. Run Pyngrok: This will start the server.
    ```bash
    pyngrok http --url https://fbvsmswebhook.ngrok.app 8000
    ```

4. Run Django Server
    ```bash
    python manage.py runserver
    ```

Note: The port for the django server and the pyngrok server must be the same. 

# To test it: 
1. Open message_automator.py and adjust the time and day (I've included a legend in the file) to be a few minutes ahead of the current time, because
   the messages will be queued to be sent at the time specified in message_automator.py

2. Create a new Referee, and add your phone number as their phone number.

3. Create an Appointment, and add the referee_id of the Referee with your phone number, and set the status to "pending".

4. If the time in message_automator.py is set correctly, the interpreter should say "Message successfully added to queue."

5. You should receive a message within 1-2 minutes of the time message_automator is set to send out the scheduled messages.
   The message will contain instructions on how to accept/decline appoints. 



### Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
