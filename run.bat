@echo off
cd /d "%~dp0src"
echo Compiling StitchQ...
javac StitchQ.java
if errorlevel 1 (
  echo.
  echo Compilation failed. Check the error above.
  pause
  exit /b 1
)
echo Starting StitchQ...
java StitchQ
pause
