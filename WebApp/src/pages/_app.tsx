import '@/styles/globals.css';
import "@/styles/style.scss";
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import {appWithTranslation} from "next-i18next";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { RatesProvider } from '@/context/RatesContext'

function App({ Component, pageProps }: AppProps) {
  const { t } = useTranslation("common");
  
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

export default appWithTranslation(App);
