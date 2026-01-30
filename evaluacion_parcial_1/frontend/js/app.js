const API_BASE = "http://localhost:5000";
const CLAVE_SESION = "ep1_sesion";

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

let estado = {
    ruta: "departamentos",
    lista: [],
    filtro: "",
    pagina: 1,
    tamPagina: 10,
    editando: null,
};

function guardarSesion(s){ localStorage.setItem(CLAVE_SESION, JSON.stringify(s)); }
function leerSesion(){
    const raw = localStorage.getItem(CLAVE_SESION);
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch{ return null; }
}
function limpiarSesion(){ localStorage.removeItem(CLAVE_SESION); }

function tieneRol(rol){
    const s = leerSesion();
    return (s?.roles || []).includes(rol);
}
function puedeEscribir(){ return tieneRol("administrador") || tieneRol("supervisor"); }
function puedeEliminar(){ return tieneRol("administrador"); }

async function apiFetch(ruta, opciones = {}){
    const sesion = leerSesion();
    const headers = opciones.headers ? { ...opciones.headers } : {};
    headers["Content-Type"] = "application/json";
    if(sesion?.token) headers["Authorization"] = `Bearer ${sesion.token}`;

    const resp = await fetch(`${API_BASE}${ruta}`, { ...opciones, headers });

    if(resp.status === 204) return null;

    const txt = await resp.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }

    if(!resp.ok){
        const msg = typeof data === "string" ? data : (data?.title || data?.message || "Error en la solicitud.");
        throw new Error(`${resp.status}: ${msg}`);
    }
    return data;
}

function escapeHtml(s){
    return String(s ?? "")
        .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
        .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function btn(texto, clase, onClick){
    const b = document.createElement("button");
    b.className = `btn ${clase || ""}`.trim();
    b.textContent = texto;
    b.addEventListener("click", onClick);
    return b;
}

function setAcciones(botones){
    accionesModulo.innerHTML = "";
    botones.forEach(b => accionesModulo.appendChild(b));
}

function abrirModal({ titulo, subtitulo, campos, valores, onGuardar }){
    modalTitulo.textContent = titulo;
    modalSubtitulo.textContent = subtitulo || "";
    modalForm.innerHTML = "";

    campos.forEach(c => {
        const wrap = document.createElement("label");
        wrap.textContent = c.label;

        let input;
        if(c.tipo === "select"){
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
            if(c.placeholder) input.placeholder = c.placeholder;
        }

        input.id = c.id;
        input.required = !!c.required;

        const v = valores?.[c.id];
        if(v !== undefined && v !== null) input.value = String(v);

        wrap.appendChild(input);
        modalForm.appendChild(wrap);
    });

    modalGuardar.onclick = onGuardar;
    modal.hidden = false;
}

function cerrarModal(){
    modal.hidden = true;
    modalGuardar.onclick = null;
}

modalCerrar.addEventListener("click", cerrarModal);
modalCancelar.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => { if(e.target === modal) cerrarModal(); });


function toolbarHtml(){
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

function paginar(lista){
    const total = lista.length;
    const tam = estado.tamPagina;
    const paginas = Math.max(1, Math.ceil(total / tam));

    if(estado.pagina > paginas) estado.pagina = paginas;
    if(estado.pagina < 1) estado.pagina = 1;

    const inicio = (estado.pagina - 1) * tam;
    const fin = Math.min(inicio + tam, total);

    return {
        total, paginas,
        inicio, fin,
        paginaLista: lista.slice(inicio, fin),
    };
}

function paginacionHtml(total, paginas, inicio, fin){
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

function aplicarEventosToolbar(){
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

function aplicarEventosPaginacion(paginas){
    const prev = document.getElementById("pag_prev");
    const next = document.getElementById("pag_next");

    if(prev) prev.addEventListener("click", () => {
        if(estado.pagina > 1){
            estado.pagina--;
            renderTabla();
        }
    });

    if(next) next.addEventListener("click", () => {
        if(estado.pagina < paginas){
            estado.pagina++;
            renderTabla();
        }
    });
}


async function cargarModuloActual(forzar = false){
    tablaWrapper.innerHTML = `<div class="muted">Cargando...</div>`;

    try{
        if(estado.ruta === "departamentos"){
            tituloModulo.textContent = "Departamentos";
            subtituloModulo.textContent = "Mantenimiento de departamentos.";
            if(forzar || estado.lista.length === 0) estado.lista = await apiFetch("/api/departamentos");
        }

        if(estado.ruta === "empleados"){
            tituloModulo.textContent = "Empleados";
            subtituloModulo.textContent = "Mantenimiento de empleados (correo único).";
            if(forzar || estado.lista.length === 0) estado.lista = await apiFetch("/api/empleados");
        }

        if(estado.ruta === "asignaciones"){
            tituloModulo.textContent = "Asignaciones";
            subtituloModulo.textContent = "Asignar empleados a departamentos.";
            if(forzar || estado.lista.length === 0) estado.lista = await apiFetch("/api/asignaciones");
        }

        // acciones arriba
        const acciones = [];
        if(puedeEscribir()){
            acciones.push(btn("Nuevo", "btn--primario", () => accionNuevo()));
        }
        setAcciones(acciones);

        renderTabla();

    }catch(e){
        await Swal.fire({ icon:"error", title:"Error", text: e.message });
        tablaWrapper.innerHTML = `<div class="muted">No se pudo cargar la información.</div>`;
    }
}

function filtrarLista(lista){
    const f = estado.filtro;
    if(!f) return lista;

    // filtro genérico por JSON (simple y efectivo para evaluación)
    return lista.filter(x => JSON.stringify(x).toLowerCase().includes(f));
}

function renderTabla(){
    const listaFiltrada = filtrarLista(estado.lista || []);
    const { total, paginas, inicio, fin, paginaLista } = paginar(listaFiltrada);

    // toolbar + tabla + paginación
    let html = toolbarHtml();
    html += tablaPorModulo(paginaLista);
    html += paginacionHtml(total, paginas, inicio, fin);

    tablaWrapper.innerHTML = html;

    aplicarEventosToolbar();
    aplicarEventosPaginacion(paginas);
    enlazarAccionesTabla(paginaLista);
}

function tablaPorModulo(lista){
    if(estado.ruta === "departamentos") return tablaDepartamentos(lista);
    if(estado.ruta === "empleados") return tablaEmpleados(lista);
    if(estado.ruta === "asignaciones") return tablaAsignaciones(lista);
    return `<div class="muted">Módulo no implementado.</div>`;
}

function enlazarAccionesTabla(lista){
    if(estado.ruta === "departamentos") return enlazarDepartamentos(lista);
    if(estado.ruta === "empleados") return enlazarEmpleados(lista);
    if(estado.ruta === "asignaciones") return enlazarAsignaciones(lista);
}


function tablaDepartamentos(lista){
    if(lista.length === 0) return `<div class="muted">No hay registros.</div>`;

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

function enlazarDepartamentos(lista){
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

function tablaEmpleados(lista){
    if(lista.length === 0) return `<div class="muted">No hay registros.</div>`;

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

function enlazarEmpleados(lista){
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

function tablaAsignaciones(lista){
    if(lista.length === 0) return `<div class="muted">No hay registros.</div>`;

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

function enlazarAsignaciones(lista){
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


function accionNuevo(){
    if(estado.ruta === "departamentos") return crearDepartamento();
    if(estado.ruta === "empleados") return crearEmpleado();
    if(estado.ruta === "asignaciones") return crearAsignacion();
}

function crearDepartamento(){
    abrirModal({
        titulo: "Nuevo departamento",
        subtitulo: "Complete los datos del departamento.",
        campos: [
            { id:"nombre", label:"Nombre", required:true },
            { id:"ubicacion", label:"Ubicación" },
            { id:"jefeDepartamento", label:"Jefe del departamento" },
            { id:"extension", label:"Extensión" }
        ],
        valores: {},
        onGuardar: async () => {
            const payload = {
                nombre: document.getElementById("nombre").value.trim(),
                ubicacion: document.getElementById("ubicacion").value.trim() || null,
                jefeDepartamento: document.getElementById("jefeDepartamento").value.trim() || null,
                extension: document.getElementById("extension").value.trim() || null,
            };
            try{
                await apiFetch("/api/departamentos", { method:"POST", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon:"success", title:"Creado", text:"Departamento creado correctamente." });
                estado.lista = await apiFetch("/api/departamentos");
                renderTabla();
            }catch(e){
                await Swal.fire({ icon:"error", title:"Error", text: e.message });
            }
        }
    });
}

function editarDepartamento(d){
    abrirModal({
        titulo: `Editar departamento #${d.departamentoId}`,
        subtitulo: "Actualice los datos.",
        campos: [
            { id:"nombre", label:"Nombre", required:true },
            { id:"ubicacion", label:"Ubicación" },
            { id:"jefeDepartamento", label:"Jefe del departamento" },
            { id:"extension", label:"Extensión" }
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
            try{
                await apiFetch(`/api/departamentos/${d.departamentoId}`, { method:"PUT", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon:"success", title:"Actualizado", text:"Departamento actualizado." });
                estado.lista = await apiFetch("/api/departamentos");
                renderTabla();
            }catch(e){
                await Swal.fire({ icon:"error", title:"Error", text: e.message });
            }
        }
    });
}

async function eliminarDepartamento(d){
    const r = await Swal.fire({
        icon:"warning",
        title:"Confirmar eliminación",
        text:`¿Eliminar el departamento "${d.nombre}"?`,
        showCancelButton:true,
        confirmButtonText:"Sí, eliminar",
        cancelButtonText:"Cancelar"
    });
    if(!r.isConfirmed) return;

    try{
        await apiFetch(`/api/departamentos/${d.departamentoId}`, { method:"DELETE" });
        await Swal.fire({ icon:"success", title:"Eliminado", text:"Departamento eliminado." });
        estado.lista = await apiFetch("/api/departamentos");
        renderTabla();
    }catch(e){
        await Swal.fire({ icon:"error", title:"Error", text: e.message });
    }
}

function crearEmpleado(){
    abrirModal({
        titulo:"Nuevo empleado",
        subtitulo:"Complete los datos del empleado.",
        campos:[
            { id:"nombre", label:"Nombre", required:true },
            { id:"apellido", label:"Apellido", required:true },
            { id:"email", label:"Correo", required:true, tipo:"email" },
            { id:"telefono", label:"Teléfono" }
        ],
        valores:{},
        onGuardar: async () => {
            const payload = {
                nombre: document.getElementById("nombre").value.trim(),
                apellido: document.getElementById("apellido").value.trim(),
                email: document.getElementById("email").value.trim(),
                telefono: document.getElementById("telefono").value.trim() || null
            };
            try{
                await apiFetch("/api/empleados", { method:"POST", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon:"success", title:"Creado", text:"Empleado creado correctamente." });
                estado.lista = await apiFetch("/api/empleados");
                renderTabla();
            }catch(e){
                await Swal.fire({ icon:"error", title:"Error", text: e.message });
            }
        }
    });
}

function editarEmpleado(e){
    abrirModal({
        titulo:`Editar empleado #${e.empleadoId}`,
        subtitulo:"Actualice los datos.",
        campos:[
            { id:"nombre", label:"Nombre", required:true },
            { id:"apellido", label:"Apellido", required:true },
            { id:"email", label:"Correo", required:true, tipo:"email" },
            { id:"telefono", label:"Teléfono" }
        ],
        valores:{
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
            try{
                await apiFetch(`/api/empleados/${e.empleadoId}`, { method:"PUT", body: JSON.stringify(payload) });
                cerrarModal();
                await Swal.fire({ icon:"success", title:"Actualizado", text:"Empleado actualizado." });
                estado.lista = await apiFetch("/api/empleados");
                renderTabla();
            }catch(err){
                await Swal.fire({ icon:"error", title:"Error", text: err.message });
            }
        }
    });
}

async function eliminarEmpleado(e){
    const r = await Swal.fire({
        icon:"warning",
        title:"Confirmar eliminación",
        text:`¿Eliminar al empleado "${e.nombre} ${e.apellido}"?`,
        showCancelButton:true,
        confirmButtonText:"Sí, eliminar",
        cancelButtonText:"Cancelar"
    });
    if(!r.isConfirmed) return;

    try{
        await apiFetch(`/api/empleados/${e.empleadoId}`, { method:"DELETE" });
        await Swal.fire({ icon:"success", title:"Eliminado", text:"Empleado eliminado." });
        estado.lista = await apiFetch("/api/empleados");
        renderTabla();
    }catch(err){
        await Swal.fire({ icon:"error", title:"Error", text: err.message });
    }
}

async function crearAsignacion(){
    try{
        const [empleados, departamentos] = await Promise.all([
            apiFetch("/api/empleados"),
            apiFetch("/api/departamentos")
        ]);

        abrirModal({
            titulo:"Nueva asignación",
            subtitulo:"Seleccione empleado y departamento.",
            campos:[
                { id:"empleadoId", label:"Empleado", tipo:"select", required:true, opciones: empleados.map(e => ({ value:e.empleadoId, text:`${e.nombre} ${e.apellido} (#${e.empleadoId})` })) },
                { id:"departamentoId", label:"Departamento", tipo:"select", required:true, opciones: departamentos.map(d => ({ value:d.departamentoId, text:`${d.nombre} (#${d.departamentoId})` })) },
            ],
            valores:{},
            onGuardar: async () => {
                const payload = {
                    empleadoId: Number(document.getElementById("empleadoId").value),
                    departamentoId: Number(document.getElementById("departamentoId").value),
                };
                try{
                    await apiFetch("/api/asignaciones", { method:"POST", body: JSON.stringify(payload) });
                    cerrarModal();
                    await Swal.fire({ icon:"success", title:"Creado", text:"Asignación creada correctamente." });
                    estado.lista = await apiFetch("/api/asignaciones");
                    renderTabla();
                }catch(e){
                    await Swal.fire({ icon:"error", title:"Error", text: e.message });
                }
            }
        });
    }catch(e){
        await Swal.fire({ icon:"error", title:"Error", text: e.message });
    }
}

async function eliminarAsignacion(a){
    const r = await Swal.fire({
        icon:"warning",
        title:"Confirmar eliminación",
        text:`¿Eliminar la asignación #${a.asignacionId}?`,
        showCancelButton:true,
        confirmButtonText:"Sí, eliminar",
        cancelButtonText:"Cancelar"
    });
    if(!r.isConfirmed) return;

    try{
        await apiFetch(`/api/asignaciones/${a.asignacionId}`, { method:"DELETE" });
        await Swal.fire({ icon:"success", title:"Eliminado", text:"Asignación eliminada." });
        estado.lista = await apiFetch("/api/asignaciones");
        renderTabla();
    }catch(e){
        await Swal.fire({ icon:"error", title:"Error", text: e.message });
    }
}

/* =========================
   NAVEGACIÓN + SESIÓN
========================= */

function marcarNav(){
    document.querySelectorAll(".nav__item").forEach(b => {
        b.classList.toggle("activa", b.dataset.ruta === estado.ruta);
    });
}

function mostrarApp(){
    const s = leerSesion();
    if(!s?.token){
        vistaInicio.hidden = false;
        vistaApp.hidden = true;
        return;
    }
    vistaInicio.hidden = true;
    vistaApp.hidden = false;

    metaUsuario.textContent = `Usuario: ${s.username}`;
    pillRoles.textContent = `Roles: ${(s.roles || []).join(", ")}`;
}

document.querySelectorAll(".nav__item").forEach(b => {
    b.addEventListener("click", async () => {
        estado.ruta = b.dataset.ruta;
        estado.lista = [];
        estado.filtro = "";
        estado.pagina = 1;

        marcarNav();
        await cargarModuloActual(true);
    });
});

btnCerrar.addEventListener("click", async () => {
    limpiarSesion();
    await Swal.fire({ icon:"success", title:"Sesión cerrada", text:"Se cerró la sesión correctamente." });
    mostrarApp();
});

formInicio.addEventListener("submit", async (e) => {
    e.preventDefault();
    msgInicio.textContent = "Ingresando...";

    const username = inUsuario.value.trim();
    const contrasena = inContrasena.value;

    try{
        const data = await apiFetch("/api/autenticacion/iniciar-sesion", {
            method:"POST",
            body: JSON.stringify({ username, contrasena })
        });

        guardarSesion({ token: data.token, username: data.username, roles: data.roles });
        msgInicio.textContent = "";
        await Swal.fire({ icon:"success", title:"Bienvenido", text:`Sesión iniciada como ${data.username}.` });

        mostrarApp();
        estado.ruta = "departamentos";
        marcarNav();
        await cargarModuloActual(true);

    }catch(err){
        msgInicio.textContent = "";
        await Swal.fire({ icon:"error", title:"Error de inicio de sesión", text: String(err.message || err) });
    }
});

(function iniciar(){
    mostrarApp();
    if(!leerSesion()) return;

    estado.ruta = "departamentos";
    marcarNav();
    cargarModuloActual(true).catch(async (e) => {
        await Swal.fire({ icon:"error", title:"Error", text: e.message });
    });
})();
