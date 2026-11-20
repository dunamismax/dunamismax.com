// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
  namespace App {
    interface PageMeta { title: string; description?: string; path: string; ogType?: 'website' | 'article' }
    interface PageData { meta?: PageMeta }
  }
}

export {};
