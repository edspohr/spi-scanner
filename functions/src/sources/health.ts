import { OfficialSourceConfig, RawRegulatoryDocument } from './types';

export interface SourceHealth {
  status: 'ok' | 'partial' | 'empty' | 'blocked' | 'unavailable' | 'unsupported';
  code: string;
  message: string;
  checkedAt: string;
  checkedUrl: string;
  documentsFound: number;
  errors: Array<{url: string; message: string}>;
  preview: Array<{title: string; url: string; publicationDate: string}>;
}

export function describeSourceError(error: unknown): Pick<SourceHealth, 'status' | 'code' | 'message'> {
  const raw = error instanceof Error ? error.message : String(error);
  if (/HTTP (401|403|429)/i.test(raw)) return {status:'blocked',code:'access_blocked',message:'El portal bloqueó el acceso automático. Requiere un conector o un canal oficial alternativo.'};
  if (/HTTP (404|410)/i.test(raw)) return {status:'unavailable',code:'not_found',message:'El enlace ya no existe. Es necesario actualizar la URL de revisión.'};
  if (/certificate|cert_|certificado|altnames/i.test(raw)) return {status:'unavailable',code:'certificate_error',message:'No se pudo validar el certificado HTTPS del portal.'};
  if (/segundos|timeout|timed out/i.test(raw)) return {status:'unavailable',code:'timeout',message:'El portal no respondió dentro del tiempo de consulta.'};
  if (/15 MB/i.test(raw)) return {status:'unsupported',code:'size_limit',message:'El documento supera el límite de descarga de 15 MB. Requiere procesarlo por partes o usar un conector específico.'};
  if (/extraer documentos|texto suficiente|formato|PDF/i.test(raw)) return {status:'unsupported',code:'extraction_required',message:'El portal respondió, pero requiere ajustar la extracción de sus documentos.'};
  return {status:'unavailable',code:'connection_error',message:'No se pudo consultar el portal. Revisa el detalle técnico o vuelve a comprobar la fuente.'};
}

export function makeSourceHealth(source: OfficialSourceConfig, documents: RawRegulatoryDocument[], errors: Array<{url:string;message:string}> = [], error?: unknown): SourceHealth {
  const status = error ? describeSourceError(error) : errors.length ?
    documents.length ? {status:'partial' as const,code:'document_errors',message:`Se extrajeron ${documents.length} documentos y ${errors.length} no pudieron leerse.`} : describeSourceError(new Error(errors[0].message)) :
    {status: documents.length ? 'ok' as const : 'empty' as const,code:documents.length ? 'readable' : 'empty_feed',message: documents.length ? `Se pudieron extraer ${documents.length} documentos de muestra. Esto no implica que todos generen oportunidades nuevas.` : 'El feed respondió correctamente, pero no contiene documentos publicados.'};
  return {...status,checkedAt:new Date().toISOString(),checkedUrl:source.feedUrl,documentsFound:documents.length,errors:error?[{url:source.feedUrl,message:error instanceof Error?error.message:String(error)}]:errors,
    preview:documents.slice(0,3).map(document=>({title:document.title,url:document.sourceUrl,publicationDate:document.publicationDate}))};
}
