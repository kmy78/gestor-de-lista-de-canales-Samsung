# -*- coding: utf-8 -*-
"""Gestor de canales IP para Samsung: añade streaming, logo y orden a tu Channel_list."""
import os, sys, json, tkinter as tk
from tkinter import ttk, filedialog, messagebox

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import canales_ip as motor

CONFIG = os.path.join(AQUI, "config.json")
GRIS = "#666666"


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Gestor de canales IP - Samsung")
        self.geometry("980x580")
        self.minsize(860, 500)
        self.canales = []
        self.base = ""
        self._construir_ui()
        self._cargar_config()
        if self.base and os.path.exists(self.base):
            self._cargar_desde_zip()

    def _construir_ui(self):
        pad = {"padx": 6, "pady": 4}

        frm = ttk.LabelFrame(self, text="1. Fichero de canales del televisor (Channel_list...zip)")
        frm.pack(fill="x", **pad)
        self.var_base = tk.StringVar()
        ttk.Entry(frm, textvariable=self.var_base).pack(side="left", fill="x", expand=True, padx=6, pady=8)
        ttk.Button(frm, text="Examinar...", command=self._elegir_zip).pack(side="left", padx=4, pady=8)
        ttk.Button(frm, text="Recargar", command=self._cargar_desde_zip).pack(side="left", padx=(0, 6), pady=8)

        medio = ttk.Frame(self)
        medio.pack(fill="both", expand=True, **pad)

        izq = ttk.LabelFrame(medio, text="2. Canales de streaming añadidos")
        izq.pack(side="left", fill="both", expand=True)
        cols = ("slot", "nombre", "logo", "url")
        self.tabla = ttk.Treeview(izq, columns=cols, show="headings", height=14)
        for c, t, w in (("slot", "Nº", 60), ("nombre", "Nombre", 170), ("logo", "Logo", 55), ("url", "URL", 520)):
            self.tabla.heading(c, text=t)
            self.tabla.column(c, width=w, anchor="w")
        vs = ttk.Scrollbar(izq, orient="vertical", command=self.tabla.yview)
        hs = ttk.Scrollbar(izq, orient="horizontal", command=self.tabla.xview)
        self.tabla.configure(yscrollcommand=vs.set, xscrollcommand=hs.set)
        self.tabla.grid(row=0, column=0, sticky="nsew", padx=(6, 0), pady=6)
        vs.grid(row=0, column=1, sticky="ns", pady=6)
        hs.grid(row=1, column=0, sticky="ew", padx=(6, 0))
        izq.rowconfigure(0, weight=1); izq.columnconfigure(0, weight=1)
        self.tabla.bind("<<TreeviewSelect>>", self._seleccionar)

        der = ttk.LabelFrame(medio, text="3. Añadir / editar")
        der.pack(side="left", fill="y", padx=(8, 0))
        ttk.Label(der, text="Nombre").grid(row=0, column=0, sticky="w", padx=8, pady=(10, 2))
        self.var_nombre = tk.StringVar()
        ttk.Entry(der, textvariable=self.var_nombre, width=34).grid(row=1, column=0, padx=8, sticky="ew")
        ttk.Label(der, text="URL del .m3u8").grid(row=2, column=0, sticky="w", padx=8, pady=(8, 2))
        self.var_url = tk.StringVar()
        ttk.Entry(der, textvariable=self.var_url, width=34).grid(row=3, column=0, padx=8, sticky="ew")
        ttk.Label(der, text="Nº (vacío = automático)").grid(row=4, column=0, sticky="w", padx=8, pady=(8, 2))
        self.var_slot = tk.StringVar()
        ttk.Entry(der, textvariable=self.var_slot, width=10).grid(row=5, column=0, padx=8, sticky="w")
        ttk.Label(der, text="Logo (el televisor NO lo muestra)").grid(row=6, column=0, sticky="w", padx=8, pady=(8, 2))
        fila_logo = ttk.Frame(der)
        fila_logo.grid(row=7, column=0, padx=8, sticky="ew")
        self.var_logo = tk.StringVar()
        ttk.Entry(fila_logo, textvariable=self.var_logo, width=24).pack(side="left", fill="x", expand=True)
        ttk.Button(fila_logo, text="Buscar", width=8, command=self._buscar_logo).pack(side="left", padx=(4, 0))

        caja = ttk.Frame(der)
        caja.grid(row=8, column=0, padx=8, pady=10, sticky="ew")
        ttk.Button(caja, text="Añadir", command=self._anadir).pack(fill="x", pady=2)
        ttk.Button(caja, text="Guardar cambios", command=self._editar).pack(fill="x", pady=2)
        ttk.Button(caja, text="Quitar seleccionado", command=self._quitar).pack(fill="x", pady=2)
        ttk.Button(caja, text="Comprobar URL", command=self._comprobar).pack(fill="x", pady=(10, 2))

        pie = ttk.Frame(self)
        pie.pack(fill="x", **pad)
        ttk.Button(pie, text="Generar ZIP para el televisor", command=self._generar).pack(side="left")
        ttk.Button(pie, text="Abrir carpeta", command=self._abrir_carpeta).pack(side="left", padx=6)
        ttk.Button(pie, text="Ver huecos libres", command=self._huecos).pack(side="left")

        self.estado = tk.StringVar(value="Listo.")
        ttk.Label(self, textvariable=self.estado, foreground=GRIS, anchor="w").pack(fill="x", padx=10, pady=(0, 8))

    def _cargar_config(self):
        try:
            with open(CONFIG, encoding="utf-8") as f:
                self.base = json.load(f).get("base", "")
        except Exception:
            self.base = ""
        self.var_base.set(self.base)

    def _guardar_config(self):
        try:
            with open(CONFIG, "w", encoding="utf-8") as f:
                json.dump({"base": self.base}, f)
        except Exception:
            pass

    def _elegir_zip(self):
        ruta = filedialog.askopenfilename(title="Channel_list del televisor",
                                          filetypes=[("Channel list", "*.zip"), ("Todos", "*.*")])
        if ruta:
            self.base = ruta; self.var_base.set(ruta); self._guardar_config(); self._cargar_desde_zip()

    def _cargar_desde_zip(self):
        self.base = self.var_base.get().strip()
        if not self.base or not os.path.exists(self.base):
            self.estado.set("Elige primero el ZIP exportado por el televisor."); return
        try:
            self.canales = motor.leer_canales(self.base); self._refrescar()
            self.estado.set("%d canal(es) propio(s) en la lista base." % len(self.canales))
        except Exception as e:
            messagebox.showerror("Error", "No se pudo leer el ZIP:\n%s" % e)

    def _refrescar(self):
        self.tabla.delete(*self.tabla.get_children())
        for i, c in enumerate(sorted(self.canales, key=lambda x: (x["slot"] or 0))):
            self.tabla.insert("", "end", iid=str(i),
                              values=(c["slot"] or "auto", c["nombre"], "sí" if c.get("logo") else "—", c["url"]))

    def _seleccionar(self, _=None):
        sel = self.tabla.selection()
        if not sel:
            return
        c = sorted(self.canales, key=lambda x: (x["slot"] or 0))[int(sel[0])]
        self.var_nombre.set(c["nombre"]); self.var_url.set(c["url"])
        self.var_slot.set("" if c["slot"] is None else c["slot"])
        self.var_logo.set(c.get("logo") or "")

    def _leer_form(self):
        nombre = self.var_nombre.get().strip()
        url = self.var_url.get().strip()
        slot = self.var_slot.get().strip()
        logo = self.var_logo.get().strip()
        if not nombre:
            messagebox.showwarning("Falta el nombre", "Ponle un nombre al canal."); return None
        if not url.lower().startswith(("http://", "https://")):
            messagebox.showwarning("URL no válida", "La URL debe empezar por http:// o https://"); return None
        if logo and not logo.lower().startswith(("http://", "https://")):
            messagebox.showwarning("Logo no válido", "El logo debe ser una URL http(s)."); return None
        if slot:
            if not slot.isdigit():
                messagebox.showwarning("Número no válido", "El número debe ser un entero."); return None
            slot = int(slot)
            if not (motor.SLOT_MIN <= slot <= motor.SLOT_MAX):
                messagebox.showwarning("Fuera de rango", "Usa un número entre %d y %d." % (motor.SLOT_MIN, motor.SLOT_MAX))
                return None
        else:
            slot = None
        return {"nombre": nombre, "url": url, "slot": slot, "logo": logo}

    def _anadir(self):
        c = self._leer_form()
        if not c:
            return
        if c["slot"] is not None and any(x["slot"] == c["slot"] for x in self.canales):
            messagebox.showwarning("Número ocupado", "Ya hay un canal con el número %d." % c["slot"]); return
        self.canales.append(c); self._refrescar()
        self.estado.set("Añadido «%s». Recuerda generar el ZIP." % c["nombre"])
        self.var_nombre.set(""); self.var_url.set(""); self.var_slot.set(""); self.var_logo.set("")

    def _editar(self):
        sel = self.tabla.selection()
        if not sel:
            messagebox.showinfo("Sin selección", "Selecciona antes un canal de la tabla."); return
        c = self._leer_form()
        if not c:
            return
        ordenados = sorted(self.canales, key=lambda x: (x["slot"] or 0))
        objetivo = ordenados[int(sel[0])]
        if c["slot"] is None:
            c["slot"] = objetivo["slot"]
        if any(x is not objetivo and x["slot"] == c["slot"] for x in self.canales):
            messagebox.showwarning("Número ocupado", "Ya hay un canal con el número %d." % c["slot"]); return
        self.canales[self.canales.index(objetivo)] = c
        self._refrescar(); self.estado.set("Actualizado «%s»." % c["nombre"])

    def _quitar(self):
        sel = self.tabla.selection()
        if not sel:
            return
        objetivo = sorted(self.canales, key=lambda x: (x["slot"] or 0))[int(sel[0])]
        if messagebox.askyesno("Quitar", "¿Quitar «%s»?" % objetivo["nombre"]):
            self.canales.remove(objetivo); self._refrescar(); self.estado.set("Quitado.")

    def _buscar_logo(self):
        nombre = self.var_nombre.get().strip()
        if not nombre:
            messagebox.showinfo("Sin nombre", "Escribe primero el nombre del canal."); return
        self.estado.set("Buscando logo de «%s»…" % nombre); self.update_idletasks()
        try:
            url, slug = motor.buscar_logo(nombre)
        except Exception as e:
            messagebox.showerror("Error", "No se pudo consultar el catálogo:\n%s" % e); return
        if url:
            self.var_logo.set(url)
            self.estado.set("Logo encontrado: %s" % slug)
        else:
            self.estado.set("Sin coincidencia para «%s». Pega la URL a mano." % nombre)

    def _comprobar(self):
        url = self.var_url.get().strip()
        if not url:
            messagebox.showinfo("Sin URL", "Escribe una URL primero."); return
        self.estado.set("Comprobando…"); self.update_idletasks()
        ok, detalle = motor.comprobar_url(url)
        self.estado.set(("OK - " if ok else "FALLO - ") + detalle)

    def _huecos(self):
        if not self.base or not os.path.exists(self.base):
            messagebox.showinfo("Sin ZIP base", "Elige primero el ZIP del televisor."); return
        try:
            libres = motor.slots_libres(self.base)
            messagebox.showinfo("Huecos libres", "Quedan %d números libres (del %d al %d).\n\nPrimeros: %s"
                                % (len(libres), motor.SLOT_MIN, motor.SLOT_MAX, ", ".join(map(str, libres[:12]))))
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def _generar(self):
        if not self.base or not os.path.exists(self.base):
            messagebox.showwarning("Falta el ZIP base", "Elige el Channel_list exportado por el televisor."); return
        if not self.canales and not messagebox.askyesno("Lista vacía", "No hay canales propios. ¿Generar el ZIP sin ninguno?"):
            return
        destino = filedialog.asksaveasfilename(title="Guardar ZIP para el televisor", defaultextension=".zip",
                                               initialfile="Channel_list_personalizada.zip", filetypes=[("ZIP", "*.zip")])
        if not destino:
            return
        try:
            r = motor.construir(self.base, self.canales, destino)
            messagebox.showinfo("Hecho", "ZIP generado con %d canal(es).\nFilas totales en la base IP: %d.\n\n%s\n\n"
                                "Cópialo al USB y usa:\nMenú - Emisión - Configuración experta - "
                                "Transferir lista de canales - Importar." % (r["canales"], r["filas"], destino))
            self.canales = motor.leer_canales(destino)   # muestra los numeros ya asignados
            self._refrescar()
            self.estado.set("Generado: %s" % destino)
        except Exception as e:
            messagebox.showerror("Error al generar", str(e))

    def _abrir_carpeta(self):
        carpeta = os.path.dirname(self.base) if self.base else AQUI
        try:
            os.startfile(carpeta)
        except Exception:
            pass


def cli(argv):
    import argparse
    ap = argparse.ArgumentParser(description="Gestor de canales IP para Samsung")
    ap.add_argument("--base", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--add", action="append", default=[], help="Nombre|URL[|Logo]")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args(argv)
    if a.list:
        for c in motor.leer_canales(a.base):
            print("%s\t%s\t%s\t%s" % (c["slot"], c["nombre"], c.get("logo") or "-", c["url"]))
        return
    canales = []
    for item in a.add:
        partes = item.split("|")
        canales.append({"nombre": partes[0], "url": partes[1] if len(partes) > 1 else "",
                        "logo": partes[2] if len(partes) > 2 else ""})
    r = motor.construir(a.base, canales, a.out)
    print("Generado %s con %d canales (%d filas)" % (r["zip"], r["canales"], r["filas"]))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        cli(sys.argv[2:])
    else:
        App().mainloop()