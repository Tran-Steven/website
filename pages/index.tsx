import Head from "next/head";
import styles from "../styles/Home.module.css";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";
export default function Home() {
  return (
    <div className={styles.container}>
      <Navbar />
      <Head>
        <title>Steven Tran's Website</title>
        <meta
          name="A basic get to know me website."
          content="Portfolio and details about me."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header></header>
      <main className={styles.main}>
        <h1 className={styles.title}>Hi I'm Steven</h1>
        <p className={styles.titlep}>CS Student at UGA</p>
        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>
      <div className={styles.contact}>
        <div className={styles.contact}>
          <p className={styles.description}>Get In Touch With Me</p>
          <button className={styles.contactbutton}>Contact</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
