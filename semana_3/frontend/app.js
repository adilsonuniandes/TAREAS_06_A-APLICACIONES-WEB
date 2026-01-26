class ApiClientes {
    constructor(baseUrl, timeoutMs = 12000) {
        this.baseUrl = baseUrl;
        this.timeoutMs = timeoutMs;
    }

    async request(path = "", options = {}) {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            const txt = await res.text();

            let json = null;
            try { json = txt ? JSON.parse(txt) : null; } catch {}

            if (!res.ok) {
                const msg = txt || (json ? JSON.stringify(json) : `HTTP ${res.status}`);
                throw new Error(msg);
            }

            return json;
        } catch (e) {
            if (e?.name === "AbortError") throw new Error(`Tiempo de espera agotado (${this.timeoutMs / 1000}s).`);
            throw e;
        } finally {
            clearTimeout(timer);
        }
    }

    list() { return this.request(""); }

    create(payload) {
        return this.request("", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    }

    update(id, payload) {
        return this.request(`/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
    }

    remove(id) {
        return this.request(`/${id}`, { method: "DELETE" });
    }
}

class ClienteForm {
    constructor(modalEl) {
        this.modal = M.Modal.init(modalEl, { dismissible: false });
    }

    setTitle(text) { document.getElementById("modalTitle").textContent = text; }

    getId() {
        const raw = document.getElementById("cliente_id").value;
        return raw ? parseInt(raw, 10) : null;
    }

    clear() {
        document.getElementById("cliente_id").value = "";
        ["empresa","identificacion","nombres","apellidos","email","telefono","direccion","referido_por","canal_referencia"]
            .forEach(id => document.getElementById(id).value = "");
        document.getElementById("activo").value = "true";
        M.FormSelect.init(document.querySelectorAll("select"));
        M.updateTextFields();
    }

    fill(c) {
        document.getElementById("cliente_id").value = c.clienteId;
        document.getElementById("empresa").value = c.empresa ?? "";
        document.getElementById("identificacion").value = c.identificacion ?? "";
        document.getElementById("nombres").value = c.nombres ?? "";
        document.getElementById("apellidos").value = c.apellidos ?? "";
        document.getElementById("email").value = c.email ?? "";
        document.getElementById("telefono").value = c.telefono ?? "";
        document.getElementById("direccion").value = c.direccion ?? "";
        document.getElementById("referido_por").value = c.referidoPor ?? "";
        document.getElementById("canal_referencia").value = c.canalReferencia ?? "";
        document.getElementById("activo").value = String(!!c.activo);
        M.FormSelect.init(document.querySelectorAll("select"));
        M.updateTextFields();
    }

    read() {
        const v = (id) => document.getElementById(id).value.trim();
        return {
            empresa: v("empresa"),
            identificacion: v("identificacion"),
            nombres: v("nombres"),
            apellidos: v("apellidos"),
            email: v("email") || null,
            telefono: v("telefono") || null,
            direccion: v("direccion") || null,
            referidoPor: v("referido_por") || null,
            canalReferencia: v("canal_referencia") || null,
            activo: document.getElementById("activo").value === "true"
        };
    }

    validate(p) {
        if (!p.empresa || !p.identificacion || !p.nombres || !p.apellidos) {
            throw new Error("Complete: Empresa, Identificación, Nombres y Apellidos.");
        }
        if (p.identificacion.length < 5) {
            throw new Error("Identificación debe tener al menos 5 caracteres.");
        }
    }

    open() { this.modal.open(); }
    close() { this.modal.close(); }
}

class ClientesUI {
    constructor() {
        this.tbody = document.getElementById("tbody");
        this.loading = document.getElementById("loading");
        this.errorBox = document.getElementById("errorBox");
        this.empty = document.getElementById("empty");
        this.tableWrap = document.getElementById("tableWrap");

        this.pagerInfo = document.getElementById("pagerInfo");
        this.pagerPage = document.getElementById("pagerPage");
        this.btnPrev = document.getElementById("btnPrev");
        this.btnNext = document.getElementById("btnNext");

        this.setLoading(false);
        this.setEmpty(false);
        this.setError("");
    }

    setLoading(on) {
        this.loading.style.display = on ? "block" : "none";
        if (on) this.setEmpty(false);
    }

    setError(msg) {
        if (!msg) { this.errorBox.hidden = true; this.errorBox.textContent = ""; return; }
        this.errorBox.textContent = msg;
        this.errorBox.hidden = false;
    }

    setEmpty(visible) {
        this.empty.style.display = visible ? "flex" : "none";
        this.tableWrap.style.display = visible ? "none" : "block";
    }

    estadoCliente(activo) {
        return activo
            ? `<span class="badge-chip badge-on">VIGENTE</span>`
            : `<span class="badge-chip badge-off">CADUCADO</span>`;
    }

    escape(s) {
        return (s ?? "").toString()
            .replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");
    }

    renderTable(rows, onEdit, onDelete) {
        this.tbody.innerHTML = "";

        const hasRows = Array.isArray(rows) && rows.length > 0;
        this.setEmpty(!hasRows);

        if (!hasRows) return;

        for (const c of rows) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${c.clienteId}</td>
        <td>${this.escape(c.empresa)}</td>
        <td>${this.escape(c.identificacion)}</td>
        <td>${this.escape(c.nombres)}</td>
        <td>${this.escape(c.apellidos)}</td>
        <td>${this.escape(c.email ?? "")}</td>
        <td>${this.escape(c.telefono ?? "")}</td>
        <td>${this.estadoCliente(!!c.activo)}</td>
        <td>
          <a class="btn-small waves-effect waves-light btn-primary" data-edit="${c.clienteId}" title="Editar">
            <i class="material-icons">edit</i>
          </a>
          <a class="btn-small waves-effect waves-light red" data-del="${c.clienteId}" title="Eliminar">
            <i class="material-icons">delete</i>
          </a>
        </td>
      `;
            this.tbody.appendChild(tr);
        }

        this.tbody.querySelectorAll("[data-edit]").forEach(btn =>
            btn.addEventListener("click", () => onEdit(parseInt(btn.dataset.edit, 10)))
        );

        this.tbody.querySelectorAll("[data-del]").forEach(btn =>
            btn.addEventListener("click", () => onDelete(parseInt(btn.dataset.del, 10)))
        );
    }

    renderPager(meta, onPrev, onNext) {
        this.pagerPage.textContent = String(meta.page);
        this.pagerInfo.textContent = meta.total ? `Mostrando ${meta.from}–${meta.to} de ${meta.total}` : "—";

        this.btnPrev.classList.toggle("disabled", meta.page <= 1);
        this.btnNext.classList.toggle("disabled", meta.page >= meta.pages);

        this.btnPrev.onclick = (e) => { e.preventDefault(); if (meta.page > 1) onPrev(); };
        this.btnNext.onclick = (e) => { e.preventDefault(); if (meta.page < meta.pages) onNext(); };
    }
}

class App {
    constructor() {
        this.api = new ApiClientes("http://localhost:5000/api/clientes", 12000);
        this.ui = new ClientesUI();
        this.form = new ClienteForm(document.getElementById("modalCliente"));

        this.state = { all: [], q: "", page: 1, pageSize: 10 };
        this.inFlight = false;
        this.needsReload = false;
    }

    init() {
        M.FormSelect.init(document.querySelectorAll("select"));
        M.updateTextFields();

        document.getElementById("btnNuevo").addEventListener("click", () => this.openNew());
        document.getElementById("btnRefrescar").addEventListener("click", () => this.reload());

        document.getElementById("txtBuscar").addEventListener("input", (e) => {
            this.state.q = e.target.value;
            this.state.page = 1;
            this.render();
        });

        document.getElementById("selPageSize").addEventListener("change", (e) => {
            this.state.pageSize = parseInt(e.target.value, 10);
            this.state.page = 1;
            this.render();
        });

        document.getElementById("frmCliente").addEventListener("submit", (e) => this.save(e));

        this.reload();
    }

    async reload() {
        if (this.inFlight) { this.needsReload = true; return; }
        this.inFlight = true;
        this.needsReload = false;

        this.ui.setError("");
        this.ui.setLoading(true);

        try {
            const data = await this.api.list();
            this.state.all = Array.isArray(data) ? data : [];
            this.render();
        } catch (err) {
            this.ui.setError(`No se pudo cargar: ${err.message}`);
            await Swal.fire({ icon: "error", title: "Error", text: err.message });
        } finally {
            this.ui.setLoading(false);
            this.inFlight = false;

            if (this.needsReload) {
                this.needsReload = false;
                await this.reload();
            }
        }
    }

    filtered() {
        const q = (this.state.q ?? "").toLowerCase().trim();
        if (!q) return [...this.state.all];
        return this.state.all.filter(c => {
            const hay = [c.empresa, c.identificacion, c.nombres, c.apellidos, c.email].join(" ").toLowerCase();
            return hay.includes(q);
        });
    }

    paginate(items) {
        const total = items.length;
        const pages = Math.max(1, Math.ceil(total / this.state.pageSize));
        const page = Math.min(Math.max(1, this.state.page), pages);
        const start = (page - 1) * this.state.pageSize;
        const slice = items.slice(start, start + this.state.pageSize);
        return {
            slice,
            meta: {
                total, page, pages,
                from: total ? start + 1 : 0,
                to: total ? Math.min(start + this.state.pageSize, total) : 0
            }
        };
    }

    render() {
        const items = this.filtered();
        const { slice, meta } = this.paginate(items);

        this.ui.renderTable(
            slice,
            (id) => this.openEdit(id),
            (id) => this.confirmDelete(id)
        );

        this.ui.renderPager(meta,
            () => { this.state.page -= 1; this.render(); },
            () => { this.state.page += 1; this.render(); }
        );
    }

    openNew() {
        this.form.setTitle("Nuevo cliente");
        this.form.clear();
        this.form.open();
    }

    openEdit(id) {
        const c = this.state.all.find(x => x.clienteId === id);
        if (!c) return;
        this.form.setTitle(`Editar cliente #${id}`);
        this.form.fill(c);
        this.form.open();
    }

    async save(e) {
        e.preventDefault();

        let payload, id;
        try {
            payload = this.form.read();
            this.form.validate(payload);
            id = this.form.getId();
        } catch (err) {
            this.ui.setError(err.message);
            await Swal.fire({ icon: "warning", title: "Validación", text: err.message });
            return;
        }

        this.ui.setLoading(true);
        try {
            if (id == null) {
                await this.api.create(payload);
                await Swal.fire({ icon: "success", title: "Creado", text: "Cliente creado correctamente." });
            } else {
                await this.api.update(id, payload);
                await Swal.fire({ icon: "success", title: "Actualizado", text: "Cliente actualizado correctamente." });
            }

            this.form.close();
            await this.reload();
        } catch (err) {
            this.ui.setError(err.message);
            await Swal.fire({ icon: "error", title: "Error", text: err.message });
        } finally {
            this.ui.setLoading(false);
        }
    }

    async confirmDelete(id) {
        const c = this.state.all.find(x => x.clienteId === id);
        const name = c ? `${c.nombres} ${c.apellidos}` : `#${id}`;

        const result = await Swal.fire({
            icon: "warning",
            title: "Eliminar cliente",
            html: `Se eliminará <b>${name}</b> de la base de datos.`,
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d32f2f"
        });

        if (!result.isConfirmed) return;

        this.ui.setLoading(true);
        try {
            await this.api.remove(id);
            await Swal.fire({ icon: "success", title: "Eliminado", text: "Cliente eliminado." });
            await this.reload();
        } catch (err) {
            this.ui.setError(err.message);
            await Swal.fire({ icon: "error", title: "Error", text: err.message });
        } finally {
            this.ui.setLoading(false);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const app = new App();
    app.init();
});
