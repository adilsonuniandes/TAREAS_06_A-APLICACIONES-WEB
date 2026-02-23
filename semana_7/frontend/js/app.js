/* =========================================================
   CONFIGURACIÓN
========================================================= */
const API_BASE = "http://localhost:5000";
const CLAVE_SESION = "ep1_sesion";

/* =========================================================
   ELEMENTOS DOM
========================================================= */
const vistaInicio = document.getElementById("vista_inicio");
const vistaApp = document.getElementById("vista_app");

const formInicio = document.getElementById("form_inicio");
const inUsuario = document.getElementById("usuario");
const inContrasena = document.getElementById("contrasena");
const msgInicio = document.getElementById("msg_inicio");

const btnCerrar = document.getElementById("btn_cerrar");
const metaUsuario = document.getElementById("meta_usuario");
const pillRoles = document.getElementById("pill_roles");

const tituloModulo = document.getElementById("titulo_modulo");
const subtituloModulo = document.getElementById("subtitulo_modulo");
const accionesModulo = document.getElementById("acciones_modulo");
const tablaWrapper = document.getElementById("tabla_wrapper");

const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modal_titulo");
const modalSubtitulo = document.getElementById("modal_subtitulo");
const modalForm = document.getElementById("modal_form");
const modalGuardar = document.getElementById("modal_guardar");
const modalCerrar = document.getElementById("modal_cerrar");
const modalCancelar = document.getElementById("modal_cancelar");

// MENÚ USUARIOS (solo admin)
const navUsuarios = document.getElementById("nav_usuarios");

/* =========================================================
   ESTADO
========================================================= */
let estado = {
    ruta: "departamentos",
    lista: [],
    filtro: "",
    pagina: 1,
    tamPagina: 10,
};

/* =========================================================
   SESIÓN
========================================================= */
function guardarSesion(s) { localStorage.setItem(CLAVE_SESION, JSON.stringify(s)); }
function leerSesion() {
    const raw = localStorage.getItem(CLAVE_SESION);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}
function limpiarSesion() { localStorage.removeItem(CLAVE_SESION); }

function tieneRol(rol) {
    const s = leerSesion();
    const roles = (s?.roles || []).map(r => String(r).trim().toLowerCase());
    return roles.includes(String(rol).trim().toLowerCase());
}
function puedeEscribir() { return tieneRol("administrador") || tieneRol("supervisor"); }
function puedeEliminar() { return tieneRol("administrador"); }
function puedeAdministrarUsuarios() { return tieneRol("administrador"); }

/* =========================================================
   FORZAR VISIBILIDAD MENÚ USUARIOS (ANTI-CSS JODIDO)
========================================================= */
function aplicarMenuUsuariosForzado() {
    if (!navUsuarios) return;

    const esAdmin = puedeAdministrarUsuarios();

    navUsuarios.hidden = !esAdmin;

    if (esAdmin) {
        navUsuarios.removeAttribute("hidden");
        navUsuarios.style.display = "block";
        navUsuarios.style.visibility = "visible";
        navUsuarios.style.opacity = "1";
        navUsuarios.style.pointerEvents = "auto";
        navUsuarios.style.position = "relative";
        navUsuarios.style.zIndex = "2";
    } else {
        navUsuarios.style.display = "";
        navUsuarios.style.visibility = "";
        navUsuarios.style.opacity = "";
        navUsuarios.style.pointerEvents = "";
        navUsuarios.style.position = "";
        navUsuarios.style.zIndex = "";
    }
}

/* =========================================================
   HTTP
========================================================= */
async function apiFetch(ruta, opciones = {}) {
    const sesion = leerSesion();
    const headers = opciones.headers ? { ...opciones.headers } : {};
    headers["Content-Type"] = "application/json";
    if (sesion?.token) headers["Authorization"] = `Bearer ${sesion.token}`;

    const resp = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });

    if (resp.status === 204) return null;

    const txt = await resp.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }

    if (!resp.ok) {
        const msg = typeof data === "string" ? data : (data?.title || data?.message || "Error en la solicitud.");
        throw new Error(`${resp.status}: ${msg}`);
    }
    return data;
}

/* =========================================================
   UTILIDADES UI
========================================================= */
function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function btn(texto, clase, onClick) {
    const b = document.createElement("button");
    b.className = `btn ${clase || ""}`.trim();
    b.textContent = texto;
    b.addEventListener("click", onClick);
    return b;
}

function setAcciones(botones) {
    accionesModulo.innerHTML = "";
    botones.forEach(b => accionesModulo.appendChild(b));
}

/* =========================================================
   MODAL
========================================================= */
function abrirModal({ titulo, subtitulo, campos, valores, onGuardar }) {
    modalTitulo.textContent = titulo;
    modalSubtitulo.textContent = subtitulo || "";
    modalForm.innerHTML = "";

    campos.forEach(c => {
        const wrap = document.createElement("label");
        wrap.textContent = c.label;

        let input;
        if (c.tipo === "select") {
            input = document.createElement("select");
            (c.opciones || []).forEach(o => {
                const opt = document.createElement("option");
                opt.value = String(o.value);
                opt.textContent = o.text;
                input.appendChild(opt);
            });
        } else {
            input = document.createElement("input");
            input.type = c.tipo || "text";
            if (c.placeholder) input.placeholder = c.placeholder;
        }

        input.id = c.id;
        input.required = !!c.required;

        const v = valores?.[c.id];
        if (v !== undefined && v !== null) input.value = String(v);

        wrap.appendChild(input);
        modalForm.appendChild(wrap);
    });

    modalGuardar.onclick = onGuardar;
    modal.hidden = false;
}

function cerrarModal() {
    modal.hidden = true;
    modalGuardar.onclick = null;
}

modalCerrar.addEventListener("click", cerrarModal);
modalCancelar.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => { if (e.target === modal) cerrarModal(); });

/* =========================================================
   TOOLBAR + PAGINACIÓN
========================================================= */
function toolbarHtml() {
    return `
    <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:end; margin-bottom:12px;">
      <label style="min-width:280px; flex:1;">
        Buscar
        <input id="buscador" placeholder="Escriba para filtrar..." />
      </label>

      <label style="width:170px;">
        Tamaño página
        <select id="tam_pagina">
          ${[5,10,15,20,50].map(n => `<option value="${n}">${n}</option>`).join("")}
        </select>
      </label>

      <div style="display:flex; gap:10px; align-items:center; margin-left:auto;">
        <button class="btn btn--secundario" id="btn_refrescar">Refrescar</button>
      </div>
    </div>
  `;
}

function paginar(lista) {
    const total = lista.length;
    const tam = estado.tamPagina;
    const paginas = Math.max(1, Math.ceil(total / tam));

    if (estado.pagina > paginas) estado.pagina = paginas;
    if (estado.pagina < 1) estado.pagina = 1;

    const inicio = (estado.pagina - 1) * tam;
    const fin = Math.min(inicio + tam, total);

    return { total, paginas, inicio, fin, paginaLista: lista.slice(inicio, fin) };
}

function paginacionHtml(total, paginas, inicio, fin) {
    const desde = total === 0 ? 0 : inicio + 1;
    const hasta = fin;

    return `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-top:12px;">
      <div class="muted">Mostrando ${desde}-${hasta} de ${total}</div>

      <div style="display:flex; gap:8px; align-items:center;">
        <button class="btn btn--secundario" id="pag_prev" ${estado.pagina === 1 ? "disabled" : ""}>Anterior</button>
        <div class="muted">Página <b>${estado.pagina}</b> de <b>${paginas}</b></div>
        <button class="btn btn--secundario" id="pag_next" ${estado.pagina === paginas ? "disabled" : ""}>Siguiente</button>
      </div>
    </div>
  `;
}

function aplicarEventosToolbar() {
    const buscador = document.getElementById("buscador");
    const tamPagina = document.getElementById("tam_pagina");
    const btnRefrescar = document.getElementById("btn_refrescar");

    buscador.value = estado.filtro || "";
    tamPagina.value = String(estado.tamPagina);

    buscador.addEventListener("input", () => {
        estado.filtro = buscador.value.trim().toLowerCase();
        estado.pagina = 1;
        renderTabla();
    });

    tamPagina.addEventListener("change", () => {
        estado.tamPagina = Number(tamPagina.value);
        estado.pagina = 1;
        renderTabla();
    });

    btnRefrescar.addEventListener("click", async () => {
        await cargarModuloActual(true);
    });
}

function aplicarEventosPaginacion(paginas) {
    const prev = document.getElementById("pag_prev");
    const next = document.getElementById("pag_next");

    if (prev) prev.addEventListener("click", () => {
        if (estado.pagina > 1) { estado.pagina--; renderTabla(); }
    });

    if (next) next.addEventListener("click", () => {
        if (estado.pagina < paginas) { estado.pagina++; renderTabla(); }
    });
}

/* =========================================================
   CARGA MÓDULO ACTUAL
========================================================= */
async function cargarModuloActual(forzar = false) {
    tablaWrapper.innerHTML = `<div class="muted">Cargando...</div>`;

    try {
        aplicarMenuUsuariosForzado();

        if (estado.ruta === "departamentos") {
            tituloModulo.textContent = "Departamentos";
            subtituloModulo.textContent = "Mantenimiento de departamentos.";
            if (forzar || estado.lista.length === 0) estado.lista = await apiFetch("/api/departamentos");
        }

        if (estado.ruta === "empleados") {
            tituloModulo.textContent = "Empleados";
            subtituloModulo.textContent = "Mantenimiento de empleados (correo único).";
            if (forzar || estado.lista.length === 0) estado.lista = await apiFetch("/api/empleados");
        }

        if (estado.ruta === "asignaciones") {
            tituloModulo.textContent = "Asignaciones";
            subtituloModulo.textContent = "Asignar empleados a departamentos.";
            if (forzar || estado.lista.length === 0) estado.lista = await apiFetch("/api/asignaciones");
        }

        if (estado.ruta === "usuarios") {
            if (!puedeAdministrarUsuarios()) throw new Error("403: Solo el administrador puede acceder a Usuarios.");
            tituloModulo.textContent = "Usuarios";
            subtituloModulo.textContent = "Administración de usuarios (solo administrador).";
            if (forzar || estado.lista.length === 0) estado.lista = await apiFetch("/api/usuarios");
        }

        if (estado.ruta === "facturas") {
            tituloModulo.textContent = "Facturas";
            subtituloModulo.textContent = "Listado y reporte imprimible de facturas.";
            if (forzar || estado.lista.length === 0) {
                try {
                    estado.lista = await apiFetch("/api/facturas");
                } catch {
                    // Si no tienes endpoint de listado, igual sirve el reporte por ID manual
                    estado.lista = [];
                }
            }
        }

        const acciones = [];

        if (estado.ruta === "facturas") {
            acciones.push(btn("Ver reporte por ID", "btn--secundario", async () => {
                const { value: facturaId } = await Swal.fire({
                    title: "Reporte de factura",
                    input: "number",
                    inputLabel: "Ingrese el ID de la factura",
                    inputPlaceholder: "Ej: 1",
                    showCancelButton: true,
                    confirmButtonText: "Ver",
                    cancelButtonText: "Cancelar"
                });
                if (!facturaId) return;
                await verReporteFactura(Number(facturaId));
            }));
        } else if (estado.ruta === "usuarios") {
            if (puedeAdministrarUsuarios()) acciones.push(btn("Nuevo", "btn--primario", () => crearUsuario()));
        } else {
            if (puedeEscribir()) acciones.push(btn("Nuevo", "btn--primario", () => accionNuevo()));
        }

        setAcciones(acciones);

        renderTabla();
    } catch (e) {
        await Swal.fire({ icon: "error", title: "Error", text: e.message });
        tablaWrapper.innerHTML = `<div class="muted">No se pudo cargar la información.</div>`;
    }
}

function filtrarLista(lista) {
    const f = estado.filtro;
    if (!f) return lista;
    return lista.filter(x => JSON.stringify(x).toLowerCase().includes(f));
}

function renderTabla() {
    const listaFiltrada = filtrarLista(estado.lista || []);
    const { total, paginas, inicio, fin, paginaLista } = paginar(listaFiltrada);

    let html = toolbarHtml();
    html += tablaPorModulo(paginaLista);
    html += paginacionHtml(total, paginas, inicio, fin);

    tablaWrapper.innerHTML = html;

    aplicarEventosToolbar();
    aplicarEventosPaginacion(paginas);
    enlazarAccionesTabla(paginaLista);
}

function tablaPorModulo(lista) {
    if (estado.ruta === "departamentos") return tablaDepartamentos(lista);
    if (estado.ruta === "empleados") return tablaEmpleados(lista);
    if (estado.ruta === "asignaciones") return tablaAsignaciones(lista);
    if (estado.ruta === "usuarios") return tablaUsuarios(lista);
    if (estado.ruta === "facturas") return tablaFacturas(lista);
    return `<div class="muted">Módulo no implementado.</div>`;
}

function enlazarAccionesTabla(lista) {
    if (estado.ruta === "departamentos") return enlazarDepartamentos(lista);
    if (estado.ruta === "empleados") return enlazarEmpleados(lista);
    if (estado.ruta === "asignaciones") return enlazarAsignaciones(lista);
    if (estado.ruta === "usuarios") return enlazarUsuarios(lista);
    if (estado.ruta === "facturas") return enlazarFacturas(lista);
}

/* =========================================================
   DEPARTAMENTOS
========================================================= */
function tablaDepartamentos(lista) {
    if (lista.length === 0) return `<div class="muted">No hay registros.</div>`;

    return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Nombre</th><th>Ubicación</th><th>Jefe</th><th>Extensión</th>
          <th style="width:260px;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(d => `
          <tr>
            <td>${d.departamentoId}</td>
            <td>${escapeHtml(d.nombre)}</td>
            <td>${escapeHtml(d.ubicacion)}</td>
            <td>${escapeHtml(d.jefeDepartamento)}</td>
            <td>${escapeHtml(d.extension)}</td>
            <td>
              <div class="actions">
                <button class="btn btn--secundario" data-ver="${d.departamentoId}">Ver</button>
                ${puedeEscribir() ? `<button class="btn btn--secundario" data-editar="${d.departamentoId}">Editar</button>` : ""}
                ${puedeEliminar() ? `<button class="btn btn--peligro" data-eliminar="${d.departamentoId}">Eliminar</button>` : ""}
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function enlazarDepartamentos(lista) {
    document.querySelectorAll("[data-ver]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-ver"));
            const d = lista.find(x => x.departamentoId === id);
            await Swal.fire({
                icon: "info",
                title: `Departamento #${d.departamentoId}`,
                html: `
          <div style="text-align:left;">
            <b>Nombre:</b> ${escapeHtml(d.nombre)}<br>
            <b>Ubicación:</b> ${escapeHtml(d.ubicacion)}<br>
            <b>Jefe:</b> ${escapeHtml(d.jefeDepartamento)}<br>
            <b>Extensión:</b> ${escapeHtml(d.extension)}<br>
          </div>
        `
            });
        });
    });

    document.querySelectorAll("[data-editar]").forEach(b => {
        b.addEventListener("click", () => {
            const id = Number(b.getAttribute("data-editar"));
            const d = estado.lista.find(x => x.departamentoId === id);
            editarDepartamento(d);
        });
    });

    document.querySelectorAll("[data-eliminar]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-eliminar"));
            const d = estado.lista.find(x => x.departamentoId === id);
            await eliminarDepartamento(d);
        });
    });
}

function accionNuevo() {
    if (estado.ruta === "departamentos") return crearDepartamento();
    if (estado.ruta === "empleados") return crearEmpleado();
    if (estado.ruta === "asignaciones") return crearAsignacion();
}

function crearDepartamento() {
    abrirModal({
        titulo: "Nuevo departamento",
        subtitulo: "Complete los datos del departamento.",
        campos: [
            { id: "nombre", label: "Nombre", required: true },
            { id: "ubicacion", label: "Ubicación" },
            { id: "jefeDepartamento", label: "Jefe del departamento" },
            { id: "extension", label: "Extensión" }
        ],
        valores: {},
        onGuardar: async () => {
            const payload = {
                nombre: document.getElementById("nombre").value.trim(),
                ubicacion: document.getElementById("ubicacion").value.trim() || null,
                jefeDepartamento: document.getElementById("jefeDepartamento").value.trim() || null,
                extension: document.getElementById("extension").value.trim() || null,
            };
            try {
                await apiFetch("/api/departamentos", { method: "POST", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon: "success", title: "Creado", text: "Departamento creado correctamente." });
                estado.lista = await apiFetch("/api/departamentos");
                renderTabla();
            } catch (e) {
                await Swal.fire({ icon: "error", title: "Error", text: e.message });
            }
        }
    });
}

function editarDepartamento(d) {
    abrirModal({
        titulo: `Editar departamento #${d.departamentoId}`,
        subtitulo: "Actualice los datos.",
        campos: [
            { id: "nombre", label: "Nombre", required: true },
            { id: "ubicacion", label: "Ubicación" },
            { id: "jefeDepartamento", label: "Jefe del departamento" },
            { id: "extension", label: "Extensión" }
        ],
        valores: {
            nombre: d.nombre || "",
            ubicacion: d.ubicacion || "",
            jefeDepartamento: d.jefeDepartamento || "",
            extension: d.extension || ""
        },
        onGuardar: async () => {
            const payload = {
                nombre: document.getElementById("nombre").value.trim(),
                ubicacion: document.getElementById("ubicacion").value.trim() || null,
                jefeDepartamento: document.getElementById("jefeDepartamento").value.trim() || null,
                extension: document.getElementById("extension").value.trim() || null,
            };
            try {
                await apiFetch(`/api/departamentos/${d.departamentoId}`, { method: "PUT", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon: "success", title: "Actualizado", text: "Departamento actualizado." });
                estado.lista = await apiFetch("/api/departamentos");
                renderTabla();
            } catch (e) {
                await Swal.fire({ icon: "error", title: "Error", text: e.message });
            }
        }
    });
}

async function eliminarDepartamento(d) {
    const r = await Swal.fire({
        icon: "warning",
        title: "Confirmar eliminación",
        text: `¿Eliminar el departamento "${d.nombre}"?`,
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });
    if (!r.isConfirmed) return;

    try {
        await apiFetch(`/api/departamentos/${d.departamentoId}`, { method: "DELETE" });
        await Swal.fire({ icon: "success", title: "Eliminado", text: "Departamento eliminado." });
        estado.lista = await apiFetch("/api/departamentos");
        renderTabla();
    } catch (e) {
        await Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
}

/* =========================================================
   EMPLEADOS
========================================================= */
function tablaEmpleados(lista) {
    if (lista.length === 0) return `<div class="muted">No hay registros.</div>`;

    return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Nombre</th><th>Apellido</th><th>Correo</th><th>Teléfono</th>
          <th style="width:260px;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(e => `
          <tr>
            <td>${e.empleadoId}</td>
            <td>${escapeHtml(e.nombre)}</td>
            <td>${escapeHtml(e.apellido)}</td>
            <td>${escapeHtml(e.email)}</td>
            <td>${escapeHtml(e.telefono)}</td>
            <td>
              <div class="actions">
                <button class="btn btn--secundario" data-ver-emp="${e.empleadoId}">Ver</button>
                ${puedeEscribir() ? `<button class="btn btn--secundario" data-editar-emp="${e.empleadoId}">Editar</button>` : ""}
                ${puedeEliminar() ? `<button class="btn btn--peligro" data-eliminar-emp="${e.empleadoId}">Eliminar</button>` : ""}
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function enlazarEmpleados(lista) {
    document.querySelectorAll("[data-ver-emp]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-ver-emp"));
            const e = lista.find(x => x.empleadoId === id);
            await Swal.fire({
                icon: "info",
                title: `Empleado #${e.empleadoId}`,
                html: `
          <div style="text-align:left;">
            <b>Nombre:</b> ${escapeHtml(e.nombre)}<br>
            <b>Apellido:</b> ${escapeHtml(e.apellido)}<br>
            <b>Correo:</b> ${escapeHtml(e.email)}<br>
            <b>Teléfono:</b> ${escapeHtml(e.telefono)}<br>
          </div>
        `
            });
        });
    });

    document.querySelectorAll("[data-editar-emp]").forEach(b => {
        b.addEventListener("click", () => {
            const id = Number(b.getAttribute("data-editar-emp"));
            const e = estado.lista.find(x => x.empleadoId === id);
            editarEmpleado(e);
        });
    });

    document.querySelectorAll("[data-eliminar-emp]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-eliminar-emp"));
            const e = estado.lista.find(x => x.empleadoId === id);
            await eliminarEmpleado(e);
        });
    });
}

function crearEmpleado() {
    abrirModal({
        titulo: "Nuevo empleado",
        subtitulo: "Complete los datos del empleado.",
        campos: [
            { id: "nombre", label: "Nombre", required: true },
            { id: "apellido", label: "Apellido", required: true },
            { id: "email", label: "Correo", required: true, tipo: "email" },
            { id: "telefono", label: "Teléfono" }
        ],
        valores: {},
        onGuardar: async () => {
            const payload = {
                nombre: document.getElementById("nombre").value.trim(),
                apellido: document.getElementById("apellido").value.trim(),
                email: document.getElementById("email").value.trim(),
                telefono: document.getElementById("telefono").value.trim() || null
            };
            try {
                await apiFetch("/api/empleados", { method: "POST", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon: "success", title: "Creado", text: "Empleado creado correctamente." });
                estado.lista = await apiFetch("/api/empleados");
                renderTabla();
            } catch (e) {
                await Swal.fire({ icon: "error", title: "Error", text: e.message });
            }
        }
    });
}

function editarEmpleado(e) {
    abrirModal({
        titulo: `Editar empleado #${e.empleadoId}`,
        subtitulo: "Actualice los datos.",
        campos: [
            { id: "nombre", label: "Nombre", required: true },
            { id: "apellido", label: "Apellido", required: true },
            { id: "email", label: "Correo", required: true, tipo: "email" },
            { id: "telefono", label: "Teléfono" }
        ],
        valores: {
            nombre: e.nombre || "",
            apellido: e.apellido || "",
            email: e.email || "",
            telefono: e.telefono || ""
        },
        onGuardar: async () => {
            const payload = {
                nombre: document.getElementById("nombre").value.trim(),
                apellido: document.getElementById("apellido").value.trim(),
                email: document.getElementById("email").value.trim(),
                telefono: document.getElementById("telefono").value.trim() || null
            };
            try {
                await apiFetch(`/api/empleados/${e.empleadoId}`, { method: "PUT", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon: "success", title: "Actualizado", text: "Empleado actualizado." });
                estado.lista = await apiFetch("/api/empleados");
                renderTabla();
            } catch (err) {
                await Swal.fire({ icon: "error", title: "Error", text: err.message });
            }
        }
    });
}

async function eliminarEmpleado(e) {
    const r = await Swal.fire({
        icon: "warning",
        title: "Confirmar eliminación",
        text: `¿Eliminar al empleado "${e.nombre} ${e.apellido}"?`,
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });
    if (!r.isConfirmed) return;

    try {
        await apiFetch(`/api/empleados/${e.empleadoId}`, { method: "DELETE" });
        await Swal.fire({ icon: "success", title: "Eliminado", text: "Empleado eliminado." });
        estado.lista = await apiFetch("/api/empleados");
        renderTabla();
    } catch (err) {
        await Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
}

/* =========================================================
   ASIGNACIONES
========================================================= */
function tablaAsignaciones(lista) {
    if (lista.length === 0) return `<div class="muted">No hay registros.</div>`;

    return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Empleado</th><th>Departamento</th><th>Fecha</th>
          <th style="width:220px;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${lista.map(a => {
        const emp = a.empleado ? `${a.empleado.nombre} ${a.empleado.apellido}` : `#${a.empleadoId}`;
        const dep = a.departamento ? `${a.departamento.nombre}` : `#${a.departamentoId}`;
        return `
            <tr>
              <td>${a.asignacionId}</td>
              <td>${escapeHtml(emp)}</td>
              <td>${escapeHtml(dep)}</td>
              <td>${escapeHtml(a.fechaAsignacion)}</td>
              <td>
                <div class="actions">
                  <button class="btn btn--secundario" data-ver-asig="${a.asignacionId}">Ver</button>
                  ${puedeEliminar() ? `<button class="btn btn--peligro" data-eliminar-asig="${a.asignacionId}">Eliminar</button>` : ""}
                </div>
              </td>
            </tr>
          `;
    }).join("")}
      </tbody>
    </table>
  `;
}

function enlazarAsignaciones(lista) {
    document.querySelectorAll("[data-ver-asig]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-ver-asig"));
            const a = lista.find(x => x.asignacionId === id);
            const emp = a.empleado ? `${a.empleado.nombre} ${a.empleado.apellido}` : `#${a.empleadoId}`;
            const dep = a.departamento ? `${a.departamento.nombre}` : `#${a.departamentoId}`;
            await Swal.fire({
                icon: "info",
                title: `Asignación #${a.asignacionId}`,
                html: `
          <div style="text-align:left;">
            <b>Empleado:</b> ${escapeHtml(emp)}<br>
            <b>Departamento:</b> ${escapeHtml(dep)}<br>
            <b>Fecha:</b> ${escapeHtml(a.fechaAsignacion)}<br>
          </div>
        `
            });
        });
    });

    document.querySelectorAll("[data-eliminar-asig]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-eliminar-asig"));
            const a = estado.lista.find(x => x.asignacionId === id);
            await eliminarAsignacion(a);
        });
    });
}

async function crearAsignacion() {
    try {
        const [empleados, departamentos] = await Promise.all([
            apiFetch("/api/empleados"),
            apiFetch("/api/departamentos")
        ]);

        abrirModal({
            titulo: "Nueva asignación",
            subtitulo: "Seleccione empleado y departamento.",
            campos: [
                {
                    id: "empleadoId", label: "Empleado", tipo: "select", required: true,
                    opciones: empleados.map(e => ({ value: e.empleadoId, text: `${e.nombre} ${e.apellido} (#${e.empleadoId})` }))
                },
                {
                    id: "departamentoId", label: "Departamento", tipo: "select", required: true,
                    opciones: departamentos.map(d => ({ value: d.departamentoId, text: `${d.nombre} (#${d.departamentoId})` }))
                },
            ],
            valores: {},
            onGuardar: async () => {
                const payload = {
                    empleadoId: Number(document.getElementById("empleadoId").value),
                    departamentoId: Number(document.getElementById("departamentoId").value),
                };
                try {
                    await apiFetch("/api/asignaciones", { method: "POST", body: JSON.stringify(payload) });
                    cerrarModal();
                    await Swal.fire({ icon: "success", title: "Creado", text: "Asignación creada correctamente." });
                    estado.lista = await apiFetch("/api/asignaciones");
                    renderTabla();
                } catch (e) {
                    await Swal.fire({ icon: "error", title: "Error", text: e.message });
                }
            }
        });
    } catch (e) {
        await Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
}

async function eliminarAsignacion(a) {
    const r = await Swal.fire({
        icon: "warning",
        title: "Confirmar eliminación",
        text: `¿Eliminar la asignación #${a.asignacionId}?`,
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });
    if (!r.isConfirmed) return;

    try {
        await apiFetch(`/api/asignaciones/${a.asignacionId}`, { method: "DELETE" });
        await Swal.fire({ icon: "success", title: "Eliminado", text: "Asignación eliminada." });
        estado.lista = await apiFetch("/api/asignaciones");
        renderTabla();
    } catch (e) {
        await Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
}

/* =========================================================
   USUARIOS (SOLO ADMIN)
========================================================= */
function normalizarUsuarioApi(u) {
    const usuarioId = u.usuarioId ?? u.id ?? u.userId;
    const username = u.username ?? u.nombreUsuario ?? u.usuario;
    const activo = (u.activo ?? u.isActive ?? true);
    const roles = u.roles ?? u.listaRoles ?? [];
    return { ...u, usuarioId, username, activo, roles };
}

function tablaUsuarios(lista) {
    if (!puedeAdministrarUsuarios()) return `<div class="muted">No tiene permisos.</div>`;
    if (lista.length === 0) return `<div class="muted">No hay registros.</div>`;

    const n = lista.map(normalizarUsuarioApi);

    return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th><th>Usuario</th><th>Activo</th><th>Roles</th>
          <th style="width:320px;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${n.map(u => `
          <tr>
            <td>${u.usuarioId}</td>
            <td>${escapeHtml(u.username)}</td>
            <td>${u.activo ? "Sí" : "No"}</td>
            <td>${escapeHtml(Array.isArray(u.roles) ? u.roles.join(", ") : String(u.roles || ""))}</td>
            <td>
              <div class="actions">
                <button class="btn btn--secundario" data-ver-usr="${u.usuarioId}">Ver</button>
                <button class="btn btn--secundario" data-editar-usr="${u.usuarioId}">Editar</button>
                <button class="btn btn--peligro" data-eliminar-usr="${u.usuarioId}">Eliminar</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function enlazarUsuarios(lista) {
    const n = lista.map(normalizarUsuarioApi);

    document.querySelectorAll("[data-ver-usr]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-ver-usr"));
            const u = n.find(x => x.usuarioId === id);
            await Swal.fire({
                icon: "info",
                title: `Usuario #${u.usuarioId}`,
                html: `
          <div style="text-align:left;">
            <b>Usuario:</b> ${escapeHtml(u.username)}<br>
            <b>Activo:</b> ${u.activo ? "Sí" : "No"}<br>
            <b>Roles:</b> ${escapeHtml(Array.isArray(u.roles) ? u.roles.join(", ") : String(u.roles || ""))}<br>
          </div>
        `
            });
        });
    });

    document.querySelectorAll("[data-editar-usr]").forEach(b => {
        b.addEventListener("click", () => {
            const id = Number(b.getAttribute("data-editar-usr"));
            const u = n.find(x => x.usuarioId === id);
            editarUsuario(u);
        });
    });

    document.querySelectorAll("[data-eliminar-usr]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-eliminar-usr"));
            const u = n.find(x => x.usuarioId === id);
            await eliminarUsuario(u);
        });
    });
}

function crearUsuario() {
    if (!puedeAdministrarUsuarios()) return;

    abrirModal({
        titulo: "Nuevo usuario",
        subtitulo: "Crear usuario (solo admin).",
        campos: [
            { id: "username", label: "Usuario", required: true },
            { id: "contrasena", label: "Contraseña", required: true, tipo: "password" },
            { id: "activo", label: "Activo (sí/no)", placeholder: "sí" }
        ],
        valores: { activo: "sí" },
        onGuardar: async () => {
            const username = document.getElementById("username").value.trim();
            const contrasena = document.getElementById("contrasena").value;
            const activoTxt = (document.getElementById("activo").value || "").trim().toLowerCase();
            const activo = activoTxt === "" ? true : (activoTxt === "sí" || activoTxt === "si" || activoTxt === "true" || activoTxt === "1");

            try {
                await apiFetch("/api/usuarios", {
                    method: "POST",
                    body: JSON.stringify({ username, contrasena, activo })
                });
                cerrarModal();
                await Swal.fire({ icon: "success", title: "Creado", text: "Usuario creado correctamente." });
                estado.lista = await apiFetch("/api/usuarios");
                renderTabla();
            } catch (e) {
                await Swal.fire({ icon: "error", title: "Error", text: e.message });
            }
        }
    });
}

function editarUsuario(u) {
    if (!puedeAdministrarUsuarios()) return;

    abrirModal({
        titulo: `Editar usuario #${u.usuarioId}`,
        subtitulo: "Si no desea cambiar la contraseña, déjela vacía.",
        campos: [
            { id: "username", label: "Usuario", required: true },
            { id: "contrasena", label: "Nueva contraseña (opcional)", tipo: "password" },
            { id: "activo", label: "Activo (sí/no)" }
        ],
        valores: { username: u.username || "", contrasena: "", activo: u.activo ? "sí" : "no" },
        onGuardar: async () => {
            const username = document.getElementById("username").value.trim();
            const contrasena = document.getElementById("contrasena").value;
            const activoTxt = (document.getElementById("activo").value || "").trim().toLowerCase();
            const activo = activoTxt === "" ? true : (activoTxt === "sí" || activoTxt === "si" || activoTxt === "true" || activoTxt === "1");

            const payload = { username, activo };
            if (contrasena && contrasena.trim().length > 0) payload.contrasena = contrasena;

            try {
                await apiFetch(`/api/usuarios/${u.usuarioId}`, { method: "PUT", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon: "success", title: "Actualizado", text: "Usuario actualizado." });
                estado.lista = await apiFetch("/api/usuarios");
                renderTabla();
            } catch (e) {
                await Swal.fire({ icon: "error", title: "Error", text: e.message });
            }
        }
    });
}

async function eliminarUsuario(u) {
    if (!puedeAdministrarUsuarios()) return;

    const r = await Swal.fire({
        icon: "warning",
        title: "Confirmar eliminación",
        text: `¿Eliminar el usuario "${u.username}"?`,
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    });
    if (!r.isConfirmed) return;

    try {
        await apiFetch(`/api/usuarios/${u.usuarioId}`, { method: "DELETE" });
        await Swal.fire({ icon: "success", title: "Eliminado", text: "Usuario eliminado." });
        estado.lista = await apiFetch("/api/usuarios");
        renderTabla();
    } catch (e) {
        await Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
}

/* =========================================================
   FACTURAS (LISTA + REPORTE)
========================================================= */
function money(n) {
    const x = Number(n || 0);
    return x.toFixed(2);
}

function normalizarFacturaApi(f) {
    return {
        facturaId: f.facturaId ?? f.id ?? f.factura_id,
        numeroFactura: f.numeroFactura ?? f.numero ?? f.numero_factura,
        fechaEmision: f.fechaEmision ?? f.fecha ?? f.fecha_emision,
        estado: f.estado ?? f.status ?? f.estado_factura,
        total: f.total ?? 0
    };
}

function tablaFacturas(lista) {
    if (!lista || lista.length === 0) {
        return `
      <div class="muted">
        No hay listado (o tu backend no tiene <b>GET /api/facturas</b>).<br>
        Use el botón <b>Ver reporte por ID</b> arriba para imprimir.
      </div>
    `;
    }

    const n = lista.map(normalizarFacturaApi);

    return `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Número</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th class="right">Total</th>
          <th style="width:260px;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${n.map(f => `
          <tr>
            <td>${f.facturaId}</td>
            <td>${escapeHtml(f.numeroFactura)}</td>
            <td>${escapeHtml(f.fechaEmision)}</td>
            <td>${escapeHtml(f.estado)}</td>
            <td class="right">$ ${money(f.total)}</td>
            <td>
              <div class="actions">
                <button class="btn btn--secundario" data-reporte-factura="${f.facturaId}">Ver/Imprimir</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function enlazarFacturas(lista) {
    document.querySelectorAll("[data-reporte-factura]").forEach(b => {
        b.addEventListener("click", async () => {
            const id = Number(b.getAttribute("data-reporte-factura"));
            await verReporteFactura(id);
        });
    });
}

async function verReporteFactura(facturaId) {
    try {
        const f = await apiFetch(`/api/facturas/${facturaId}/reporte`);

        const filas = (f.detalles || []).map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(d.descripcion)}</td>
        <td class="right">${money(d.cantidad)}</td>
        <td class="right">${money(d.precioUnitario)}</td>
        <td class="right">${money(d.descuentoLinea)}</td>
        <td class="right">${money(d.ivaLinea)}</td>
        <td class="right">${money(d.totalLinea)}</td>
      </tr>
    `).join("");

        const html = `
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte Factura ${escapeHtml(f.numeroFactura)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color:#111; }
    .row { display:flex; justify-content:space-between; gap:16px; }
    .box { border:1px solid #ddd; padding:12px; border-radius:10px; }
    h1,h2,h3 { margin: 0 0 8px 0; }
    .muted { color:#666; font-size: 12px; }
    table { width:100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border-bottom:1px solid #eee; padding:8px; text-align:left; font-size: 13px; }
    th { background:#f7f7f7; }
    .right { text-align:right; }
    .totales { margin-top:16px; max-width: 360px; margin-left:auto; }
    .actions { margin: 12px 0; display:flex; gap:10px; }
    button { padding: 10px 12px; border-radius: 8px; border: 1px solid #ddd; cursor:pointer; }
    @media print { .actions { display:none; } }
  </style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">Imprimir</button>
    <button onclick="window.close()">Cerrar</button>
  </div>

  <div class="row">
    <div class="box" style="flex:1">
      <h2>FACTURA</h2>
      <div><b>N°:</b> ${escapeHtml(f.numeroFactura)}</div>
      <div><b>Fecha:</b> ${new Date(f.fechaEmision).toLocaleString()}</div>
      <div><b>Estado:</b> ${escapeHtml(f.estado)}</div>
      ${f.observacion ? `<div><b>Obs:</b> ${escapeHtml(f.observacion)}</div>` : ""}
      <div class="muted" style="margin-top:8px;">Generado por JavaScript (reporte imprimible)</div>
    </div>

    <div class="box" style="flex:1">
      <h3>Cliente</h3>
      <div><b>Identificación:</b> ${escapeHtml(f.cliente?.identificacion || "-")}</div>
      <div><b>Nombre/Razón social:</b> ${escapeHtml(f.cliente?.nombres || "-")}</div>
      <div><b>Dirección:</b> ${escapeHtml(f.cliente?.direccion || "-")}</div>
      <div><b>Teléfono:</b> ${escapeHtml(f.cliente?.telefono || "-")}</div>
      <div><b>Email:</b> ${escapeHtml(f.cliente?.email || "-")}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Descripción</th>
        <th class="right">Cant.</th>
        <th class="right">P. Unit</th>
        <th class="right">Desc.</th>
        <th class="right">IVA</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>${filas || `<tr><td colspan="7" class="muted">Sin detalles</td></tr>`}</tbody>
  </table>

  <div class="totales box">
    <div class="row"><div><b>Subtotal</b></div><div class="right">$ ${money(f.subtotal)}</div></div>
    <div class="row"><div><b>Descuento</b></div><div class="right">$ ${money(f.descuento)}</div></div>
    <div class="row"><div><b>IVA</b></div><div class="right">$ ${money(f.iva)}</div></div>
    <hr/>
    <div class="row"><div><b>Total</b></div><div class="right"><b>$ ${money(f.total)}</b></div></div>
  </div>
</body>
</html>
    `;

        const w = window.open("", "_blank");
        if (!w) throw new Error("El navegador bloqueó la ventana emergente (pop-up). Permita pop-ups para imprimir.");
        w.document.open();
        w.document.write(html);
        w.document.close();
    } catch (e) {
        await Swal.fire({ icon: "error", title: "No se pudo generar el reporte", text: e.message });
    }
}

/* =========================================================
   NAVEGACIÓN + SESIÓN
========================================================= */
function marcarNav() {
    document.querySelectorAll(".nav__item").forEach(b => {
        b.classList.toggle("activa", b.dataset.ruta === estado.ruta);
    });
}

function mostrarApp() {
    const s = leerSesion();
    if (!s?.token) {
        vistaInicio.hidden = false;
        vistaApp.hidden = true;
        return;
    }

    vistaInicio.hidden = true;
    vistaApp.hidden = false;

    metaUsuario.textContent = `Usuario: ${s.username}`;
    pillRoles.textContent = `Roles: ${(s.roles || []).join(", ")}`;

    aplicarMenuUsuariosForzado();
}

/* clicks menú */
document.querySelectorAll(".nav__item").forEach(b => {
    b.addEventListener("click", async () => {
        const ruta = b.dataset.ruta;

        if (ruta === "usuarios" && !puedeAdministrarUsuarios()) {
            await Swal.fire({ icon: "error", title: "Sin permisos", text: "Solo el administrador puede acceder a Usuarios." });
            return;
        }

        estado.ruta = ruta;
        estado.lista = [];
        estado.filtro = "";
        estado.pagina = 1;

        marcarNav();
        await cargarModuloActual(true);
    });
});

btnCerrar.addEventListener("click", async () => {
    limpiarSesion();
    await Swal.fire({ icon: "success", title: "Sesión cerrada", text: "Se cerró la sesión correctamente." });
    mostrarApp();
});

formInicio.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgInicio.textContent = "Ingresando...";

    const username = inUsuario.value.trim();
    const contrasena = inContrasena.value;

    try {
        const data = await apiFetch("/api/autenticacion/iniciar-sesion", {
            method: "POST",
            body: JSON.stringify({ username, contrasena })
        });

        guardarSesion({ token: data.token, username: data.username, roles: data.roles });

        aplicarMenuUsuariosForzado();

        msgInicio.textContent = "";
        await Swal.fire({ icon: "success", title: "Bienvenido", text: `Sesión iniciada como ${data.username}.` });

        mostrarApp();
        estado.ruta = "departamentos";
        marcarNav();
        await cargarModuloActual(true);

    } catch (err) {
        msgInicio.textContent = "";
        await Swal.fire({ icon: "error", title: "Error de inicio de sesión", text: String(err.message || err) });
    }
});

/* =========================================================
   INICIO
========================================================= */
(function iniciar() {
    mostrarApp();
    if (!leerSesion()) return;

    aplicarMenuUsuariosForzado();
    estado.ruta = "departamentos";
    marcarNav();
    cargarModuloActual(true).catch(async (e) => {
        await Swal.fire({ icon: "error", title: "Error", text: e.message });
    });
})();