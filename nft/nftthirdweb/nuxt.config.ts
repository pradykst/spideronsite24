// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  runtimeConfig: {
    mySecret: process.env.MY_SECRET,
    public:{
      thirdwebClientId: '',
      contractAddress: '',
      paymentContractAddress: '',
      buyContractAddress: '',
    }
  },
  components:[
    {
      path: './thirdweb',
      prefix: 'Contract'
    }
  ]
})
