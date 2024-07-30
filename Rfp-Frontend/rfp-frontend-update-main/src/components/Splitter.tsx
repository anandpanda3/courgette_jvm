import React from 'react';
import { Split } from "a-multilayout-splitter";


// Extend OriginalSplitProps with our additional 'id' prop
interface SplitProps{
  id: string;
  children:React.ReactNode;
  collapsed:boolean[]
  initialSizes: string[]
  onDragEnd: (pre: unknown, next: unknown, pane: unknown) => void
  mode: string
}

const SplitComp = (props:SplitProps) => {
  const { id,children } = props;
  return <Split id={id}>{children}</Split>
};

export default SplitComp;