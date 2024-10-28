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
## Integrate Azure SQL database with Django

1. Remove old migration files in appointment_management/migrations (optional)

2. Install the required packages in your virtual environment
    ```
    pip install pyodbc
    ```
    ```
    pip install mssql-django
    ```

3. Save these packages in requirements.txt (optional)

    ```
    pip freeze > requirements.txt
    ```

4. Check if Microsoft ODBC Driver for SQL Server is installed

    Window users:
    Open the ODBC Data Source Administrator tool. You can find it by searching for "ODBC" in the Start menu.
    In the ODBC Data Source Administrator window, go to the "Drivers" tab.
    Look for "ODBC Driver 17 for SQL Server" or the specific version of the driver you installed.

    MacOS users:
    Run the command
    ```
    odbcinst -q -d -n
    ```
    If not installed, install via https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16

5. Navigate to the fv_backend/settings.py file and change the database settings to:

    ```
    DATABASES = {
        'default': {
            'ENGINE': 'mssql',
            'NAME': 'AFL Victoria',
            'USER': 'aflvic',
            'PASSWORD': 'Nga123456@',
            'HOST': 'afl-victoria-sql.database.windows.net',
            'PORT': '1433',
            'OPTIONS': {
                'driver': 'ODBC Driver 17 for SQL Server',
            },
        },
    }
    ```
6. Delete previous models in appointment_management/models.py

7. Migrate Azure database models to the app's model file

    ```
    python manage.py inspectdb > appointment_management/models.py
    ```

If you encounter the ```ValueError: source code strings cannot contain null bytes```, check the encoding type of the newly generated
models.py file at the bottom right of VSCode screen: UTF-8 and UTF-16 may be conflicted.

8. Check if database tables can be migrated 

    Create a python file (example.py) and type

    ```
    from appointment_management.models import Referee

    first_referee = Referee.objects.get(pk=1)

    print(first_referee)
    ```
    Run the file and check terminal output

    ```
    python example.py
    ```
> You can also check if you have access to Azure SQL database on Azure portal: https://portal.azure.com/#browse/Microsoft.Sql%2Fservers%2Fdatabases

### Available Scripts

In the project directory, you can run:

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production



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


