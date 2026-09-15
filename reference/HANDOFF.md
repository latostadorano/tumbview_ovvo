# Tumbview — Handoff Document

_Última actualización: 2026-09-15 — v22 promovido a la raíz del repo._

## Qué es Tumbview

Slideshow fullscreen de fotos de Tumblr, pensado para usarse como visuales en contextos de música/performance. La idea es tener una pantalla con imágenes que cambian al ritmo de lo que suena, ya sea manualmente, con tap-tempo, o con detección automática de beats por audio.

**Estado a la fecha:** la versión con audio-reactividad (antes en `v22/`) ya es la raíz del repo y la que sirve GitHub Pages — `index.html`, `style.css`, `tumbview.js` en la raíz. La carpeta `v22/` se deja como estaba (histórico de la iteración de trabajo); `v1/` y `v2/` son iteraciones aún más viejas. Sin dependencias externas, vanilla JS.

La detección de beats por audio ya funciona con música real (probado con NTS.live y YouTube vía "System audio"). Sigue pendiente el retest explícito de la última ronda de ajustes ya en producción (ver "Pendiente de probar" abajo) — se verificaron con audio sintético al implementarlos, no con música real todavía.

### Cambios de la sesión de promoción (2026-09-15)
- Botón de tap-tempo: responde a click/touch además de la tecla `Tab`; se movió a la esquina inferior derecha y se le redujo la altura (antes se superponía con la barra de menú superior).
- Barra de controles y panel de menú (Blogs/Audio) ahora son responsivos: hacen wrap en pantallas angostas en vez de cortarse, con breakpoints en 560px y 380px; targets táctiles más grandes en dispositivos touch. No se pudo verificar visualmente por debajo de ~500px de ancho (límite del entorno de prueba usado), aunque la lógica CSS es la misma ya probada a 500px con valores más chicos.
- `touchstart` ahora también despierta la UI oculta (antes solo `mousemove`, así que en touch se quedaba sin forma de volver a mostrarla).
- Dos presets nuevos en "Change every": **2** y **96** (además de los 4/8/16/24/32/48/64 ya existentes).
- Al promover a la raíz, se restauró el patrón de `config.js` para la API key (el WIP en `v22/` la había hardcodeado directamente en `tumbview.js` con una key distinta a la del repo) y el mensaje "Missing API key — see README" que la versión simple ya tenía.

---

## Funcionalidad actual

### Controles de teclado
| Tecla | Acción |
|---|---|
| `Space` | Toggle play/pause |
| `→` / `←` | Siguiente/anterior imagen (resetea timer) |
| `↑` / `↓` | Cambiar de blog activo (arriba/abajo en la lista) |
| `Tab` | Tap-tempo (ver sección abajo) |
| `A` | Alterna modo audio-reactivo on/off (requiere haber dado Start al análisis) — pareja de `Tab` para saltar rápido entre tap manual y audio sin abrir el menú |
| `F` | Toggle fullscreen |
| `Enter` | Cargar blog |
| `Esc` | Cerrar el menú |

### Tres modos de timer (mutuamente excluyentes)
El borde rojo de 1px indica cuál está activo. Activar uno desactiva los otros.

1. **Manual** — campo numérico de segundos en la barra superior. Se aplica con Enter o Tab dentro del campo.
2. **Tab tempo** — tap-tempo estilo DJ (ver sección abajo).
3. **Audio** — detección automática de beats por micrófono o audio del sistema (ver sección abajo). Ya **no se activa solo** al detectar beats — hay que darle Activate (o la tecla `A`) explícitamente. Antes se auto-activaba a los 4 intervalos válidos, lo cual competía con Tab tempo (cada beat detectado lo reactivaba, "robándose" el control de vuelta apenas tapeabas) — ese bug ya no existe.

### Menú (☰) — panel único con pestañas
Antes había dos botones/paneles separados (☰ para blogs, ♪ para audio); se unificaron en un solo botón de menú con dos pestañas internas, **Blogs** y **Audio**, para reducir el desorden visual.

- **Pestaña Blogs**: lista editable de blogs de Tumblr (solo nombre, sin `.tumblr.com`), click para cargar, `↑`/`↓` para navegar sin abrir el menú, botón Add.
- **Pestaña Audio**, 3 filas simples (ya no son "pasos" numerados con borde):
  - **Source**: Mic / System (toggle de 2 botones)
  - **Listen**: botón Start/Stop + readout de BPM en vivo (el número cambiando confirma que está escuchando y analizando — señal útil, no se debe cambiar a un "spinner" u otra cosa que la tape)
  - **Change every**: botones preset **2 / 4 / 8 / 16 / 24 / 32 / 48 / 64 / 96** beats (antes era un input numérico a mano). El valor real vive en un `<input id="beat-count" hidden>` que los presets actualizan.
  - Botón **Activate** / indicador "● Active" + **Stop** para desactivar manualmente.

El visualizador de beats (canvas estilo Rekordbox con línea de tiempo scrolleando) **se eliminó por completo** — nunca funcionó bien visualmente y no aportaba nada; el usuario pidió quitarlo. No reintroducirlo sin que lo pidan de nuevo explícitamente.

### Comportamiento de navegación manual
Cualquier cambio manual (click en foto, flechas) resetea el timer desde cero — si el timer es 4s y cambias manualmente, los 4s empiezan a contar desde ese momento.

---

## Tab tempo — lógica actual y razonamiento

### Filosofía
No es un tap-tempo para calcular BPM teórico. La idea es **marcar beats reales en tiempo real** — como cuando un editor marca cues al ritmo de una canción. Cada tap de Tab dice "aquí cayó un beat". El programa aprende el patrón y predice cuándo cae el siguiente, cambiando la imagen exactamente en ese momento predicho.

Esto es análogo al beat grid de Rekordbox/Traktor: marcas el downbeat y el software mantiene el grid solo.

### Flujo
- Tap 1: nada, solo registra
- Tap 2: primer intervalo, empieza a construir el grid
- Tap 3+: con 2+ intervalos el grid se activa y la imagen empieza a cambiar en los beats **predichos**, no cuando el usuario tapa de nuevo
- Si el ritmo cambia: tapear de nuevo recalibra instantáneamente
- Si la pausa entre taps es > 4× el intervalo actual: sesión se resetea

### Por qué se aplica en el timeout, no en keyup
`keyup` contamina la medición — el tiempo de release no es preciso ni consistente. El timer se aplica cuando el grid se establece (tap 3) y se refina con cada tap siguiente.

### Conflicto con modo Audio — resuelto
Antes, mientras el modo audio estaba activo, tapear Tab parecía "no hacer nada": sí cambiaba a modo tab por un instante, pero el siguiente beat detectado por el análisis de audio disparaba el auto-activate y volvía a tomar el control. Al quitar el auto-activate (ver sección de audio), Tab ya deja el modo tab estable. Verificado con audio sintético en sesión; falta confirmar con música real.

### Problema conocido / pendiente de probar
La lógica usa `setTimeout` dinámico (no `setInterval` fijo) para predecir el siguiente beat, recalculando el delay en cada beat para compensar drift. Funciona en las pruebas hechas, pero no se ha estresado con sesiones largas.

---

## Sistema audio — detalles técnicos

### Detección de beats — reescrita esta sesión
El algoritmo original (energía instantánea vs. promedio histórico) fallaba con música real: un bajo sostenido de fondo (presente en casi cualquier mezcla) aplana la comparación contra el promedio y el detector pierde la mitad de los golpes — el BPM mostrado se veía "creíble" (ej. 72 en vez de 120) pero estaba mal. Verificado generando una señal sintética de kicks limpios + un tono de bajo sostenido debajo, reproduciendo el fallo antes del fix.

**Algoritmo actual:**
- FFT de 4096 muestras (antes 2048 — más resolución de frecuencia, importante en dispositivos con sample rate alto).
- Banda de graves (~60-180Hz) calculada a partir del `audioCtx.sampleRate` real, no como porcentaje fijo de bins (el cálculo viejo cubría hasta ~1800Hz con sample rates típicos — mucho más que el rango de un kick).
- **Flujo espectral** (`flux = max(0, energía_actual - energía_anterior)`), no energía absoluta: un bajo sostenido tiene flujo ≈0 frame a frame; el golpe de un kick sigue produciendo un salto aunque haya bajo sostenido debajo.
- Umbral: `flux > promedio_flujo × 1.8 + 40`, con cooldown entre beats de `max(200ms, 0.4 × intervalo_esperado_por_BPM)`. El piso de 200ms es importante: sin él, un par de falsos duplicados infla el BPM aparente, lo que acorta el cooldown, lo que permite más duplicados — un ciclo que se retroalimenta solo.
- El loop de detección corre en un **`ScriptProcessorNode.onaudioprocess`**, no en `requestAnimationFrame`: rAF se congela por completo en cuanto la pestaña deja de estar visible/enfocada (confirmado: la señal de audio seguía llegando bien al analizador, pero el loop de rAF simplemente no corría). Esto pasa fácilmente en el caso real de uso — alt-tab para controlar Spotify/YouTube mientras se comparte audio de sistema.
- BPM calculado promediando los últimos 16 intervalos entre beats.
- **Ya no se auto-activa** el modo audio al acumular 4 intervalos válidos — eso generaba activaciones sorpresa y competía con Tab tempo. Ahora requiere click en Activate o la tecla `A`.

### Audio del sistema
- Usa `getDisplayMedia` con `video: { frameRate: 1 }` (mínimo video para que el browser permita audio)
- Se detienen los video tracks inmediatamente, solo se usa el audio
- Si el usuario no tickeó "Share audio" en el diálogo del browser, muestra mensaje claro
- Funciona en Chrome/Edge. Safari tiene limitaciones.
- **Confirmado funcionando** compartiendo la pestaña específica de YouTube/NTS.live con "share tab audio" activado.

### Mic
- Mismas constraints que System (`echoCancellation: false, noiseSuppression: false`) para no perder los transientes graves — antes solo System las tenía, Mic quedaba con el procesamiento automático del browser activado.

---

## Estilo / diseño

- Fondo negro, fullscreen, sin distracciones
- UI aparece en overlay superior con gradiente, se oculta a los 3s de inactividad
- Paleta escala de grises — sin color excepto el rojo `#c0392b` para indicar el modo de timer activo (ahora aplicado al botón único de menú ☰ cuando el modo activo es "audio", ya no a un ícono ♪ separado)
- Tipografía: `Courier New`, monospace
- Menú único con pestañas (Blogs / Audio) se desliza hacia abajo desde la barra superior
- Favicon: gradiente radial atardecer (morado → naranja → amarillo)

---

## Pendientes / bugs conocidos

### Pendiente de probar con audio real (próxima sesión)
- [ ] Retest completo con NTS.live/YouTube de: no-auto-activate, tecla `A`, el fix de Tab-vs-Audio, y los presets 32/48/64 — todo esto se verificó solo con audio sintético en la sesión donde se implementó
- [ ] Sesiones largas de Tab tempo (drift del `setTimeout` dinámico)
- [ ] Probar en Safari / Firefox
- [ ] Verificar el layout responsivo por debajo de ~500px de ancho real (celular físico) — solo se probó hasta 500px en el entorno de desarrollo

### Decisiones tomadas (no reabrir sin que el usuario lo pida)
- Visualizador de beats: **eliminado**, no migrar a p5.js ni reconstruirlo — nunca funcionó bien y no aportaba.
- Menú: unificado en un panel con pestañas Blogs/Audio en vez de dos botones/paneles separados.

### Deuda técnica
- [x] Subir a la raíz del repo / GitHub — hecho 2026-09-15
- [ ] Considerar `localStorage` para persistir la lista de blogs entre sesiones
