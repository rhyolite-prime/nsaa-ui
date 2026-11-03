// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  nitro: {
    inlineDynamicImports: true,
    externals: {
      inline: ['unhead', '@unhead/vue', '@unhead/ssr']
    }
  },
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        lang: "en"
      },
      script: [
         
        {
        async: true,
        innerHTML: `(function(c,l,a,r,i,t,y){         c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};         t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);     })(window, document, "clarity", "script", "vungbhe57h");`,
        type: 'text/javascript',
        },
         
      ]
       
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  imports: {
    dirs: ["services"],
  },

  runtimeConfig: {
    public: {
      microsoftClientId: process.env.NUXT_MICROSOFT_CLIENT_ID || '',
      googleClientId: process.env.NUXT_GOOGLE_CLIENT_ID || '',
      proxyApiBaseURL: "https://nsaa-api.rhyoliteprime.com/api/v1/",
      //proxyApiBaseURL: "http://localhost:5044/api/v1/",
    },
  },
})
