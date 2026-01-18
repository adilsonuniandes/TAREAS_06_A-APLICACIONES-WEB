const API = "http://localhost:8000/semana_2/backend/controllers/pais.controller.php?op=";

const tbody = document.querySelector("#tblPaises tbody");
const loadingEl = document.getElementById("loading");
const emptyEl = document.getElementById("empty");

const btnNuevo = document.getElementById("btnNuevo");
const txtBuscar = document.getElementById("txtBuscar");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const lblPage = document.getElementById("lblPage");

const modalForm = document.getElementById("modalForm");
const modalFormTitle = document.getElementById("modalFormTitle");
const frm = document.getElementById("frmPais");
const codigoInput = document.getElementById("Codigo");
const paisInput = document.getElementById("Pais");
const formError = document.getElementById("formError");

const modalConfirm = document.getElementById("modalConfirm");
const confirmText = document.getElementById("confirmText");
const confirmMeta = document.getElementById("confirmMeta");
const btnConfirmDelete = document.getElementById("btnConfirmDelete");

const toast = document.getElementById("toast");

const PAGE_SIZE = 10;

let allRows = [];
let filteredRows = [];
let page = 1;
let totalPages = 1;

let editMode = false;
let deleteCodigo = null;

/* ========= LOADING ROBUSTO (CONTADOR) ========= */
let loadingCount = 0;

function setLoadingOn() {
    loadingCount++;
    if (loadingEl) loadingEl.hidden = false;
}

function setLoadingOff() {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingEl && loadingCount === 0) loadingEl.hidden = true;
}

// Si ocurre un error JS no manejado, igual apagamos el loading
window.addEventListener("error", () => {
    loadingCount = 0;
    if (loadingEl) loadingEl.hidden = true;
});
window.addEventListener("unhandledrejection", () => {
    loadingCount = 0;
    if (loadingEl) loadingEl.hidden = true;
});

/* ============================================ */

function setEmpty(v) { if (emptyEl) emptyEl.hidden = !v; }

function showToast(message, type = "ok") {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("toast--ok", "toast--err");
    toast.classList.add(type === "ok" ? "toast--ok" : "toast--err");
    toast.hidden = false;
    setTimeout(() => (toast.hidden = true), 2200);
}

function openModal(modal) {
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeModal(modal) {
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close='true']");
    if (!close) return;
    const m = e.target.closest(".modal");
    if (m) closeModal(m);
});

document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modalForm.getAttribute("aria-hidden") === "false") closeModal(modalForm);
    if (modalConfirm.getAttribute("aria-hidden") === "false") closeModal(modalConfirm);
});

function normalizeCodigo(v) {
    return (v || "").toString().trim().toUpperCase();
}
function normalizePais(v) {
    return (v || "").toString().trim();
}

function validateForm(codigo, pais) {
    if (!codigo || codigo.length !== 2) return "El código debe tener exactamente 2 letras.";
    if (!/^[A-Z]{2}$/.test(codigo)) return "El código solo debe contener letras (A-Z).";
    if (!pais) return "El país es obligatorio.";
    if (pais.length < 2) return "El país debe tener al menos 2 caracteres.";
    return null;
}

function setFormError(msg) {
    if (!formError) return;
    if (!msg) {
        formError.hidden = true;
        formError.textContent = "";
        return;
    }
    formError.hidden = false;
    formError.textContent = msg;
}

/* FETCH JSON seguro */
async function fetchJson(url, options) {
    const r = await fetch(url, options);
    const text = await r.text();
    try {
        return JSON.parse(text);
    } catch {
        console.error("Respuesta no JSON:", text);
        throw new Error("Respuesta inválida del servidor (no es JSON).");
    }
}

function applyFilter() {
    const q = (txtBuscar.value || "").toString().trim().toLowerCase();
    if (!q) filteredRows = [...allRows];
    else {
        filteredRows = allRows.filter(r =>
            (r.Codigo || "").toLowerCase().includes(q) ||
            (r.Pais || "").toLowerCase().includes(q)
        );
    }
    page = 1;
    renderTable();
}

function renderTable() {
    tbody.innerHTML = "";

    totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    page = Math.min(Math.max(1, page), totalPages);

    const start = (page - 1) * PAGE_SIZE;
    const rows = filteredRows.slice(start, start + PAGE_SIZE);

    rows.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td><span class="pill">${p.Codigo}</span></td>
      <td>${p.Pais}</td>
      <td>
        <div class="actions">
          <button class="btn btn--ghost" data-edit="${p.Codigo}" type="button">Editar</button>
          <button class="btn btn--danger" data-del="${p.Codigo}" data-name="${encodeURIComponent(p.Pais)}" type="button">Eliminar</button>
        </div>
      </td>
    `;
        tbody.appendChild(tr);
    });

    lblPage.textContent = `Página ${page} de ${totalPages}`;
    btnPrev.disabled = page <= 1;
    btnNext.disabled = page >= totalPages;

    setEmpty(filteredRows.length === 0);
}

async function cargar() {
    setLoadingOn();
    try {
        const data = await fetchJson(API + "todos");
        allRows = (data || []).map(x => ({ Codigo: x.Codigo, Pais: x.Pais }));
        applyFilter();
    } catch {
        showToast("No se pudo cargar datos", "err");
    } finally {
        setLoadingOff();
    }
}

/* Pager */
btnPrev.addEventListener("click", () => { page--; renderTable(); });
btnNext.addEventListener("click", () => { page++; renderTable(); });

/* Buscar */
txtBuscar.addEventListener("input", applyFilter);

/* Nuevo */
btnNuevo.addEventListener("click", () => {
    editMode = false;
    setFormError(null);
    frm.reset();

    modalFormTitle.textContent = "Nuevo país";
    codigoInput.disabled = false;
    openModal(modalForm);
    setTimeout(() => codigoInput.focus(), 50);
});

/* Guardar */
frm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = normalizeCodigo(codigoInput.value);
    const pais = normalizePais(paisInput.value);

    const err = validateForm(codigo, pais);
    if (err) { setFormError(err); return; }
    setFormError(null);

    const fd = new FormData();
    fd.set("Codigo", codigo);
    fd.set("Pais", pais);

    const op = editMode ? "actualizar" : "insertar";

    setLoadingOn();
    try {
        const res = await fetchJson(API + op, { method: "POST", body: fd });
        if (res !== "ok") throw new Error();

        closeModal(modalForm);
        showToast(editMode ? "Actualizado" : "Creado", "ok");
        await cargar();
    } catch {
        showToast("Error al guardar", "err");
    } finally {
        setLoadingOff();
    }
});

/* Tabla: editar / eliminar */
tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const codigoEdit = btn.getAttribute("data-edit");
    const codigoDel = btn.getAttribute("data-del");

    if (codigoEdit) {
        setLoadingOn();
        try {
            const fd = new FormData();
            fd.set("Codigo", codigoEdit);

            const p = await fetchJson(API + "uno", { method: "POST", body: fd });
            if (!p || !p.Codigo) throw new Error();

            editMode = true;
            setFormError(null);
            modalFormTitle.textContent = "Actualizar país";

            codigoInput.value = p.Codigo;
            paisInput.value = p.Pais;

            codigoInput.disabled = true;
            openModal(modalForm);
            setTimeout(() => paisInput.focus(), 50);
        } catch {
            showToast("Error al cargar", "err");
        } finally {
            setLoadingOff();
        }
        return;
    }

    if (codigoDel) {
        deleteCodigo = codigoDel;
        const name = decodeURIComponent(btn.getAttribute("data-name") || "");
        confirmText.textContent = "¿Desea eliminar este país?";
        confirmMeta.textContent = `${codigoDel} — ${name}`;
        openModal(modalConfirm);
    }
});

/* Confirmar eliminar */
btnConfirmDelete.addEventListener("click", async () => {
    if (!deleteCodigo) return;

    const fd = new FormData();
    fd.set("Codigo", deleteCodigo);

    setLoadingOn();
    try {
        const res = await fetchJson(API + "eliminar", { method: "POST", body: fd });
        if (res !== "ok") throw new Error();

        closeModal(modalConfirm);
        showToast("Eliminado", "ok");
        deleteCodigo = null;
        await cargar();
    } catch {
        showToast("Error al eliminar", "err");
    } finally {
        setLoadingOff();
    }
});

document.addEventListener("DOMContentLoaded", cargar);
