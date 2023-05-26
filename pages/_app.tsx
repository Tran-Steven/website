import "@styles/globals.css";
import { useState } from "react";
import type { AppProps } from "next/app";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";
export default function App({ Component, pageProps }: AppProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <Navbar />

      <Component {...pageProps} />

      <Footer />
    </>
  );
}
