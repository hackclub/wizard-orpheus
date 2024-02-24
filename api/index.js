// for future rate limiting
import { kv } from '@vercel/kv';

export async function POST(req) {
  console.log(req.body.model)

  return new Response(`Hello from ${req.body.model}`);
}