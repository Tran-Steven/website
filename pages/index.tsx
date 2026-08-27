import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

import Image from "next/image";
import atlmorning from "../public/atlantamorning.jpg";
import atlnight from "../public/dtla.jpg";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Repos from "../public/repos.png";
import triangle from "../public/dropdown-icon.svg";
import Blurb from "../components/Blurb";
import OrbitalScene from "@components/OrbitalScene";
export default function Home() {
  const [show, setShow] = useState(false);
  const [showScene, setShowScene] = useState(false);
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
  const atlScrollRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const projectHeadingVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 36,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };
  const projectGridVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: shouldReduceMotion ? 0 : 0.12,
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };
  const projectCardVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const { scrollYProgress: atlScrollProgress } = useScroll({
    target: atlScrollRef,
    offset: ["start 80%", "end 20%"],
  });

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
  const atlWidth = useTransform(atlScrollProgress, [0, 0.28], ["92vw", "100vw"]);
  const atlHeight = useTransform(atlScrollProgress, [0, 0.28], [isMobile ? "44vw" : "44vh", isMobile ? "53vw" : "75vh"]);
  const atlRadius = useTransform(atlScrollProgress, [0, 0.28], ["20px", "0px"]);
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
              <button
                className={styles.secretbutton}
                type="button"
                aria-label={showScene ? "Hide Yoona's scene" : "Show Yoona's scene"}
                aria-expanded={showScene}
                onClick={() => {
                  setShowScene(!showScene);
                }}
              >
                <h1 className={styles.title}>Hi, I&apos;m Steven.</h1>
              </button>
            </div>

            <div className={styles.nameblurb}>
              <p className={styles.titlep}>LA based Software Engineer</p>
              <button
                className={styles.dropdownholder}
                type="button"
                aria-label={show ? "Hide about Steven" : "Read more about Steven"}
                aria-expanded={show}
                onClick={() => setShow(!show)}
              >
                <Image
                  src={triangle}
                  alt="drop down menu"
                  className={styles.drop}
                />
              </button>
            </div>
          </div>
          <Blurb isVisible={show} />
          {showScene ? (
            <motion.div
              className={styles.heroScene}
              initial={{ opacity: 0, height: 0, y: -24 }}
              animate={{ opacity: 1, height: "clamp(300px, 46vw, 540px)", y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <OrbitalScene />
              <span className={styles.sceneLabel}>Yoona (My cat!)</span>
            </motion.div>
          ) : null}
          <div className={styles.aboutme}>
            <div className={styles.atlScrollFrame} ref={atlScrollRef}>
              <motion.div
                className={styles.atlScrollStage}
                style={{
                  width: atlWidth,
                  height: atlHeight,
                  borderRadius: atlRadius,
                }}
              >
                <div className={styles.hide}>
                <Image
                  src={atlmorning}
                  alt="Atlanta Cityscape Morning with text on the image saying From Georgia."
                  className={styles.atl}
                />
                </div>
              </motion.div>
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
                  src={atlnight}
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
              <motion.a
                href="https://github.com/Tran-Steven?tab=repositories/"
                rel="noopener noreferrer"
                target="_blank"
                className={styles.reposimg}
                style={{ scale: reposImageScale, x: reposImageX }}
              >
                <Image
                  src={Repos}
                  alt="List of my repos"
                  className={styles.reposimg}
                />
              </motion.a>

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
          <motion.div
            className={styles.projects}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.16 }}
          >
            <motion.div className={styles.sectionHeading} variants={projectHeadingVariants}>
              <h2 className={styles.projectstext} id="projects">
                Things I&apos;ve Built.
              </h2>
            </motion.div>
            <motion.div className={styles.projectGrid} variants={projectGridVariants}>
              <motion.a
                href="https://github.com/Tran-Steven/COVID19-KG-Integration"
                className={`${styles.card} ${styles.cardFeatured}`}
                rel="noopener noreferrer"
                target="_blank"
                variants={projectCardVariants}
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <span className={styles.sectionLabel}>Neuro-symbolic Computing Research</span>
                <h2 aria-label="COVID-19-KG-Integration">
                  <span className={styles.cardTitleLine}>COVID-19-KG</span>
                  <span className={styles.cardTitleLine}>Integration</span>
                </h2>
                <p className={styles.researchMeta}>
                  <span className={styles.metaLabel}>Advisor:</span>{" "}
                  <span>Ismailcem Budak Arpinar</span>
                  <br />
                  <span className={styles.metaLabel}>Research Area:</span>{" "}
                  <span>LLM Information Verification via Knowledge Graphs</span>
                </p>
                <p>Knowledge-graph–grounded verification system for evaluating factual claims in LLM-generated COVID-19 responses using NLP, graph retrieval, and source-backed evidence.</p>
              </motion.a>
              <motion.a
                href="https://github.com/Tran-Steven/leaguewordle"
                className={`${styles.card} ${styles.cardWordle}`}
                rel="noopener noreferrer"
                target="_blank"
                variants={projectCardVariants}
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>League of Wordle</h2>
                <p>
                  A League of Legends Wordle-like built with React and Node.
                </p>
              </motion.a>
              <motion.a
                href="https://github.com/Tran-Steven/website"
                className={`${styles.card} ${styles.cardPlaylist}`}
                rel="noopener noreferrer"
                target="_blank"
                variants={projectCardVariants}
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>This Website</h2>
                <p>The source code I wrote for this website.</p>
              </motion.a>
              <motion.a
                href="https://github.com/lenhatdangkhoa/ugahacks9"
                className={`${styles.card} ${styles.cardWatermarker}`}
                rel="noopener noreferrer"
                target="_blank"
                variants={projectCardVariants}
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
              </motion.a>

              <motion.a
                href="https://github.com/Tran-Steven/neovim-config"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.card} ${styles.cardNeovim}`}
                variants={projectCardVariants}
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>Neovim Config</h2>
                <p>
                  My personal Neovim configuration that I use, which includes
                  plugins and settings.
                </p>
              </motion.a>
              <motion.a
                href="https://github.com/Tran-Steven?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.card} ${styles.cardArchive}`}
                variants={projectCardVariants}
              >
                <span className={styles.cardMark} aria-hidden="true">st</span>
                <h2>Other GitHub Repositories</h2>
                <p>
                  List of all of my GitHub repositories that include other code
                  not highlighted here.
                </p>
              </motion.a>
            </motion.div>
          </motion.div>
        </main>

        <section>
          <div className={styles.holder} id="contact">
            <div className={styles.contact}>
              <div className={styles.contactcontainer}>
                <p className={styles.sectionLabel}>Let&apos;s connect</p>
                <p className={styles.contactdescription}>
                  Want To Get In Touch?
                </p>
                <p className={styles.contactSubtext}>
                  Have a project, idea, or opportunity in mind? I&apos;d love to hear about it.
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
