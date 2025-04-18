import { RatesProvider } from '@/hooks/RatesContext'
import '@/styles/globals.css'
import '@/styles/style.scss'
import { appWithTranslation, useTranslation } from 'next-i18next'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function App({ Component, pageProps }: AppProps) {
  const { t } = useTranslation('common')

  return (
    <>
      <Head>
        <title>{t('App.Title')}</title>
        <meta name="description" content="The Blockchain Explorer" />
      </Head>
      <RatesProvider>
        <Component {...pageProps} />
      </RatesProvider>
    </>
  )
}

export default appWithTranslation(App)
