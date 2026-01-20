/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_OAUTH_BACKEND_URL: string
  readonly VITE_DASH_PUBLIC_DOMAIN: string
  readonly VITE_N8N_ANALYTICS_EXECUTE_URL: string
  readonly VITE_PLAYGROUND_PASSWORD?: string
  readonly VITE_PLAYGROUND_ENABLED?: string
  readonly VITE_N8N_PON_LEAD_WEBHOOK_URL?: string
  readonly VITE_N8N_GOHIGHLEVEL_CAMPAIGNS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
