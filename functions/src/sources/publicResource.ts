import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { request } from 'node:https';

const blocked = new BlockList();
for (const [network, prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.168.0.0',16],['192.0.0.0',24],['198.18.0.0',15],['224.0.0.0',4],['240.0.0.0',4]] as const) blocked.addSubnet(network, prefix, 'ipv4');
for (const [network, prefix] of [['::',128],['::1',128],['fc00::',7],['fe80::',10],['ff00::',8]] as const) blocked.addSubnet(network,prefix,'ipv6');

export function publicSourceUrl(value: string): URL {
  let url: URL;
  try { url = new URL(value); } catch { throw new Error('Ingresa un enlace HTTPS válido.'); }
  const host = url.hostname.replace(/^\[|\]$/g,'').toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || isIP(host) || !host.includes('.') || /(?:^|\.)(localhost|local|internal|test|invalid)$/.test(host)) {
    throw new Error('La fuente debe usar un dominio público y HTTPS, sin credenciales ni puertos especiales.');
  }
  url.hash = '';
  return url;
}

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  return !!family && !blocked.check(address, family === 4 ? 'ipv4' : 'ipv6');
}

/** Pin the connection to a validated public DNS address, including on redirects. */
export async function fetchPublicResource(value: string, redirects = 0, attempt = 0): Promise<{body: Buffer; contentType: string; url: string}> {
  const url = publicSourceUrl(value);
  const addresses = await lookup(url.hostname, {all:true});
  if (!addresses.length || addresses.some(record => !isPublicAddress(record.address))) throw new Error('El dominio de la fuente no resuelve a una dirección pública permitida.');
  // Cloud Run egress may not support IPv6 even when the portal publishes AAAA records.
  const ipv4 = addresses.filter(record=>record.family === 4);
  const candidates = ipv4.length ? ipv4 : addresses;
  const address = candidates[attempt % candidates.length];
  return new Promise<{body:Buffer;contentType:string;url:string}>((resolve,reject) => {
    const req = request(url, {
      method:'GET', family:address.family,
      lookup: (_hostname, _options, callback) => callback(null,address.address,address.family),
      headers:{'User-Agent':'SPI-Regulatory-Scanner/1.0 (+https://spi-scanner.web.app)',Accept:'text/html, application/rss+xml, application/atom+xml, application/xml, application/pdf','Accept-Encoding':'identity'}
    }, response => {
      const status = response.statusCode || 0;
      if ([301,302,303,307,308].includes(status)) {
        response.resume();
        if (redirects >= 5 || !response.headers.location) { reject(new Error('Demasiadas redirecciones en la fuente.')); return; }
        try { resolve(fetchPublicResource(new URL(response.headers.location,url).href, redirects+1)); } catch(error) { reject(error); }
        return;
      }
      if (status < 200 || status >= 300) {response.resume();reject(new Error(`La fuente respondió HTTP ${status}.`));return;}
      const chunks: Buffer[]=[];
      let size=0;
      response.on('data', (chunk:Buffer) => {
        size+=chunk.length;
        if (size > 15000000) {req.destroy(new Error('El documento supera el límite de 15 MB.'));return;}
        chunks.push(chunk);
      });
      response.on('error',reject);
      response.on('end',()=>resolve({body:Buffer.concat(chunks),contentType:String(response.headers['content-type']||''),url:url.href}));
    });
    req.setTimeout(18000,()=>req.destroy(new Error('La fuente no respondió dentro de 18 segundos.')));
    req.on('error',reject);
    req.end();
  }).catch(error=>{
    if (attempt < 1 && /ECONNRESET|EAI_AGAIN|ECONNREFUSED|ENETUNREACH|EHOSTUNREACH/.test(String(error.code || ''))) return fetchPublicResource(value,redirects,attempt+1);
    throw error;
  });
}
