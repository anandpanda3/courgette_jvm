import React, { useState } from 'react';
import styles from './Layout.module.css';

const Layout: React.FC = () => {
  const [leftWidth, setLeftWidth] = useState(50);
  const [rightWidth, setRightWidth] = useState(50);

  const handleResize = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setLeftWidth(value);
    setRightWidth(100 - value);
  };

  return (
    <div className={styles.layoutContainer}>
      <input
        type="range"
        min="0"
        max="100"
        value={leftWidth}
        onChange={handleResize}
        className={styles.rangeInput}
      />
      <div className={styles.leftPanel} style={{ width: `${leftWidth}%` }}>
        Left Panel
      </div>
      <div className={styles.rightPanel} style={{ width: `${rightWidth}%` }}>
        Right Panel
      </div>
    </div>
  );
};

export default Layout;
