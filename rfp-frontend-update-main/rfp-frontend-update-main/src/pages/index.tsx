// pages/index.tsx
import React from 'react';
import { useRouter } from 'next/router';
import styles from '~/components/ui/Home.module.css'; // Adjust the path as necessary

const HomePage = () => {
  const router = useRouter();

  const handleStart = () => {
    router.push('/documents').catch(() => console.error('Error navigating to documents page'));
  };

  return (
    <div className={styles.homeContainer}>
      <h1>Welcome to the Home Page</h1>
      <button onClick={handleStart}>Go to Documents</button>
    </div>
  );
};

export default HomePage;
