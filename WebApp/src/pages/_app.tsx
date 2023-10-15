import '@/styles/globals.css'
import "@/styles/style.scss";
import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router';

import {appWithTranslation} from "next-i18next";

const publicPages = ["/sign-in/[[...index]]", "/sign-up/[[...index]]", "/", "/wallet", "/operation", "/token"];

function App({ Component, pageProps }: AppProps) {

  const { pathname } = useRouter();
  // console.log(a, 'THIS IS IMPORT FROM I18')
  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(pathname);

  return (
    <ClerkProvider {...pageProps} >
      {
        isPublicPage ? 
        <Component {...pageProps} />
        :
        <>
          <SignedIn>
            <Component {...pageProps} />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      }
    </ClerkProvider>
  )
}

export default appWithTranslation(App);
