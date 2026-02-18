import Swal from 'sweetalert2';

export function escapeHtml(v: any){
  const s = String(v ?? '—');
  return s
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

export function filtrarPorTexto<T>(lista: T[], filtro: string): T[] {
  const f = (filtro || '').trim().toLowerCase();
  if (!f) return lista;
  return lista.filter(x => JSON.stringify(x).toLowerCase().includes(f));
}

export function paginar<T>(lista: T[], pagina: number, tamPagina: number) {
  const total = lista.length;
  const paginas = Math.max(1, Math.ceil(total / tamPagina));
  const p = Math.min(Math.max(1, pagina), paginas);
  const ini = (p - 1) * tamPagina;
  const fin = Math.min(ini + tamPagina, total);
  return {
    total, paginas, pagina: p,
    desde: total === 0 ? 0 : ini + 1,
    hasta: fin,
    paginaLista: lista.slice(ini, fin),
  };
}

export async function alertError(titulo: string, e: any) {
  await Swal.fire({ icon:'error', title: titulo, text: e?.message || 'Error.' });
}
