import { useState } from "react";
import { usePdfFocus } from "~/context/pdf";
import { Citation } from "~/types/conversation";
import { useQuestionStore } from "~/utils/store/questionStore";

export const ChunkDisplay = () => {
    const { setPdfFocusState } = usePdfFocus();
    const apiResponse = useQuestionStore((state) => state.apiResponse);
    const activeQuery = useQuestionStore((state) => state.activeQuery);
    const setActiveChunk=useQuestionStore((state)=>state.setActiveChunk)
    const setActiveChunkIndex=useQuestionStore((state)=>state.setActiveChunkIndex)
    const [cnt,setCnt]=useState(0)

    const handleCitationClick = (
      documentId: string,
      pageNumber: number,
      citation: Citation
    ) => {
      setPdfFocusState({ documentId, pageNumber, citation });
    };
    const handleClickTwice = (
      documentId: string,
      pageNumber: number,
      chunk: string,
      pdfName: string,
      i: number
    ) => {
      const citation: Citation = {
        documentId: pdfName,
        snippet: chunk,
        pageNumber: pageNumber,
        highlightColor: "yellow",
      };
  
      setActiveChunkIndex(i);
      setActiveChunk(chunk);
      handleCitationClick(documentId, pageNumber, citation);

      if (cnt === 0) {
        
        setCnt(1);
        setTimeout(()=>{
          const element = document.getElementById(`chunkid-${i}`);
          // console.log("element",element);
          
          if (element) {
            // console.log("click once more");
            element.click();
          }
          setTimeout(() => {
            setCnt(0);
          }, 1500);
        },500)
      }
    };
// console.log("cnt",cnt);


    return (
      <div className="mt-1 flex gap-x-2 overflow-auto">
        {apiResponse[activeQuery] &&
          apiResponse[activeQuery]?.chunks.map((d, i) => {
            return (
              <div
              id={`chunkid-${i}`}
              key={i}
              onClick={() =>
                handleClickTwice(
                  d.pdfName || "",
                  d.pageno,
                  d.chunk,
                  d.pdfName || "",
                  i
                )
              }
              className="line-clamp-2 w-[200px] rounded-md border bg-gray-100 p-1 text-[12px] text-gray-900 hover:cursor-pointer hover:bg-slate-200"
              >
                <p className="border-l-4 border-slate-950 pl-1">{d.chunk}</p>
              </div>
            );
          })}
      </div>
    );
  };