import styles from "../styles/Blurb.module.css";

export default function Blurb() {
  return (
    <div className={styles.container}>
      <p>
        I&apos;m a computer science graduate from the University of Georgia,
        previously doing research at the Neuro-Symbolic Computing Research Lab.
      </p>
      <p>
        I keep notes on what I&apos;m learning in{" "}
        <a
          href="https://steven-tran.notion.site/CS-Concept-Notes-a8ade4543472479ea0f3ff3a5263ad7f"
          rel="noopener noreferrer"
          target="_blank"
        >
          Notion
        </a>.
      </p>
    </div>
  );
}
