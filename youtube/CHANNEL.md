# Canal de YouTube de SRv6.md: guía de lanzamiento

Todo lo que se puede automatizar ya está en este repo: el plan de estudios
(`course.yaml`), los guiones (`scripts/`), el generador de video
(`tools/video.py`) y el arte del canal (`branding/`). Esta guía cubre lo que
solo puedes hacer tú: crear y configurar el canal, y subir cada video.

## 1. Crear el canal (una sola vez)

1. Entra a YouTube con la cuenta de Google que será dueña del canal. Lo ideal
   es una **cuenta de marca** ("Brand Account"), así puedes dar acceso a otras
   personas sin compartir tu contraseña.
2. Nombre del canal: **SRv6.md**. Handle: **@LearnSRv6** (canal creado el 28 de octubre
   de 2026 como cuenta de marca).
3. **Verifica el canal con tu teléfono** (youtube.com/verify). Sin esto no
   puedes subir miniaturas personalizadas ni videos de más de 15 minutos.
4. **Personalización → Branding:**
   - Foto del perfil: `branding/avatar.png`
   - Imagen del banner: `branding/banner.png`
   - Marca de agua del video: `branding/watermark.png`, "al final del video"
5. **Personalización → Información básica:**
   - Descripción del canal (copiar y pegar):

     > The free SRv6 course. SRv6.md teaches Segment Routing over IPv6
     > from your first SID to TI-LFA, L3VPN, migration from MPLS, vendor
     > configuration and SRv6 for AI networks. Every video has a written lesson
     > with RFC references on srv6.md, and hands-on labs you can run on your
     > laptop. Vendor-neutral, no sign-up, no paywall.
     >
     > Course: https://srv6.md/learn/

   - Enlaces: `https://srv6.md/learn/` (Learn SRv6),
     `https://srv6.md` (SRv6.md) y `https://github.com/eldaninavas/srv6.md`
     (GitHub).
   - Palabras clave del canal: `srv6, segment routing, segment routing over
     ipv6, mpls, ipv6, network engineering, ccie service provider, ti-lfa,
     evpn, ai networking`
6. **Configuración → Valores predeterminados de subida:**
   - Categoría: **Educación**.
   - Idioma del video: inglés (cámbialo a español en los videos de esa ruta).
   - Licencia: **Creative Commons - Atribución**, coherente con la licencia MIT
     del sitio y para que otros puedan reutilizar los videos citándote.
   - Comentarios: activados, con moderación de enlaces.
7. **Playlists:** crea una por ruta, con el nombre exacto del campo `title` de
   cada ruta en `course.yaml`, en este orden: Start Here, Track 1 a Track 6,
   RFCs Explained (Shorts) y SRv6 en español.

Cuando el canal exista, pon su URL en `course.yaml` (`channel_url:`) y
corre `venv/bin/python youtube/tools/course_page.py`. Así srv6.md/learn/
empieza a enlazarlo.

## 2. Producir un video

    # Chromium para dibujar las escenas (el mismo de tools/diagrams)
    export CHROME_PATH=~/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell
    venv/bin/python youtube/tools/check_script.py youtube/scripts/f06.yaml
    venv/bin/python youtube/tools/video.py youtube/scripts/f06.yaml

El resultado queda en `youtube/out/<id>/`:

| Archivo | Para qué |
|---------|----------|
| `<id>.mp4` | El video, 1080p (o 1080x1920 si es Short) |
| `<id>.srt` | Subtítulos |
| `description.txt` | Descripción con capítulos y enlaces, lista para pegar |
| `thumbnail.png` | Miniatura 1280x720 |
| `upload.json` | Título, tags, playlist, idioma y duración |

### Tu voz en lugar de la voz sintética (muy recomendado)

La voz de macOS sirve para revisar, pero en YouTube técnico la voz del autor
genera mucha más confianza. Graba cada escena leyendo su `say:` del guion y
guárdala como `youtube/voice/<id>/<número de escena>.wav` (01.wav, 02.wav…; o
.m4a). El generador usa tu grabación en cada escena donde exista y ajusta la
duración y los subtítulos solo. La app Notas de voz o QuickTime con cualquier
micrófono USB es suficiente; graba en un cuarto sin eco.

## 3. Subir un video (checklist)

1. Sube `<id>.mp4`.
2. **Título:** el de `upload.json`. **Descripción:** pega `description.txt`
   completo; los capítulos se crean solos con los tiempos.
3. **Miniatura:** `thumbnail.png`.
4. **Playlist:** la de `upload.json`.
5. **Tags:** los de `upload.json`, separados por coma.
6. **¿Es contenido para niños?** No.
7. **Subtítulos → Subir archivo → Con tiempos:** `<id>.srt`, en el idioma del
   video.
8. **Pantalla final:** "Video recomendado: siguiente video de la playlist" y
   "Suscribirse".
9. **Publicar.** Después, fija un comentario con el enlace a la lección
   escrita.
10. Copia el ID del video (lo que va después de `watch?v=`) a su lección en
    `course.yaml` (`youtube: <id>`) y corre `course_page.py`. La página
    del curso mostrará el enlace "Watch".

## 4. Orden y ritmo de publicación

Empieza por lo que ya tiene demanda medida en Search Console:

1. **f06 SRv6 vs MPLS:** Google cita un video de YouTube en esa búsqueda.
2. **f01 What is SRv6?** y el Short **s01 SRv6 in 100 Seconds**.
3. **c03 TI-LFA** y **a01 MRC and SRv6:** búsquedas con impresiones y poca
   competencia en video.
4. Después, Track 1 completo en orden, y la ruta en español en paralelo.

Ritmo sostenible: **2 lecciones largas y 3 Shorts por semana**. Publicar con
regularidad pesa más en YouTube que publicar mucho de golpe.

## 5. Qué medir (YouTube Studio → Estadísticas)

- **Fuentes de tráfico:** "Búsqueda de YouTube" e "Externo" (Google). Deben
  crecer semana a semana.
- **Retención media:** apunta a más del 40% en lecciones largas. Si cae en
  un punto, mejora esa escena del guion y vuelve a renderizar.
- **Clics hacia srv6.md:** en Search Console, el tráfico con referencia
  youtube.com.
