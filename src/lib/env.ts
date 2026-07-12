export function getN8nEnv() {
  const triggerUrl = process.env.N8N_WEBHOOK_URL;
  const evalUrl = process.env.N8N_EVAL_WEBHOOK_URL;

  return { triggerUrl, evalUrl };
}

export function getGeminiKey() {
  return process.env.GEMINI_API_KEY;
}
