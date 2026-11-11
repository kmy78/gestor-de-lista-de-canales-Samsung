@echo off
title Gestor de canales IP - Samsung
set PYW=C:\Users\forza\AppData\Local\Programs\Python\Python315\pythonw.exe
if exist "%PYW%" (
  start "" "%PYW%" "%~dp0gestor_canales.py"
) else (
  python "%~dp0gestor_canales.py"
)
