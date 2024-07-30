// for future rate limiting
import { kv } from '@vercel/kv';

const defaultModel = 'gpt-4o-mini'
const apiKey = process.env.OPENAI_API_KEY

function enableCors(resp) {
  resp.headers.set('Access-Control-Allow-Origin', '*')
  resp.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  resp.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Wizard-Orpheus-URL')

  return resp
}

function upset(obj, key, value) {
  if (!obj[key]) {
    obj[key] = value
  }

  return obj
}

export function OPTIONS(req) {
  return enableCors(new Response(null, { status: 200 }))
}

// Proxy
export async function POST(req) {
  const origin = req.headers.get('origin')
  const gameUrl = req.headers.get('wizard-orpheus-url')

  if (!gameUrl.startsWith(origin)) { // We are being scammed! And someone is trying to spoof their URL.
    return new Response('Invalid origin', { status: 403 })
  }

  const path = new URL(req.url).pathname.substring(4) // the .substring removes the leading /api/ from the path, which vercel adds
  let body = await req.json()

  body.model = defaultModel

  const resp = await fetch(`https://api.openai.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey} `,
    },
    body: JSON.stringify(body)
  })

  let respBody = await resp.json();
  let usage = respBody.usage

  // Store in the DB. Each game has its rate limits info at `game:URL_OF_GAME`.
  //
  // We have a list of all games stored in `games` ranked by how many requests
  // have been made to the game.
  try {
    let g = await kv.hgetall(`game:${gameUrl}`)
    if (!g) g = {}
    g = upset(g, 'reqCount', 0)
    g = upset(g, 'promptTokenCount', 0)
    g = upset(g, 'completionTokenCount', 0)

    g['lastReq'] = new Date().toISOString()

    g.reqCount = parseInt(g.reqCount) + 1
    g.promptTokenCount = parseInt(g.promptTokenCount) + usage.prompt_tokens
    g.completionTokenCount = parseInt(g.completionTokenCount) + usage.completion_tokens

    await kv.hset(`game:${gameUrl}`, g)
    await kv.zadd('games', { score: parseInt(g.reqCount), member: gameUrl })
  } catch (e) {
    console.error('Redis error:', e)
  }

  return enableCors(new Response(JSON.stringify(respBody), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: resp.status
  }))
}

// Gallery
export async function GET(req) {

}
