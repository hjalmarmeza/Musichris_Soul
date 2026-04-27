
import os
import subprocess

# Simulando la ejecución de graphics_engine.py para ver el resultado real
title = "Salmo 63"
body = "Huyendo de su hijo Absalón, David, un rey acostumbrado al palacio, ahora duerme en la arena en peligro de muerte y escasez."
output = "test_v6_salmo63.png"

# Ejecutar el motor real
cmd = ["python3", "src/graphics_engine.py", "phase1", output, title, body]
subprocess.run(cmd)

print(f"Imagen generada: {os.path.abspath(output)}")
