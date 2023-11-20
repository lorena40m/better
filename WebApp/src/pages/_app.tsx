import '@/styles/globals.css';
import "@/styles/style.scss";
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import {appWithTranslation} from "next-i18next";

const publicPages = [
  "/sign-in/[[...index]]",
  "/sign-up/[[...index]]",
  "/_error",
  "/",
];

function App({ Component, pageProps }: AppProps) {

  const { pathname } = useRouter();
  // console.log(a, 'THIS IS IMPORT FROM I18')
  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(pathname);
  
  return (
    <>
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
