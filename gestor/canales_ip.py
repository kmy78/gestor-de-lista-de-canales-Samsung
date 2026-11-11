# -*- coding: utf-8 -*-
"""Motor para insertar canales IP (streaming) en un Channel_list de Samsung."""
import sqlite3, json, zipfile, os, shutil, random, string

GRUPOS = [18874370, 18874434, 18874498]
MARCA = "LOCALIPTV"
MARCAS_ANTIGUAS = ("TEST",)   # pruebas anteriores
SLOT_MIN, SLOT_MAX = 4001, 4999
PLANTILLA = 4005
SRVID_BASE = -8070414248360300000
_TMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".tmp")


def _tmpdir():
    os.makedirs(_TMP, exist_ok=True)
    d = os.path.join(_TMP, "".join(random.choice(string.ascii_lowercase) for _ in range(8)))
    os.makedirs(d, exist_ok=True)
    return d


def _es_nuestro(pid):
    pid = pid or ""
    return pid == MARCA or any(pid.startswith(m) for m in MARCAS_ANTIGUAS)


def _dec(v):
    if isinstance(v, bytes):
        return v.decode("utf-16-be", "replace")
    if isinstance(v, str):
        return v.encode("utf-16-le", "replace").decode("utf-16-be", "replace")
    return str(v)


def leer_zip(path):
    with zipfile.ZipFile(path) as z:
        orden = [i.filename for i in z.infolist()]
        datos = {n: z.read(n) for n in orden}
    faltan = [n for n in ("dvbt", "ipsrv", "metadata.xml") if n not in datos]
    if faltan:
        raise ValueError("No parece un Channel_list de Samsung; faltan: %s" % ", ".join(faltan))
    return datos, orden


def _abrir_ipsrv(datos):
    d = _tmpdir()
    ruta = os.path.join(d, "ipsrv")
    with open(ruta, "wb") as f:
        f.write(datos["ipsrv"])
    return ruta, d


def leer_canales(zip_base):
    datos, _ = leer_zip(zip_base)
    ruta, d = _abrir_ipsrv(datos)
    db = sqlite3.connect(ruta)
    res = []
    try:
        for srvId, major in db.execute("SELECT srvId, major FROM SRV ORDER BY major"):
            fila = db.execute("SELECT jsonMeta FROM SRV_IP WHERE srvId=?", (srvId,)).fetchone()
            if not fila:
                continue
            try:
                meta = json.loads(bytes(fila[0]).decode("utf-16-be"))
            except Exception:
                continue
            if _es_nuestro(meta.get("provider_id")):
                nm = db.execute("SELECT srvName FROM SRV WHERE srvId=?", (srvId,)).fetchone()[0]
                res.append({"slot": major, "nombre": _dec(nm), "url": meta.get("default_url", ""), "logo": meta.get("logo_url", "")})
    finally:
        db.close(); shutil.rmtree(d, ignore_errors=True)
    vistos, limpio = set(), []
    for c in res:
        if c["slot"] not in vistos:
            vistos.add(c["slot"]); limpio.append(c)
    return limpio


def slots_usados(zip_base):
    datos, _ = leer_zip(zip_base)
    ruta, d = _abrir_ipsrv(datos)
    db = sqlite3.connect(ruta)
    try:
        return set(m for (m,) in db.execute("SELECT DISTINCT major FROM SRV"))
    finally:
        db.close(); shutil.rmtree(d, ignore_errors=True)


def slots_libres(zip_base):
    usados = slots_usados(zip_base)
    return [m for m in range(SLOT_MIN, SLOT_MAX + 1) if m not in usados]


def construir(zip_base, canales, zip_salida):
    datos, orden = leer_zip(zip_base)
    ruta, d = _abrir_ipsrv(datos)
    db = sqlite3.connect(ruta); cur = db.cursor()
    try:
        cols_srv = [c[1] for c in cur.execute("PRAGMA table_info(SRV)")]
        cols_ip = [c[1] for c in cur.execute("PRAGMA table_info(SRV_IP)")]

        borrar = []
        for srvId, jm in cur.execute("SELECT srvId, jsonMeta FROM SRV_IP"):
            try:
                if _es_nuestro(json.loads(bytes(jm).decode("utf-16-be")).get("provider_id")):
                    borrar.append(srvId)
            except Exception:
                pass
        for sid in borrar:
            cur.execute("DELETE FROM SRV WHERE srvId=?", (sid,))
            cur.execute("DELETE FROM SRV_IP WHERE srvId=?", (sid,))

        usados = set(m for (m,) in cur.execute("SELECT DISTINCT major FROM SRV"))
        libres = [m for m in range(SLOT_MIN, SLOT_MAX + 1) if m not in usados]
        asignados, salida = set(), []
        for ch in canales:
            slot = ch.get("slot")
            if slot:
                slot = int(slot)
                if slot in libres:
                    libres.remove(slot)           # que el automatico no lo vuelva a ofrecer
            else:
                slot = libres.pop(0) if libres else None
            if slot is None:
                raise ValueError("No quedan huecos libres entre %d y %d" % (SLOT_MIN, SLOT_MAX))
            if slot in asignados:
                raise ValueError("El numero %d ya esta en uso en la lista" % slot)
            asignados.add(slot)
            salida.append((slot, ch["nombre"].strip(), ch["url"].strip(), (ch.get("logo") or "").strip()))

        n = 0
        for slot, nombre, url, logo in salida:
            for chId in GRUPOS:
                p = cur.execute("SELECT srvId FROM SRV WHERE chId=? AND major=?", (chId, PLANTILLA)).fetchone()
                if not p:
                    p = cur.execute("SELECT srvId FROM SRV WHERE chId=? ORDER BY major LIMIT 1", (chId,)).fetchone()
                sid_tpl = p[0]
                row = dict(zip(cols_srv, cur.execute("SELECT * FROM SRV WHERE srvId=?", (sid_tpl,)).fetchone()))
                rowip = dict(zip(cols_ip, cur.execute("SELECT * FROM SRV_IP WHERE srvId=?", (sid_tpl,)).fetchone()))
                meta = json.loads(bytes(rowip["jsonMeta"]).decode("utf-16-be"))

                nuevo = SRVID_BASE - n
                n += 1
                row.update({"srvId": nuevo, "major": slot, "minor": 0, "hidden": 0,
                            "srvName": nombre.encode("utf-16-be").decode("utf-16-le")})
                meta.update({"default_url": url, "service_id": "ES%09d" % (abs(nuevo) % 1000000000),
                             "provider_id": MARCA, "provider_name": "IPTV local",
                             "srv_major": str(slot), "srv_minor": "", "stream_type": "LIVE", "logo_url": logo})
                rowip.update({"srvId": nuevo,
                              "jsonMeta": json.dumps(meta, ensure_ascii=False).encode("utf-16-be")})

                cur.execute("INSERT INTO SRV (%s) VALUES (%s)" % (",".join(cols_srv), ",".join("?" * len(cols_srv))),
                            [row[c] for c in cols_srv])
                cur.execute("INSERT INTO SRV_IP (%s) VALUES (%s)" % (",".join(cols_ip), ",".join("?" * len(cols_ip))),
                            [rowip[c] for c in cols_ip])
        db.commit()
        estado = cur.execute("PRAGMA integrity_check").fetchone()[0]
        if estado != "ok":
            raise RuntimeError("La base resultante no pasa integrity_check: %s" % estado)
        total = cur.execute("SELECT COUNT(*) FROM SRV").fetchone()[0]
    finally:
        db.close()

    datos["ipsrv"] = open(ruta, "rb").read()
    shutil.rmtree(d, ignore_errors=True)

    tmpf = zip_salida + ".tmp"
    with zipfile.ZipFile(tmpf, "w", zipfile.ZIP_DEFLATED) as z:
        for nombre in orden:
            z.writestr(nombre, datos[nombre])
    os.replace(tmpf, zip_salida)
    return {"canales": len(salida), "filas": total, "zip": zip_salida}


def comprobar_url(url, timeout=8):
    import urllib.request
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            trozo = r.read(400).decode("utf-8", "replace")
            if "#EXTM3U" in trozo:
                return True, "HLS valido (HTTP %d)" % r.status
            return False, "Responde HTTP %d pero no es un manifiesto HLS" % r.status
    except Exception as e:
        return False, "Error: %s" % e

# ---------------------------------------------------------------- logos
CATALOGO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logos_es.json")
_API = "https://api.github.com/repos/tv-logo/tv-logos/contents/countries/spain"
_RAW = "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/spain/"


def _slug(texto):
    import unicodedata, re
    s = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\b(hd|uhd|sd|fhd|4k)\b", " ", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def catalogo_logos(recargar=False):
    """Devuelve {slug: url} con los logos disponibles de Espana."""
    import urllib.request
    if not recargar and os.path.exists(CATALOGO):
        try:
            with open(CATALOGO, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    try:
        req = urllib.request.Request(_API, headers={"User-Agent": "gestor-canales"})
        with urllib.request.urlopen(req, timeout=20) as r:
            datos = json.loads(r.read().decode("utf-8"))
        mapa = {}
        for item in datos:
            if item.get("type") != "file" or not item["name"].lower().endswith(".png"):
                continue
            slug = item["name"][:-4]
            if slug.endswith("-es"):
                slug = slug[:-3]
            mapa[slug] = _RAW + item["name"]
        with open(CATALOGO, "w", encoding="utf-8") as f:
            json.dump(mapa, f, ensure_ascii=False, indent=0)
        return mapa
    except Exception:
        return {}


def buscar_logo(nombre):
    """Devuelve (url, slug) del logo mas parecido, o (None, None)."""
    cat = catalogo_logos()
    if not cat:
        return None, None
    s = _slug(nombre)
    if not s:
        return None, None

    def compacto(x):
        return x.replace("-", "")

    indice = {}
    for k in cat:
        indice.setdefault(compacto(k), k)
    cs = compacto(s)
    if cs in indice:
        return cat[indice[cs]], indice[cs]

    candidatos = [k for k in cat if compacto(k).startswith(cs) or cs.startswith(compacto(k))]
    if not candidatos:
        candidatos = [k for k in cat if cs in compacto(k) or compacto(k) in cs]
    if not candidatos:
        return None, None
    mejor = sorted(candidatos, key=lambda k: (abs(len(compacto(k)) - len(cs)), k))[0]
    return cat[mejor], mejor