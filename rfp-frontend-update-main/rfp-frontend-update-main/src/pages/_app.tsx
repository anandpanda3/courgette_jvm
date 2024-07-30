import "~/styles/globals.css";
import ReactGA from "react-ga4";
import React, { useEffect } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { useRouter } from "next/router";
import Layout from "~/components/Layout";
import { type AppType } from "next/dist/shared/lib/utils";
import { Toaster } from "~/components/ui/toaster";
import HydrationZustand from "~/components/HydrationZustand";
import { AppProps } from "next/app";

import { GOOGLE_ANALYTICS_ID } from "~/constants";

ReactGA.initialize(GOOGLE_ANALYTICS_ID);

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  
  useEffect(() => {
    // Check if the user has visited the home page
    if (router.pathname !== '/' && !sessionStorage.getItem('visitedHome')) {
      router.push('/');
    }
  }, [router]);

  return (
    <ClerkProvider
      appearance={{
        elements: {
          footer: "hidden",
        },
      }}
    >
      <HydrationZustand>
        <Layout>
          <Component {...pageProps} />
          <Toaster />
        </Layout>
      </HydrationZustand>
    </ClerkProvider>
  );
};

export default MyApp;
