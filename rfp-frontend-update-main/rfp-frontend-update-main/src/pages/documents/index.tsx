import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { PdfFocusProvider } from "~/context/pdf";
import AccordionComponent from "~/components/document/Accordion";
import DisplayMultiplePdfs from "~/components/pdf-viewer/DisplayMultiplePdfs";
import { BiArrowBack } from "react-icons/bi";
import useIsMobile from "~/hooks/utils/useIsMobile";
import { backendClient } from "~/api/backend";
import { useQuestionStore, clearData } from "~/utils/store/questionStore";
import MobileWarningComponent from "~/components/document/MobileWarningComponent";
import { useAuth } from "@clerk/nextjs";
import dynamic from 'next/dynamic';
import styles from '~/components/ui/Layout.module.css';

// Use dynamic import for `Split` component
const Split = dynamic(() => import('a-multilayout-splitter').then(mod => mod.Split), { ssr: false });

export interface PdfData {
  pdf_name: string;
  url: string;
  type: string;
}

export interface ApiResponse {
  message: string;
  Chunks: Chunk[];
  pdf_data: PdfData[];
}

export default function Conversation() {
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);

  const queries = useQuestionStore((state) => state.queries);
  const responses = useQuestionStore((state) => state.responses);
  const addResponse = useQuestionStore((state) => state.addResponse);
  const activeQuery = useQuestionStore((state) => state.activeQuery);
  const addApiResponse = useQuestionStore((state) => state.addApiResponse);
  const apiResponse = useQuestionStore((state) => state.apiResponse);
  const setActiveChunk = useQuestionStore((state) => state.setActiveChunk);
  const activeChunk = useQuestionStore((state) => state.activeChunk);
  const setActiveChunkIndex = useQuestionStore((state) => state.setActiveChunkIndex);
  const [pdfData, setPdfData] = useState<PdfData[]>([]);

  useEffect(() => {
    const fetchDataSequentially = async () => {
      for (const [index, question] of queries.entries()) {
        try {
          const responseData = await backendClient.fetchQueryWithScore("/processquery/", question, 80);
          if (responseData) {
            addResponse(responseData.message);
            addApiResponse({
              reponseMessage: responseData.message,
              confidence_score: 80,
              chunks: responseData.Chunks,
              files: responseData.pdf_data.map((data: PdfData) => ({
                id: data.pdf_name,
                filename: data.pdf_name,
                url: data.url,
                type: data.type
              })),
            });
            if (index === 0 && responseData?.pdf_data[0]?.type === "csv" && !activeChunk && responseData?.Chunks[0]?.chunk) {
              setActiveChunk(responseData.Chunks[0].chunk);
            }
          } else {
            addResponse("Enough information is not available to answer the question");
            addApiResponse({
              reponseMessage: "Enough information is not available to answer the question",
              confidence_score: 80,
              chunks: [],
              files: [],
            });
          }
          setLoading(false);
        } catch (e) {
          console.error(`Error fetching data for query index ${index}:`, e);
          break;
        }
      }
    };

    if (queries.length > responses.length) {
      fetchDataSequentially()
        .then(() => {
          console.log('Responses saved successfully');
        })
        .catch((error) => {
          console.error('Failed to save responses', error);
        });
    }
  }, [queries, responses, addResponse, addApiResponse, activeChunk, setActiveChunk]);

  useEffect(() => {
    if (apiResponse[0] && apiResponse.length > 0) {
      setLoading(false);
    }
  }, [apiResponse]);

  const formatMarkdown = (message: string): string => {
    const lines: string[] = message.split("\n");
    let formattedMessage = "";
    
    let currentHeadingLevel = 2;
    let currentNumber: number | null = null;
    let currentSubheadingLetter = "a";

    lines.forEach((line: string) => {
      const numberMatch = line.match(/^\d+\./);
      if (numberMatch && numberMatch[0]) {
        const number: string | undefined = numberMatch[0].match(/^\d+/)?.[0];
        if (number) {
          const newNumber = parseInt(number, 10);
          if (currentNumber === null || newNumber !== currentNumber) {
            currentNumber = newNumber;
            formattedMessage += `### ${currentNumber}. ${line
              .slice(line.indexOf(".") + 1)
              .trim()}\n\n`;
            currentSubheadingLetter = "a";
          } else {
            formattedMessage += `   ${currentSubheadingLetter}. ${line
              .slice(line.indexOf(".") + 1)
              .trim()}\n`;
            currentSubheadingLetter = String.fromCharCode(
              currentSubheadingLetter.charCodeAt(0) + 1
            );
          }
        }
      } else if (line.startsWith("- **")) {
        formattedMessage += `      - ${line.slice(4).trim()}\n`;
      } else if (line.startsWith("   - ")) {
        formattedMessage += `         - ${line.slice(5).trim()}\n`;
      } else if (line.trim() !== "") {
        formattedMessage += `${line.trim()}\n\n`;
        currentHeadingLevel = 2;
      }
    });

    return formattedMessage;
  };

  if (isMobile) {
    return <MobileWarningComponent />;
  }

  return (
    <PdfFocusProvider>
      <div className={styles.layoutContainer}>
        <Split
          collapsed={[false, false]}
          initialSizes={['50%', '50%']}
          
          id="pdf-splitter"
          mode="horizontal"
        >
          <div className={styles.leftPanel}>
            <div className={styles.panelHeader}>
              <button
                onClick={() => {
                  clearData();
                  router.push("/").catch(() => console.error("error navigating home"));
                }}
                className={styles.backButton}
              >
                <BiArrowBack className="mr-1" /> Back to Document Selection
              </button>
            </div>
            <div className={styles.accordionContainer}>
              <AccordionComponent />
            </div>
          </div>
          <div className={styles.rightPanel}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <h1>loading...</h1>
              </div>
            ) : (
              <DisplayMultiplePdfs fileUrls={apiResponse[activeQuery]?.files || []} />
            )}
          </div>
        </Split>
      </div>
    </PdfFocusProvider>
  );
}
