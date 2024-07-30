import React, { useRef, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import styles from '~/components/ui/PdfViewer.module.css'; // Adjust the path as necessary

interface DisplayMultiplePdfsProps {
  fileUrls: { url: string }[];
}

const DisplayMultiplePdfs: React.FC<DisplayMultiplePdfsProps> = ({ fileUrls }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      // Any additional logic to handle resizing if necessary
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.pdfContainer} ref={containerRef}>
      {fileUrls.map((file, index) => (
        <Document key={index} file={file.url}>
          <Page pageNumber={1} width={containerRef.current ? containerRef.current.clientWidth : 600} />
        </Document>
      ))}
    </div>
  );
};

export default DisplayMultiplePdfs;
