import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Steven Tran&apos;s Website</title>
        <meta
          name="Steven Tran's Portfolio Website."
          content="A website that is acts as both a portfolio and a get to know me."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header></header>
      <main className={styles.main} id="aboutme">
        <h1 className={styles.title}>Hi, I&apos;m Steven.</h1>
        <p className={styles.titlep}>CS Student at UGA</p>
        <div className={styles.aboutme}>
          <h2 className={styles.aboutmetitle}>Based in Metro-Atlanta.</h2>
        </div>

        <div className={styles.projects} id="projects">
          <h2 className={styles.projectstext}>
            Check out some of my projects.
          </h2>
          <div className={styles.grid}>
            <a
              href="https://github.com/Tran-Steven/website"
              className={styles.card}
            >
              <h2>This Website &rarr;</h2>
              <p>Find the source code I wrote for this website.</p>
            </a>

            <a
              href="https://github.com/Tran-Steven/leaguewordle"
              className={styles.card}
            >
              <h2>League of Wordle &rarr;</h2>
              <p>
                A League of Legends Wordle-like built with React and Node.js{" "}
              </p>
            </a>

            <a
              href="https://github.com/Tran-Steven/MultiPlaylist"
              className={styles.card}
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
                Not big enough to be considered a project, but other code I have
                written.
              </p>
            </a>
          </div>
        </div>
      </main>
      <div className={styles.holder} id="contact">
        <div className={styles.contact}>
          <div className={styles.contactcontainer}>
            <p className={styles.contactdescription}>Want To Get In Touch?</p>
            <form
              autoComplete="off"
              className={styles.formstyle}
              name="contact"
              method="POST"
              data-netlify="true"
            >
              <input type="text" name="name" placeholder="Name" />
              <input type="email" name="email" placeholder="Email" />
              <br />
              <textarea
                className={styles.formtextbox}
                name="message"
                placeholder="Type your message here"
                rows={5}
              ></textarea>

              <p>
                <button className={styles.contactbutton} type="submit">
                  Send
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
