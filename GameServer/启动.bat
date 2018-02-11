::start /D %cd% admin.bat
::start /D %cd% agent.bat
::start /D %cd% realdatacenter.bat
::start /D %cd% virtualdatacenter.bat
::start /D %cd% game-server1.bat
::start /D %cd% game-server2.bat
title daemon.bat
set MAIN_JS=%~dp0\Daemon\app.js
call node.exe %MAIN_JS%
pause