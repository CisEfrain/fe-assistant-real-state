export type Env = {
    API_BASE_URL?: string
    OAUTH_BACKEND_URL?: string
    DASH_PUBLIC_DOMAIN?: string
    NODE_ENV?: string,
    N8N_ANALYTICS_EXECUTE_URL?: string
    PLAYGROUND_PASSWORD?: string
    PLAYGROUND_ENABLED?: string
    N8N_PON_LEAD_WEBHOOK_URL?: string
    N8N_GOHIGHLEVEL_CAMPAIGNS_URL?: string
  }
  
  const rt = (typeof window !== 'undefined' ? (window as any).__ENV : {}) || {}
  
  export const env: Env = {
    API_BASE_URL:
      rt.API_BASE_URL ?? rt.API_URL ?? import.meta.env.VITE_API_BASE_URL,
    OAUTH_BACKEND_URL:
      rt.OAUTH_BACKEND_URL ?? import.meta.env.VITE_OAUTH_BACKEND_URL,
    DASH_PUBLIC_DOMAIN:
      rt.DASH_PUBLIC_DOMAIN ?? import.meta.env.VITE_DASH_PUBLIC_DOMAIN,
    NODE_ENV:
      rt.NODE_ENV ?? import.meta.env.VITE_NODE_ENV,
    N8N_ANALYTICS_EXECUTE_URL:
      rt.N8N_ANALYTICS_EXECUTE_URL ?? import.meta.env.VITE_N8N_ANALYTICS_EXECUTE_URL,
    PLAYGROUND_PASSWORD:
      rt.PLAYGROUND_PASSWORD ?? import.meta.env.VITE_PLAYGROUND_PASSWORD ?? 'playground2024',
    PLAYGROUND_ENABLED:
      rt.PLAYGROUND_ENABLED ?? import.meta.env.VITE_PLAYGROUND_ENABLED ?? 'true',
    N8N_PON_LEAD_WEBHOOK_URL:
      rt.N8N_PON_LEAD_WEBHOOK_URL ?? import.meta.env.VITE_N8N_PON_LEAD_WEBHOOK_URL ?? 'https://n8n-dev.iadmexico.mx/webhook/dev/lead/pon',
    N8N_GOHIGHLEVEL_CAMPAIGNS_URL:
      rt.N8N_GOHIGHLEVEL_CAMPAIGNS_URL ?? import.meta.env.VITE_N8N_GOHIGHLEVEL_CAMPAIGNS_URL ?? 'https://n8n-dev.iadmexico.mx/webhook/dev/gohighlevel/campaigns',
  }