
import subprocess

# Phase 2: Revelación
title2 = "REVELACIÓN"
body2 = "David declara que su sed de Dios es más fuerte que su sed física en una tierra seca. Usa la madrugada para saciarse con adoración."
output2 = "test_v6_revelacion.png"
subprocess.run(["python3", "src/graphics_engine.py", "phase2", output2, title2, body2])

# Phase 3: Esperanza
title3 = "ESPERANZA"
body3 = "En medio de tu intimidad de madrugada, Su gracia te sostiene. ¡Tu victoria viene de lo alto!"
output3 = "test_v6_esperanza.png"
subprocess.run(["python3", "src/graphics_engine.py", "phase3", output3, title3, body3])

print("Imágenes generadas con éxito.")
