# Gestor de canales IP para Samsung

Herramienta para añadir canales de streaming (HLS) a la lista del televisor, sin tocar la TDT.

## Cómo se abre

Doble clic en **`Iniciar gestor.bat`**. No hace falta instalar nada: usa el Python que ya tienes
y solo bibliotecas estándar.

Si prefieres la consola: `python gestor_canales.py`

## Flujo de trabajo

1. **Elige el ZIP** que exporta el televisor (*Menú → Emisión → Configuración experta →
   Transferir lista de canales → Exportar a USB*). La herramienta lo recuerda para la próxima vez
   y lee de ahí los canales que ya hayas añadido.
2. **Añade canales**: nombre, URL del `.m3u8` y, si quieres, un número concreto (4001–4999).
   Si dejas el número vacío, se asigna automáticamente el primer hueco libre.
3. **Comprobar URL** (opcional): descarga los primeros bytes y te dice si es un manifiesto HLS
   de verdad. Útil para descartar enlaces muertos antes de importar.
4. **Generar ZIP para el televisor**: crea un `Channel_list...zip` nuevo.
5. Copia ese ZIP al USB **en la misma carpeta donde el televisor dejó el original** e impórtalo.

## Qué hace exactamente

- Reemplaza **solo los canales que ha creado esta herramienta** (los marca con `provider_id =
  LOCALIPTV`). Samsung TV Plus y el resto de la lista quedan intactos.
- Por cada canal inserta **3 filas**, una por cada grupo interno del televisor, replicando una
  entrada real como plantilla para heredar todos los campos que espera el reproductor.
- Conserva `dvbt`, `dvbs`, `sat` y `metadata.xml` tal cual: **no reordena la TDT**.
- Comprueba la integridad de la base resultante antes de empaquetar.

## Qué se puede meter

| Formato | ¿Vale? |
|---|---|
| HLS (`.m3u8`, con o sin parámetros en la URL) | **Sí** |
| MPEG-DASH (`.mpd`) | Probablemente, sin probar |
| MP4 progresivo | Poco fiable |
| `.ts` suelto, RTMP, RTSP, UDP | **No** |
| Streams con DRM (Widevine/PlayReady) | **No** |

Limitación importante: la entrada IP **no permite cabeceras**. Los streams que exigen un
`Referer` o un `User-Agent` concreto devolverán 403 y no se verán.

## Si algo sale mal

Importa de nuevo tu ZIP original: la importación reemplaza la lista entera y vuelves al estado
anterior. Guarda siempre una copia del export original.

## Línea de comandos

```bash
python gestor_canales.py --cli --base Channel_list.zip --out salida.zip --list
python gestor_canales.py --cli --base Channel_list.zip --out salida.zip \
    --add "Esport3|https://.../master.m3u8" --add "Otro|https://.../index.m3u8"
```

## Ficheros

| Fichero | Para qué |
|---|---|
| `gestor_canales.py` | La ventana (y el modo `--cli`) |
| `canales_ip.py` | El motor: lee, inserta y empaqueta |
| `Iniciar gestor.bat` | Lanzador de doble clic |
| `config.json` | Recuerda el último ZIP usado (se crea solo) |

## Logo del canal: NO funciona en el televisor

Comprobado con pruebas en el aparato: **el televisor no pinta el logo de los canales propios**.

El motivo está en el formato. Los 567 canales de Samsung TV Plus llevan el logo en
`tvpnlogopeu.samsungcloud.tv`, con una ruta plantilla:

```
…/platform/image/sourcelogo/vc/%02d/<service_id>_<fecha>.png
```

Es decir, el logo se resuelve **contra la CDN de Samsung usando el `service_id`**, y esa CDN solo sirve a
dispositivos Samsung (una petición normal devuelve 403). Como nuestros canales llevan un identificador
inventado, no hay imagen que devolver, y el campo `logo_url` se ignora.

El campo sigue en la herramienta y el botón **Buscar** localiza el logo en el catálogo público, pero es
decorativo: no aparecerá en la guía del televisor. Se deja por si un firmware futuro lo usara.

**Alternativa real:** el GigaBlue. Enigma2 usa *picons* (una carpeta de imágenes nombradas por la
referencia del canal) y ahí sí se ven, junto con la EPG por XMLTV.

## Guía de programación (EPG)

**No.** El export no contiene datos de programación: en `dvbt` solo hay una columna `eitPf` que es un
flag, no programación, y `ipsrv` no tiene ninguna tabla de eventos. El televisor pide la EPG de los
canales IP a los servidores de Samsung, identificándolos por `service_id`; como los nuestros son
inventados, no hay nada que devolver y la guía mostrará «sin información».

Alternativas:

- **GigaBlue (Enigma2)**: soporta EPG/XMLTV para canales IPTV con el plugin EPGImport. Si el objetivo es
  tener guía de verdad para los streaming, ese es el sitio.
- **Clonar el `service_id`** de un canal de Samsung TV Plus existente: el televisor pediría la EPG de
  *ese* canal. Solo tiene sentido si nuestro stream emite ese mismo canal; si no, muestra programación
  equivocada. No lo recomiendo.

## Buscar el logo por el nombre

En vez de pegar la URL a mano, escribe el nombre del canal y pulsa **Buscar**. La herramienta consulta el
catálogo público `tv-logo/tv-logos` (263 logos de España), normaliza el nombre y rellena la URL sola:

| Escribes | Encuentra |
|---|---|
| `Antena 3` | `antena-3-es.png` |
| `Esport3` | `esport-3-es.png` |
| `laSexta` | `lasexta-es.png` |
| `Canal Sur` | `canal-sur-1-es.png` |

Si no hay coincidencia (por ejemplo `La 1`, que no está en el catálogo), te avisa y puedes pegar la URL
manualmente. El listado se guarda en `logos_es.json`; se puede refrescar borrando ese fichero.

**Ojo:** esto resuelve *encontrar* el logo, no garantiza que el televisor lo pinte. Los canales de
Samsung llevan el logo en su propia CDN indexado por `service_id`, así que sigue pendiente comprobar si
el campo `logo_url` se usa en canales propios.
