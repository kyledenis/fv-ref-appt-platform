# Football Victoria Referee Management Platform

This project is a React-based web application for managing referee appointments and availability for Football Victoria. The FV Referees department aims to provide a better experience for referees when appointing to football matches by improving their semi-automatic process. This platform complements the current use of Schedula, adding graphical visualization to the existing Referees Appointment System.

## Project Overview

The main goals of this platform are:

- Match referees to appointments based on location, experience, maturity, and appropriate age
- Improve accuracy, timing, and flexibility in the appointment process
- Address the issue of mass declines in age groups of U12, 13, and 14's fixtures
- Ensure higher acceptance of appointments

## Contents

- [Football Victoria Referee Management Platform](#football-victoria-referee-management-platform)
  - [Project Overview](#project-overview)
  - [Contents](#contents)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Integrate Azure SQL Database with Django](#integrate-azure-sql-database-with-django)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)

## Frontend Setup

1. Clone the repository and navigate to the root directory:

    ```bash
    git clone git@github.com:kyledenis/fv-appt-platform.git
    cd fv-appt-platform
    ```

2. Install dependencies:

    ```npm
    npm install
    ```

3. Create an `.env` file in the root directory and add the necessary environment variables. (See `.env.template` for reference):

   ```plaintext
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:

    ```npm
    npm run dev
    ```

    > [!IMPORTANT]
    > - Keep the frontend and backend servers running in separate terminals.
    > - The backend server must be running for the frontend to work properly.

5. Open [localhost:3000](http://localhost:3000) to view it in the browser.

## Backend Setup

1. In a separate terminal from the project's root directory, navigate to the `backend` directory:

    ```bash
    cd backend
    ```

2. Create a virtual environment:

    ```python3
    python3 -m venv venv
    ```

3. Activate the virtual environment:
    - On Windows:

        ```cmd
        venv\Scripts\activate
        ```

    - On macOS and Linux:

        ```bash
        source venv/bin/activate
        ```

4. Install the required packages:

    ```pip
    pip install -r requirements.txt
    ```

5. Set up your database:

    ```python3
    python3 manage.py migrate
    ```

6. Create a superuser for admin access (optional):

    ```python3
    python3 manage.py createsuperuser
    ```

7. Run the development server:

    ```python3
    python3 manage.py runserver
    ```

> [!TIP]
The backend will be available at [localhost:8000](http://localhost:8000).

## Integrate Azure SQL Database with Django

1. ~~Remove old migration files in appointment_management/migrations (optional)~~

2. Install the required packages in your virtual environment

    ```python
    pip install pyodbc
    pip install mssql-django
    ```

3. ~~Save these packages in requirements.txt (optional)~~

    ```python
    pip freeze > requirements.txt
    ```

4. Check if Microsoft ODBC Driver for SQL Server is installed

    Window users:
    Open the ODBC Data Source Administrator tool. You can find it by searching for "ODBC" in the Start menu.
    In the ODBC Data Source Administrator window, go to the "Drivers" tab.
    Look for "ODBC Driver 17 for SQL Server" or the specific version of the driver you installed.

    **MacOS users, run the command:**

    ```odbc
    odbcinst -q -d -n
    ```

    If not installed, install via <https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16>

5. Navigate to the fv_backend/settings.py file and change the database settings to:

    ```python
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

6. ~~Delete previous models in appointment_management/models.py~~

7. Migrate Azure database models to the app's model file

    ```python
    python3 manage.py inspectdb > appointment_management/models.py
    ```

    > [!NOTE]
    > If you encounter error: `ValueError: source code strings cannot contain null bytes`, check the encoding type of the newly generated models.py file at the bottom right of VSCode screen: UTF-8 and UTF-16 may be conflicted.

8. Check if database tables can be migrated

    Execute the file `test-database.py`, and check terminal output.

    ```python
    cd backend/appointment_management
    python3 test-database.py
    ```

> You can also check if you have access to Azure SQL database on Azure portal: <https://portal.azure.com/#browse/Microsoft.Sql%2Fservers%2Fdatabases>

> [!TIP]
> Keep terminal open to host backend.

## Available Scripts

- `npm run dev`: Runs both the React app and the Express server concurrently
- `npm start`: Runs the React app in development mode
- `npm run server`: Runs the Express server
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production

## Project Structure

- `src/`: React application source code
  - `components/`: Reusable UI components
  - `pages/`: Main page components
  - `contexts/`: React Context for state management
  - `services/`: API service for backend communication
  - `utils/`: Utility functions
- `server.js`: Express server for proxying Google Maps API requests
