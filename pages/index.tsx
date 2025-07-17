import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import Image from "next/image";
import atlmorning from "../public/atlantamorning.jpg";
import atlnight from "../public/dtla.jpg";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Repos from "../public/repos.png";
import triangle from "../public/dropdown-icon.svg";
import Blurb from "../components/Blurb";
import DraggableVideo from "@components/DraggableVideo";
export default function Home() {
  const [show, setShow] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const scrollSectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: scrollSectionRef,
    offset: ["start 80%", "end 20%"],
  });

  const textOpacity = useTransform(scrollYProgress, [0.1, 0.25], [1, 0]);
  const containerWidth = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["100%", "100vw"]
  );
  const containerHeight = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["auto", "100vh"]
  );
  const borderRadius = useTransform(scrollYProgress, [0, 0.6], ["20px", "0px"]);
  const overlayTextOpacity = useTransform(
    scrollYProgress,
    [0.25, 0.45],
    [0, 1]
  );
  const overlayTextY = useTransform(scrollYProgress, [0.25, 0.45], [30, 0]);
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
          {showVideo ? <DraggableVideo /> : null}
          <button
            className={styles.secretbutton}
            onClick={() => {
              setShowVideo(!showVideo);
            }}
          >
            <h1 className={styles.title}>Hi, I&apos;m Steven.</h1>
          </button>

          <div className={styles.nameblurb}>
            <p className={styles.titlep}>LA based Software Engineer</p>
            <button
              className={styles.dropdownholder}
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
          <div className={styles.aboutme}>
            <motion.div style={{}}>
              <div className={styles.hide}>
                <Image
                  src={atlmorning}
                  alt="Atlanta Cityscape Morning with text on the image saying From Georgia."
                  className={styles.atl}
                />
              </div>
            </motion.div>
            <br />
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
            <h2 className={styles.projectstext} id="projects">
              Check out some of my projects.
            </h2>
            <div className={styles.grid}>
              <a
                href="https://github.com/Tran-Steven/website"
                className={styles.card}
                rel="noopener noreferrer"
                target="_blank"
              >
                <h2>This Website &rarr;</h2>
                <p> The source code I wrote for this website.</p>
              </a>
              <a
                href="https://github.com/Tran-Steven/leaguewordle"
                className={`${styles.card} ${styles.mobileHidden}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <h2>League of Wordle &rarr;</h2>
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
                <h2>MultiPlaylist &rarr;</h2>
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
                <h2>Watermarker &rarr;</h2>
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
                <h2>Neovim Config &rarr;</h2>
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
                <h2>Other GitHub Repositories &rarr;</h2>
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
