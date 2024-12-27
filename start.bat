@echo off
chcp 65001 > nul
cls
color 0E

:: Enable ANSI escape sequences
reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f > nul

echo [94m
echo    ███╗   ███╗ █████╗ ██████╗ ██████╗ ██╗   ██╗
echo    ████╗ ████║██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝
echo    ██╔████╔██║███████║██████╔╝██║  ██║ ╚████╔╝ 
echo    ██║╚██╔╝██║██╔══██║██╔══██╗██║  ██║  ╚██╔╝  
echo    ██║ ╚═╝ ██║██║  ██║██║  ██║██████╔╝   ██║   
echo    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝    ╚═╝   
echo.
echo [93m   +----------------------------------------+
echo    ^|      AI Lesson Plan Analysis System        ^|
echo    +----------------------------------------+[0m
echo.
echo [36m   +----------------------------------------+
echo    ^|   "Education is not preparation for life;  ^|
echo    ^|    education is life itself."             ^|
echo    ^|                         - John Dewey      ^|
echo    +----------------------------------------+[0m
echo.

setlocal enabledelayedexpansion

:: Phase 1 - Initialization
echo [92m[*][0m A long time ago in a classroom far, far away...
echo [90m   ==========================================[0m
timeout /t 2 /nobreak > nul

:: Start the AI Engine silently
echo [36m   +---------------------------------------+
echo    ^| I'm whatever education needs me to be... ^|
echo    +---------------------------------------+[0m
start /B cmd /c ollama serve > nul 2>&1
timeout /t 2 /nobreak > nul

:: Setup directories silently
cd /d "%~dp0" > nul 2>&1

if not exist "backend" (
    mkdir "backend" > nul 2>&1
)

cd backend > nul 2>&1

:: Setup Python environment silently
if not exist venv (
    echo [95m   +----------------------------------+
    echo    ^|   Do or do not, there is no try   ^|
    echo    +----------------------------------+[0m
    python -m venv venv > nul 2>&1
    if errorlevel 1 goto :error
)

:: Activate and setup backend
call venv\Scripts\activate.bat > nul 2>&1
if errorlevel 1 goto :error

if not exist requirements.txt (
    echo fastapi==0.104.1 > requirements.txt
    echo uvicorn==0.24.0 >> requirements.txt
    echo python-multipart==0.0.6 >> requirements.txt
)

pip install -r requirements.txt > nul 2>&1

:: Create backend file if needed
if not exist main.py (
    (
        echo from fastapi import FastAPI
        echo from fastapi.middleware.cors import CORSMiddleware
        echo.
        echo app = FastAPI^(^)
        echo.
        echo app.add_middleware^(
        echo     CORSMiddleware,
        echo     allow_origins=["*"],
        echo     allow_credentials=True,
        echo     allow_methods=["*"],
        echo     allow_headers=["*"],
        echo ^)
        echo.
        echo @app.get^("/ping"^)
        echo def ping^(^):
        echo     return {"message": "pong"}
        echo.
        echo if __name__ == "__main__":
        echo     import uvicorn
        echo     uvicorn.run^(app, host="127.0.0.1", port=8000^)
    ) > main.py > nul 2>&1
)

:: Start backend
echo [94m   +--------------------------------------------+
echo    ^|  Why'd You Only Call Me When You're High... ^|
echo    ^|                        ...on Learning?      ^|
echo    +--------------------------------------------+[0m
start /B cmd /c python main.py > nul 2>&1
timeout /t 2 /nobreak > nul

:: Setup frontend
cd /d "%~dp0" > nul 2>&1

echo [96m   +-------------------------------------------+
echo    ^|       R2-D2, initialize the learning...     ^|
echo    +-------------------------------------------+[0m
call npm install > nul 2>&1
if errorlevel 1 goto :error

echo [97m   +-------------------------------------------+
echo    ^|   The Dark Knight of Education Rises...    ^|
echo    +-------------------------------------------+[0m
start /B cmd /c npm run dev > nul 2>&1
if errorlevel 1 goto :error

:: Loading animation
echo [95m   +-----------------------------------+
echo    ^|    Preparing your classroom...      ^|
echo    +-----------------------------------+[0m
echo    [90m==================================[0m
echo    -^> [92m
for /L %%i in (1,1,30) do (
    <nul set /p "=#"
    timeout /t 0 /nobreak > nul
)
echo [0m

timeout /t 2 /nobreak > nul
start http://localhost:5173

echo.
echo [93m   +----------------------------------------+
echo    ^|  "I Wanna Be Yours... Sincerely, Education" ^|
echo    +----------------------------------------+[0m
echo.
echo [36m   +----------------------------------------+
echo    ^|   "It's not who you are underneath,        ^|
echo    ^|    but what you teach that defines you"    ^|
echo    +----------------------------------------+[0m
echo.
echo [92m   +----------------------------------------+
echo    ^|      Your virtual classroom is ready!      ^|
echo    +----------------------------------------+[0m
echo.
echo [90m   Press any key when you want to end the session...[0m
pause > nul

:: Cleanup
taskkill /F /IM python.exe > nul 2>&1
taskkill /F /IM node.exe > nul 2>&1
taskkill /F /IM ollama.exe > nul 2>&1

echo [36m   +----------------------------------------+
echo    ^|   That's one small step for teachers,      ^|
echo    ^|   one giant leap for education            ^|
echo    +----------------------------------------+[0m
timeout /t 3 /nobreak > nul
exit /b 0

:error
echo.
echo [91m   +--------------------------------+
echo    ^|  Houston, we have a problem...  ^|
echo    +--------------------------------+[0m
echo.
pause > nul
exit /b 1 