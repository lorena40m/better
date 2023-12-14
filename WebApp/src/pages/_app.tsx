import '@/styles/globals.css';
import "@/styles/style.scss";
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import {appWithTranslation} from "next-i18next";
import Head from "next/head";

const publicPages = [
  "/",
];

function App({ Component, pageProps }: AppProps) {

  const { pathname } = useRouter();
  // console.log(a, 'THIS IS IMPORT FROM I18')
  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(pathname);
  
  return (
    <>
      <Head>
        <title>BetterScan</title>
        <meta name="description" content="The Blockchain Explorer" />
      </Head>
      {
        isPublicPage ?
        <Component {...pageProps} />
        :
        <>
            <Component {...pageProps} />
        </>
      }
    </>
  )
}

export default appWithTranslation(App);
