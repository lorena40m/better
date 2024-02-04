import React from "react";
import { Page } from "@/components/common/page";
import Head from "next/head";
import Image404 from "@/assets/images/betterscan-404.png";
import Image from "next/image";

type Props = {
}

const page404 = (props: Props) => {

  return (
    <Page title={null}>
      <Head>
        <title>Error 404</title>
      </Head>
      <div className="div404">
        <div>
          <h1>Error 404</h1>
          <p>Même avec le meilleur des explorateurs de blockchain, certaines pages restent introuvables.</p>
        </div>
        <Image src={Image404} alt="broken robot" />
      </div>
    </Page>
  );
};

export default page404;
