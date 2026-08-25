import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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
  const atlScrollRef = useRef(null);

  const { scrollYProgress: atlScrollProgress } = useScroll({
    target: atlScrollRef,
    offset: ["start 80%", "end 20%"],
  });

  const { scrollYProgress } = useScroll({
    target: scrollSectionRef,
    offset: ["start 75%", "end 15%"],
  });

  const textOpacity = useTransform(scrollYProgress, [0.08, 0.2], [1, 0]);
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
          <div className={styles.reposmobile}>
            <h2>Always working on projects and learning new things.</h2>
          </div>
          <div className={styles.repos}>
            <a
              href="https://github.com/Tran-Steven?tab=repositories/"
              rel="noopener noreferrer"
              target="_blank"
              className={styles.reposimg}
            >
              <Image
                src={Repos}
                alt="List of my repos"
                className={styles.reposimg}
              />
            </a>

            <h2 className={styles.reposdesktop}>
              Always working on projects and learning new things.
            </h2>
          </div>
          <div className={styles.projects}>
            <div className={styles.sectionHeading}>
              <p className={styles.sectionLabel}>Selected work</p>
              <h2 className={styles.projectstext} id="projects">
                Check out some of my projects.
              </h2>
              <p className={styles.sectionDescription}>
                A few experiments, tools, and products I&apos;ve built along the way.
              </p>
            </div>
            <div className={styles.grid}>
              <a
                href="https://github.com/Tran-Steven/website"
                className={styles.card}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.cardNumber}>01</span>
                <h2>This Website <span aria-hidden="true">↗</span></h2>
                <p> The source code I wrote for this website.</p>
              </a>
              <a
                href="https://github.com/Tran-Steven/leaguewordle"
                className={`${styles.card} ${styles.mobileHidden}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.cardNumber}>02</span>
                <h2>League of Wordle <span aria-hidden="true">↗</span></h2>
                <p>
                  A League of Legends Wordle-like built with React and Node.
                </p>
              </a>
              <a
                href="https://github.com/Tran-Steven/MultiPlaylist"
                className={`${styles.card} ${styles.mobileHidden}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.cardNumber}>03</span>
                <h2>MultiPlaylist <span aria-hidden="true">↗</span></h2>
                <p>
                  Website that combine videos and playlists from different
                  websites and have them all within one accessible playlist.
                </p>
              </a>
              <a
                href="https://github.com/lenhatdangkhoa/ugahacks9"
                className={styles.card}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.cardNumber}>04</span>
                <h2>Watermarker <span aria-hidden="true">↗</span></h2>
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
                className={styles.card}
              >
                <span className={styles.cardNumber}>05</span>
                <h2>Neovim Config <span aria-hidden="true">↗</span></h2>
                <p>
                  My personal Neovim configuration that I use, which includes
                  plugins and settings.
                </p>
              </a>
              <a
                href="https://github.com/Tran-Steven?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
              >
                <span className={styles.cardNumber}>06</span>
                <h2>Other GitHub Repositories <span aria-hidden="true">↗</span></h2>
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
