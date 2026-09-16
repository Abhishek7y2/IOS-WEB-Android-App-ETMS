@echo off
echo ========================================================
echo   Enterprise Employee Task Management System Folder Rename
echo ========================================================
cd /d "%~dp0"

echo.
echo 1. Renaming 'Mini Employee Task Manager' subfolder...
if exist "Mini Employee Task Manager" (
    ren "Mini Employee Task Manager" "Enterprise Employee Task Manager"
    echo Success: Subfolder renamed to 'Enterprise Employee Task Manager'
)

echo.
echo 2. Renaming parent root folder...
cd ..
if exist "Mini task Management System" (
    ren "Mini task Management System" "Enterprise Employee Task Management System"
    echo Success: Root folder renamed to 'Enterprise Employee Task Management System'
)

echo.
echo Complete! Re-open 'Enterprise Employee Task Management System' in VS Code.
pause
