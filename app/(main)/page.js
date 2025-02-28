import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>欢迎来到我的网站</h1>
      <Link href="/gomoku" className={styles.link}>
        玩俄罗斯方块
      </Link>
    </div>
  );
} 