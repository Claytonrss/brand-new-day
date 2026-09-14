/**
 * Beacon de falhas silenciosas (A11 na auditoria): recebe eventos agregados
 * e sem PII do frontend (hoje: webgl_unavailable) e os registra no log da
 * Vercel — o dono os vê no dashboard sem nenhum serviço externo. Edge
 * runtime: zero cold-start relevante e zero dependência.
 *
 * O ErrorBoundary do canvas dispara o sendBeacon (App.tsx) quando o WebGL
 * falha — até hoje ninguém ficava sabendo dessas falhas.
 */
export const config = { runtime: 'edge' };

interface BeaconEvent {
  event?: unknown;
  ua?: unknown;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405 });
  }
  const body = (await request.json().catch(() => null)) as BeaconEvent | null;
  if (body && typeof body.event === 'string') {
    console.log(
      '[beacon]',
      JSON.stringify({
        event: body.event,
        // UA bruto no log da Vercel (não armazenado em banco) — é o "em quais
        // devices o WebGL falhou" que a auditoria pede.
        ua: typeof body.ua === 'string' ? body.ua : 'unknown',
      }),
    );
  }
  return new Response(null, { status: 204 });
}
