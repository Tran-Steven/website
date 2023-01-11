import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import atlmorning from "../public/atlantamorning.jpg";
import atlnight from "../public/atlantanight.jpg";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  const { ref: myRef, inView: Visibility, entry } = useInView();

  return (
    <div className={styles.container}>
      <div className={styles.scrolltracker}></div>
      <Head>
        <title>Steven Tran&apos;s Website</title>
        <meta
          name="Steven Tran's Portfolio Website."
          content="A website that is acts as both a portfolio and a get to know me."
        />
        <script src="load.ts" type="module" defer />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header></header>
      <main className={styles.main} id="aboutme">
        <h1 className={styles.title}>Hi, I&apos;m Steven.</h1>
        <p className={styles.titlep}>CS Student at UGA</p>
        <div className={styles.aboutme}>
          <div ref={myRef} className={styles.hide}>
            <Image
              src={atlmorning}
              alt="Atlanta Cityscape Morning with text on it saying from georgia."
              className={styles.atl}
            />
          </div>
          <br />
          <div
            ref={myRef}
            className={`${styles.hide} ${
              Visibility ? styles.show : styles.hidden
            }`}
          >
            <h2 className={`${styles.aboutmetitle}`}>
              Based in Metro-Atlanta.
            </h2>
            <Image
              src={atlnight}
              alt="Atlanta Cityscape Nighttime"
              className={styles.atl}
            />
          </div>
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
              className={styles.card}
              rel="noopener noreferrer"
              target="_blank"
            >
              <h2>League of Wordle &rarr;</h2>
              <p>A League of Legends Wordle-like built with React and Node. </p>
            </a>
            <a
              href="https://github.com/Tran-Steven/MultiPlaylist"
              className={styles.card}
              rel="noopener noreferrer"
              target="_blank"
            >
              <h2>MultiPlaylist &rarr;</h2>
              <p>
                Website that combine videos and playlists from different
                websites and have them all within one accessible playlist.{" "}
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
              <p className={styles.contactdescription}>Want To Get In Touch?</p>
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
  );
}
