import TetrisGame from '@/components/TetrisGame';
import Link from 'next/link';
import styles from './page.module.css';

export default function GomokuPage() {
  return (
    <div>
      <Link href="/" className={styles.backLink}>
        返回主页面
      </Link>
      <TetrisGame />
    </div>
  );
} 