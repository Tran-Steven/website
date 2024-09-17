import React from "react";
import styles from "../styles/TechMarquee.module.css";
import Image from "next/image"; // Correct the import here

const techLogos = [
  { src: "/react.svg", alt: "React" },
  { src: "/typescript.svg", alt: "TypeScript" },
  { src: "/java.svg", alt: "Java" },
  { src: "/spring.svg", alt: "Spring" },
  { src: "/postgresql.svg", alt: "PostgreSQL" },
  { src: "/nextjs.svg", alt: "Next.js" },
  { src: "/javascript.svg", alt: "JavaScript" },
  { src: "/docker.svg", alt: "Docker" },
  { src: "/mysql.svg", alt: "MySQL" },
];

const TechMarquee: React.FC = () => {
  return (
    <div className={styles.marqueeContainer}>
      <div className={styles.marquee}>
        <div className={styles.marqueeContent}>
          {techLogos.concat(techLogos).map((logo, index) => (
            <div key={index} className={styles.logo}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={50}
                height={50}
                className={styles.logoImage}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechMarquee;
