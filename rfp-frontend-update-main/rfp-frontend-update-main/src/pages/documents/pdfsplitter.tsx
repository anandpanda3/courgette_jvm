// import React, { useState } from 'react';
// import { useQuestionStore } from '~/utils/store/questionStore';
// import AccordionComponent from '~/components/document/Accordion';
// import DisplayMultiplePdfs from '~/components/pdf-viewer/DisplayMultiplePdfs';

// // Use require instead of import for Split
// const { Split } = require('a-multilayout-splitter');

// const PDFSplitter: React.FC = () => {
//   const activeQuery = useQuestionStore((state) => state.activeQuery);
//   const apiResponse = useQuestionStore((state) => state.apiResponse);

//   const [leftPaneWidth, setLeftPaneWidth] = useState('50%');
//   const [rightPaneWidth, setRightPaneWidth] = useState('50%');

//   const handleDragEnd = (previousSize: number, newSize: number, pane: number) => {
//     console.log(previousSize, newSize, pane);
//     const leftWidth = `${newSize}%`;
//     const rightWidth = `${100 - newSize}%`;
//     setLeftPaneWidth(leftWidth);
//     setRightPaneWidth(rightWidth);
//   };

//   const isLoading = !apiResponse[activeQuery];

//   return (
//     <Split
//       collapsed={[false, false]}
//       initialSizes={[50, 50]}
//       onDragEnd={handleDragEnd}
//       id="pdf-splitter"
//       mode="horizontal"
//     >
//       <div 
//         style={{ 
//           fontFamily: 'Inter', 
//           width: leftPaneWidth 
//         }} 
//         className="flex h-[100vh] flex-col items-center border-r-2 bg-black"
//       >
//         <div className="flex h-full w-full flex-grow flex-col overflow-scroll">
//           <div className="mx-auto flex w-[100%] flex-col text-left">
//             <AccordionComponent />
//           </div>
//         </div>
//       </div>
//       <div 
//         style={{ 
//           width: rightPaneWidth 
//         }} 
//         className="h-[100vh]"
//       >
//         {isLoading ? (
//           <div className="flex h-full w-full items-center justify-center">
//             <h1>loading...</h1>
//           </div>
//         ) : (
//           <DisplayMultiplePdfs
//             fileUrls={apiResponse[activeQuery]?.files || []}
//           />
//         )}
//       </div>
//     </Split>
//   );
// };

export default PDFSplitter;