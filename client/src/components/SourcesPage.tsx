import React, { useEffect, useState } from 'react';
import { Plus, ExternalLink, Trash2, Power, Search, Database, X, Loader2 } from 'lucide-react';
import { CountryCode, OfficialSource, NewOfficialSource } from '../types';
import { subscribeToSources, createOfficialSource, deleteOfficialSource, setOfficialSourceActive, checkOfficialSource } from '../services/firestoreService';
import { CountryBadge } from './CountryBadge';

const COUNTRIES: Record<CountryCode,string> = {CO:'Colombia',MX:'México',BR:'Brasil',AR:'Argentina',CL:'Chile',PE:'Perú'};
const CATEGORIES = {sanitary:'Salud y regulación sanitaria',intellectual_property:'Propiedad intelectual',official_gazette:'Diario oficial'};
const initialForm: NewOfficialSource = {name:'',entityName:'',country:'CO',category:'sanitary',feedUrl:'',portalUrl:'',notes:'',isActive:true};
const HEALTH_LABELS = {ok:'Lectura verificada',partial:'Lectura parcial',empty:'Feed sin documentos',blocked:'Acceso bloqueado',unavailable:'No disponible',unsupported:'Requiere ajuste'};
const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500';

export function SourcesPage() {
  const [sources,setSources] = useState<OfficialSource[]>([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [query,setQuery] = useState('');
  const [country,setCountry] = useState<CountryCode | 'ALL'>('ALL');
  const [showForm,setShowForm] = useState(false);
  const [form,setForm] = useState<NewOfficialSource>({...initialForm});
  const [checking,setChecking] = useState<string | null>(null);
  const [busy,setBusy] = useState<string | null>(null);
  const [toDelete,setToDelete] = useState<OfficialSource | null>(null);

  useEffect(() => subscribeToSources(items => {setSources(items);setLoading(false);}, () => {
    setError('No se pudieron consultar las fuentes. Revisa tu conexión y los permisos de tu cuenta.');setLoading(false);
  }), []);

  async function mutate(id: string, action: () => Promise<void>, success: string) {
    setBusy(id);setError('');setNotice('');
    try {await action();setNotice(success);return true;}
    catch(error) {setError(error instanceof Error ? error.message : 'No se pudo guardar el cambio. Vuelve a intentar.');return false;}
    finally {setBusy(null);}
  }
  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    const ok = await mutate('create', () => createOfficialSource(form), 'Fuente agregada. Se incluirá en los próximos escaneos si está activa.');
    if (ok) {setShowForm(false);setForm({...initialForm});}
  }
  async function handleDelete() {
    if (!toDelete) return;
    const selected = toDelete;
    const ok = await mutate(selected.id, () => deleteOfficialSource(selected.id), `Fuente «${selected.name}» eliminada del catálogo.`);
    if (ok) setToDelete(null);
  }
  async function handleCheck(source: OfficialSource) {
    setChecking(source.id);setError('');setNotice('');
    try {
      const result = await checkOfficialSource(source.id);
      setNotice(`${source.name}: ${result.message}`);
    } catch (error) {setError(error instanceof Error ? error.message : 'No se pudo comprobar la fuente.');}
    finally {setChecking(null);}
  }
  const visible = sources.filter(source => (country === 'ALL' || source.country === country) &&
    `${source.name} ${source.entityName} ${source.feedUrl}`.toLowerCase().includes(query.trim().toLowerCase()));
  const active = sources.filter(source => source.isActive).length;

  return <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-sky-700 font-bold mb-1">Catálogo de monitoreo</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Fuentes de revisión</h1>
        <p className="text-sm text-slate-500 mt-2">{sources.length} fuentes registradas · {active} activas para escaneo</p>
      </div>
      <button onClick={() => {setShowForm(true);setError('');setNotice('');}} disabled={!!busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
        <Plus className="h-4 w-4" /> Agregar fuente
      </button>
    </div>
    <p className="mb-5 text-sm text-slate-600">Administra los portales y feeds que consulta el radar. Los cambios se aplican desde el próximo escaneo; los hallazgos existentes conservan su enlace de origen.</p>
    {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
    {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

    {showForm && <section className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm" aria-labelledby="add-source-title">
      <div className="flex items-center justify-between mb-5"><h2 id="add-source-title" className="text-lg font-bold">Nueva fuente</h2><button aria-label="Cerrar formulario" disabled={!!busy} onClick={() => setShowForm(false)}><X className="h-5 w-5 text-slate-500" /></button></div>
      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-xs font-semibold text-slate-700 space-y-1.5">Nombre de la fuente<input autoFocus required minLength={3} maxLength={160} value={form.name} onChange={event => setForm({...form,name:event.target.value})} className={inputClass} placeholder="Ej.: Ministerio de Salud — Resoluciones" /></label>
        <label className="text-xs font-semibold text-slate-700 space-y-1.5">Entidad responsable<input required minLength={2} maxLength={160} value={form.entityName} onChange={event => setForm({...form,entityName:event.target.value})} className={inputClass} placeholder="Nombre de la agencia o institución" /></label>
        <label className="text-xs font-semibold text-slate-700 space-y-1.5">País<select value={form.country} onChange={event => setForm({...form,country:event.target.value as CountryCode})} className={inputClass}>{Object.entries(COUNTRIES).map(([code,name]) => <option key={code} value={code}>{name}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-700 space-y-1.5">Tipo de fuente<select value={form.category} onChange={event => setForm({...form,category:event.target.value as OfficialSource['category']})} className={inputClass}>{Object.entries(CATEGORIES).map(([key,name]) => <option key={key} value={key}>{name}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-700 space-y-1.5 sm:col-span-2">URL de revisión o feed<input required type="url" maxLength={2048} value={form.feedUrl} onChange={event => setForm({...form,feedUrl:event.target.value})} className={inputClass} placeholder="https://..." /><span className="block font-normal text-slate-500">Usa el enlace HTTPS de un feed RSS/Atom o de una página con enlaces a documentos. Los portales que requieren iniciar sesión o resolver CAPTCHA necesitan un conector específico.</span></label>
        <label className="text-xs font-semibold text-slate-700 space-y-1.5 sm:col-span-2">Portal institucional (opcional)<input type="url" maxLength={2048} value={form.portalUrl} onChange={event => setForm({...form,portalUrl:event.target.value})} className={inputClass} placeholder="https://..." /></label>
        <label className="text-xs font-semibold text-slate-700 space-y-1.5 sm:col-span-2">Notas (opcional)<textarea rows={2} maxLength={1000} value={form.notes} onChange={event => setForm({...form,notes:event.target.value})} className={inputClass} placeholder="Qué documentos se revisan en esta fuente" /></label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.isActive} onChange={event => setForm({...form,isActive:event.target.checked})} className="accent-sky-600" /> Incluir en los escaneos</label>
        <div className="flex justify-end gap-2"><button type="button" disabled={!!busy} onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button><button disabled={!!busy} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy === 'create' && <Loader2 className="h-4 w-4 animate-spin" />}{busy === 'create' ? 'Guardando...' : 'Guardar fuente'}</button></div>
      </form>
    </section>}

    <p className="mb-4 text-xs text-slate-500">«Activa» indica que la fuente está incluida en el escaneo. Usa «Comprobar lectura» para verificar que entrega documentos; que un portal responda no garantiza oportunidades nuevas.</p>
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      <label className="relative flex-1"><span className="sr-only">Buscar fuente o entidad</span><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nombre, entidad o enlace" className={`${inputClass} pl-9`} /></label>
      <label><span className="sr-only">Filtrar por país</span><select value={country} onChange={event => setCountry(event.target.value as CountryCode | 'ALL')} className={inputClass}><option value="ALL">Todos los países</option>{Object.entries(COUNTRIES).map(([code,name]) => <option key={code} value={code}>{name}</option>)}</select></label>
    </div>
    {loading ? <p role="status" className="py-12 text-center text-slate-500">Consultando fuentes...</p> : visible.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><Database className="h-8 w-8 mx-auto mb-3 text-slate-400" /><h2 className="font-bold text-slate-800">{sources.length ? 'No hay fuentes que coincidan con tu búsqueda' : 'Aún no hay fuentes registradas'}</h2><p className="text-sm text-slate-500 mt-2">{sources.length ? 'Prueba con otro nombre o país.' : 'Agrega una fuente para comenzar el monitoreo.'}</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {visible.map(source => {
        const health = source.health?.checkedUrl === source.feedUrl ? source.health : undefined;
        return <article key={source.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2"><CountryBadge country={source.country} /><span className={`text-[11px] font-semibold rounded-full px-2 py-1 ${source.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>{source.isActive ? 'Activa' : 'Pausada'}</span></div>
        <div><h2 className="font-bold text-slate-900 leading-snug">{source.name}</h2><p className="mt-1 text-xs text-slate-500">{source.entityName}</p></div>
        <p className="text-xs font-medium text-sky-700">{CATEGORIES[source.category] || source.category}</p>
        <a href={source.feedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-700 hover:underline break-all flex items-start gap-1.5"><ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span>{source.feedUrl}</span></a>
        {source.notes && <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{source.notes}</p>}
        <div className={`rounded-xl border p-3 text-xs space-y-2 ${health?.status === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : health && health.status !== 'empty' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
          <p className="font-bold">{health ? HEALTH_LABELS[health.status] : 'Lectura pendiente de comprobación'}</p>
          {health && <><p>{health.message}</p><p className="text-[11px] opacity-80">Última comprobación: {new Date(health.checkedAt).toLocaleString()}</p>
            {!!health.preview?.length && <details><summary className="cursor-pointer font-semibold">Ver documentos extraídos ({health.documentsFound})</summary><ul className="mt-2 space-y-2">{health.preview.map(document => <li key={document.url}><a href={document.url} target="_blank" rel="noopener noreferrer" className="underline break-words">{document.title}</a>{document.publicationDate && <p className="text-[11px]">{document.publicationDate}</p>}</li>)}</ul></details>}
            {!!health.errors?.length && <details><summary className="cursor-pointer font-semibold">Detalle del portal</summary><ul className="mt-2 space-y-2 break-words">{health.errors.map((item,index) => <li key={index}>{item.message}</li>)}</ul></details>}
          </>}
          <button disabled={!!checking || !!busy} onClick={() => void handleCheck(source)} className="inline-flex items-center gap-1.5 font-bold text-sky-700 hover:underline disabled:opacity-50">{checking === source.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{checking === source.id ? 'Comprobando lectura...' : 'Comprobar lectura'}</button>
        </div>
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button disabled={!!busy} onClick={() => void mutate(source.id, () => setOfficialSourceActive(source.id,!source.isActive), source.isActive ? 'Fuente pausada. No se incluirá en los próximos escaneos.' : 'Fuente activada para los próximos escaneos.')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 disabled:opacity-50" aria-label={`${source.isActive ? 'Pausar' : 'Activar'} ${source.name}`}><Power className="w-3.5 h-3.5" />{busy === source.id ? 'Guardando...' : source.isActive ? 'Pausar' : 'Activar'}</button>
          <button disabled={!!busy} onClick={() => setToDelete(source)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50" aria-label={`Eliminar ${source.name}`}><Trash2 className="w-3.5 h-3.5" />Eliminar</button>
        </div>
      </article>;})}
    </div>}
    {toDelete && <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><div role="dialog" aria-modal="true" aria-labelledby="delete-source-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 id="delete-source-title" className="text-lg font-bold text-slate-900">Eliminar fuente</h2><p className="text-sm text-slate-600 mt-3">¿Eliminar «{toDelete.name}»? Dejará de aparecer en el catálogo y no se consultará en próximos escaneos. Los hallazgos ya registrados se conservarán.</p>
      <div className="flex justify-end gap-2 mt-6"><button disabled={!!busy} onClick={() => setToDelete(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</button><button autoFocus disabled={!!busy} onClick={() => void handleDelete()} className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Eliminando...' : 'Eliminar fuente'}</button></div>
    </div></div>}
  </main>;
}
