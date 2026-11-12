import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import Image from "next/image";
import atlantaNight from "../public/atlantanight.jpg";
import dtla from "../public/dtla.jpg";
import Head from "next/head";
import Script from "next/script";
import styles from "../styles/Home.module.css";
import Blurb from "../components/Blurb";
// import OrbitalScene from "@components/OrbitalScene";
export default function Home() {
  // const [showScene, setShowScene] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMobile = () => setIsMobile(mediaQuery.matches);
    updateMobile();
    mediaQuery.addEventListener("change", updateMobile);
    return () => mediaQuery.removeEventListener("change", updateMobile);
  }, []);

  const scrollSectionRef = useRef(null);
  const reposScrollRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: scrollSectionRef,
    offset: ["start 75%", "end 15%"],
  });

  const { scrollYProgress: reposScrollProgress } = useScroll({
    target: reposScrollRef,
    offset: ["start 90%", "end 20%"],
  });

  const reposOpacity = useTransform(
    reposScrollProgress,
    [0, 0.22, 0.8],
    shouldReduceMotion ? [1, 1, 1] : [0.35, 1, 1]
  );
  const reposY = useTransform(
    reposScrollProgress,
    [0, 0.35],
    shouldReduceMotion ? [0, 0] : [48, 0]
  );
  const reposScale = useTransform(
    reposScrollProgress,
    [0, 0.35],
    shouldReduceMotion ? [1, 1] : [0.88, 1]
  );
  const reposImageScale = useTransform(
    reposScrollProgress,
    [0.08, 0.42],
    shouldReduceMotion ? [1, 1] : [1.12, 1]
  );
  const reposImageX = useTransform(
    reposScrollProgress,
    [0.08, 0.42],
    shouldReduceMotion ? [0, 0] : [-48, 0]
  );
  const reposTextX = useTransform(
    reposScrollProgress,
    [0.16, 0.5],
    shouldReduceMotion ? [0, 0] : [120, 0]
  );
  const reposTextOpacity = useTransform(
    reposScrollProgress,
    [0.16, 0.48],
    shouldReduceMotion ? [1, 1] : [0, 1]
  );
  const reposMobileY = useTransform(
    reposScrollProgress,
    [0.18, 0.5],
    shouldReduceMotion ? [0, 0] : [24, 0]
  );
  const textOpacity = useTransform(
    scrollYProgress,
    [isMobile ? 0.3 : 0.08, isMobile ? 0.5 : 0.2],
    [1, 0]
  );
  const containerWidth = useTransform(scrollYProgress, [0.2, 0.42], [isMobile ? "84vw" : "52vw", "100vw"]);
  const containerHeight = useTransform(scrollYProgress, [0.2, 0.42], [isMobile ? "50vh" : "min(44vh, 30rem)", "100vh"]);
  const borderRadius = useTransform(scrollYProgress, [0.2, 0.42], ["24px", "0px"]);
  const overlayTextOpacity = useTransform(
    scrollYProgress,
    [0.3, 0.48],
    [0, 1]
  );
  const overlayTextY = useTransform(scrollYProgress, [0.3, 0.48], [30, 0]);
  return (
    <>
      <Script src="/companion/companion.js" strategy="afterInteractive" />
      <Script src="/repos/browser.js" strategy="afterInteractive" />
      <Script src="/project-reveal.js" strategy="afterInteractive" />
      <div className={styles.scrolltracker}></div>
      <div className={styles.container}>
        <div className={styles.scrolltracker}></div>
        <Head>
          <title>Steven Tran</title>
          <meta
            name="Steven Tran"
            content="A website that is acts as both a portfolio and a get to know me."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header></header>
        <main className={styles.main} id="aboutme">
          <div className={styles.heroCopyStage}>
            <svg
              aria-hidden="true"
              className={styles.heroGrid}
              viewBox="0 0 700 700"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="hero-grid-pattern"
                  width="70"
                  height="70"
                  patternUnits="userSpaceOnUse"
                  x="-1"
                  y="-1"
                >
                  <path
                    d="M.5 70V.5H70"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="4 2"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-grid-pattern)" />
            </svg>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>
                <button
                  className={styles.secretbutton}
                  type="button"
                  title="Bring back the companion"
                  onClick={() => document.dispatchEvent(new Event("companion:respawn"))}
                >
                  Hi, I&apos;m{" "}
                  <span className={styles.companionName}>
                    Steven<span className={styles.companionPerch} data-companion-perch aria-hidden="true" />.
                  </span>
                </button>
              </h1>
            </div>

            <div className={styles.nameblurb}>
              <p className={styles.titlep} data-companion-landing>LA based Software Engineer</p>
            </div>
            <Blurb />
          </div>
          {/* {showScene ? (
            <motion.div
              className={styles.heroScene}
              initial={{ opacity: 0, height: 0, y: -24 }}
              animate={{ opacity: 1, height: "clamp(300px, 46vw, 540px)", y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <OrbitalScene />
              <span className={styles.sceneLabel}>Yoona (My cat!)</span>
            </motion.div>
          ) : null} */}
          <div className={styles.aboutme}>
            <div className={styles.atlScrollFrame} data-georgia-reveal>
              <div className={styles.atlScrollStage}>
                <div className={styles.hide}>
                  <Image
                    src={atlantaNight}
                    alt="Atlanta skyline at dusk"
                    className={styles.atl}
                    sizes="(max-width: 640px) 90vw, (max-width: 1140px) 96vw, 1100px"
                  />
                </div>
                <h2 data-georgia-title>From<br />Georgia.</h2>
              </div>
            </div>
            <div className={styles.appleScrollSection} ref={scrollSectionRef}>
              <motion.h2
                className={styles.aboutmetitle}
                style={{
                  opacity: textOpacity,
                }}
              >
                Based in Los Angeles.
              </motion.h2>

              <motion.div
                className={styles.expandingContainer}
                style={{
                  width: containerWidth,
                  height: containerHeight,
                  borderRadius: borderRadius,
                }}
              >
                <Image
                  src={dtla}
                  alt="Image of DTLA Cityscape"
                  className={styles.expandingImage}
                />

                <motion.h2
                  className={styles.overlayText}
                  style={{
                    opacity: overlayTextOpacity,
                    y: overlayTextY,
                  }}
                >
                  Based in Los Angeles.
                </motion.h2>
              </motion.div>
            </div>
          </div>
          <div className={styles.reposSection} ref={reposScrollRef}>
            <motion.div
              className={styles.repos}
              style={{
                opacity: reposOpacity,
                scale: reposScale,
                y: reposY,
              }}
            >
              <motion.div
                className={styles.reposimg}
                data-repo-browser
                style={{ scale: reposImageScale, x: reposImageX }}
              >
                <a href="https://github.com/Tran-Steven?tab=repositories">
                  Browse my GitHub repositories
                </a>
              </motion.div>

              <motion.h2
                className={styles.reposmobile}
                style={{ opacity: reposTextOpacity, y: reposMobileY }}
              >
                Always working on projects and learning new things.
              </motion.h2>

              <motion.h2
                className={styles.reposdesktop}
                style={{ opacity: reposTextOpacity, x: reposTextX }}
              >
                Always working on projects and learning new things.
              </motion.h2>
            </motion.div>
          </div>
          <div className={styles.projects} data-project-gallery>
            <div className={styles.sectionHeading}>
              <h2 className={styles.projectstext} id="projects">
                Things I&apos;ve Built.
              </h2>
            </div>
            <div className={styles.projectGrid} data-project-grid>
              <a
                href="https://github.com/Tran-Steven/COVID19-KG-Integration"
                className={`${styles.card} ${styles.cardFeatured}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>COVID19-KG-Integration</h2>
                <p>Verifies factual claims in ChatGPT COVID-19 responses using source-backed knowledge-graph evidence.</p>
              </a>
              <a
                href="https://github.com/Tran-Steven/leaguewordle"
                className={`${styles.card} ${styles.cardWordle}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>League of Wordle</h2>
                <p>
                  A League of Legends Wordle-like built with React and Node.
                </p>
              </a>
              <a
                href="https://github.com/Tran-Steven/website"
                className={`${styles.card} ${styles.cardPlaylist}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>This Website</h2>
                <p>The source code I wrote for this website.</p>
              </a>
              <a
                href="https://github.com/lenhatdangkhoa/ugahacks9"
                className={`${styles.card} ${styles.cardWatermarker}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>Watermarker</h2>
                <p>
                  <strong>🏆 Winners of Adobe Express for Hackathons!</strong>
                  <br />
                  Adobe Express add-on that generates and applies a watermark
                  using your name and logo directly onto your current Adobe
                  Express page.
                </p>
              </a>

              <a
                href="https://github.com/Tran-Steven/neovim-config"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.card} ${styles.cardNeovim}`}
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>Neovim Config</h2>
                <p>
                  My personal Neovim configuration that I use, which includes
                  plugins and settings.
                </p>
              </a>
              <a
                href="https://github.com/Tran-Steven?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.card} ${styles.cardArchive}`}
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>Other GitHub Repositories</h2>
                <p>
                  List of all of my GitHub repositories that include other code
                  not highlighted here.
                </p>
              </a>
            </div>
          </div>
        </main>

        <section>
          <div className={styles.holder} id="contact">
            <div className={styles.contact}>
              <div className={styles.contactcontainer}>
                <p className={styles.contactdescription}>
                  Want To Get In Touch?
                </p>
                <form
                  autoComplete="off"
                  className={styles.formstyle}
                  name="Contact"
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                >
                  <p className={styles.hidden}>
                    <label>
                      Don&apos;t fill this out if you&apos;re human:{" "}
                      <input name="bot-field" />
                    </label>
                  </p>
                  <input type="hidden" name="form-name" value="Contact" />
                  <input type="text" name="name" placeholder="Name" />
                  <input type="email" name="email" placeholder="Email" />
                  <br />
                  <textarea
                    className={styles.formtextbox}
                    name="message"
                    placeholder="Type your message here"
                    rows={5}
                  />
                  <p>
                    <button className={styles.contactbutton} type="submit">
                      Send
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
