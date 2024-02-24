// for future rate limiting
import { kv } from '@vercel/kv';

const defaultModel = 'gpt-4-turbo-preview'
const apiKey = process.env.OPENAI_API_KEY

// Proxy
export async function POST(req) {
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

  return resp
}