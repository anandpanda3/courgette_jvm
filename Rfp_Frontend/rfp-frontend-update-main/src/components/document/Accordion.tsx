import React, { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";
import { useQuestionStore } from "~/utils/store/questionStore";
import { useState } from "react";
import { ChunkDisplay } from "./ChunkDisplay";
import { backendClient } from "~/api/backend";
import { Textarea } from "../ui/textarea";
import { CheckSquare, XSquare } from "lucide-react"; // Removed SquarePen
import { Slider } from "../ui/slider";
import { PdfData } from "~/pages/documents";
import { SendHorizontal } from "lucide-react";
import { partialUtil } from "zod/lib/helpers/partialUtil";
import { Input } from "../ui/input";

const AccordionComponent = () => {
  const queries = useQuestionStore((state) => state.queries);
  const responses = useQuestionStore((state) => state.responses);
  const setActiveQuery = useQuestionStore((state) => state.setActiveQuery);
  const activeQuery = useQuestionStore((state) => state.activeQuery);
  const apiResponse = useQuestionStore((state) => state.apiResponse);
  const changeResponse = useQuestionStore((state) => state.changeResponse);
  const changeQueryatIndex = useQuestionStore((state) => state.changeQueryatIndex);
  const changeApiResponse = useQuestionStore(
    (state) => state.changeApiResponse
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isQuesEditing, setIsQuesEditing] = useState(false);
  const [indexWithEditQuestion, setIndexWithEditQuestion] = useState(-1)
  const [editableResponse, setEditableResponse] = useState("");
  const [editableQuestion, setEditableQuestion] = useState("")
  const setActiveChunk = useQuestionStore((state) => state.setActiveChunk);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuesHovered, setIsQuesHovered] = useState<boolean>(false)
  const emptyResponseAtIndex = useQuestionStore((state) => state.emptyResponseAtIndex)
  const [score, setScore] = useState<number>(
    apiResponse[activeQuery]?.confidence_score || 80
  );
  useEffect(() => {
        setScore(apiResponse[activeQuery]?.confidence_score || 80);

  }, [activeQuery,apiResponse]);

  const [loading, setLoading] = useState<boolean>(false);

  const handleSaveResponse = async (): Promise<void> => {
    if (queries[activeQuery] && editableResponse != "") {
      try {
        const res = await backendClient.saveQna(
          "/save-qna/",
          queries[activeQuery] || "",
          editableResponse
        );
        setIsEditing(false);
      } catch (e) {
        console.log("error saving response", e);
      }
    }
  };

  const handleQueryWithScore = async (): Promise<void> => {
    if (queries[activeQuery]) {
      try {
        setLoading(true);
        const res = await backendClient.fetchQueryWithScore(
          "/processquery/",
          queries[activeQuery] || "",
          score
        );
        if (res) {
          const apiRes = {
            reponseMessage: res.message,
            confidence_score: score,
            chunks: res.Chunks,
            files: res.pdf_data.map((data: PdfData) => ({
              id: data.pdf_name,
              filename: data.pdf_name,
              url: data.url,
              type: data.type,
            })),
          };
          changeApiResponse(activeQuery, apiRes);
          changeResponse(activeQuery, res.message);
        }
      } catch (e) {
        console.log("error saving response", e);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleQueryWithQuesChange = async (): Promise<void> => {
    changeQueryatIndex(activeQuery, editableQuestion);
    emptyResponseAtIndex(activeQuery)
    setIsQuesEditing(false);

    try {
      setLoading(true);
      const res = await backendClient.fetchQueryWithScore(
        "/processquery/",
        editableQuestion || "",
        score
      );
      if (res) {
        const apiRes = {
          reponseMessage: res.message,
          confidence_score: score,
          chunks: res.Chunks,
          files: res.pdf_data.map((data: PdfData) => ({
            id: data.pdf_name,
            filename: data.pdf_name,
            url: data.url,
            type: data.type,
          })),
        };
        changeApiResponse(activeQuery, apiRes);
        changeResponse(activeQuery, res.message);
      }
    } catch (e) {
      console.log("error saving response", e);
    } finally {
      setLoading(false);
    }

  };

  return (
    <Accordion
      type="single"
      collapsible
      className="flex flex-col gap-y-1"
      defaultValue={`item-0`}
    >
      {queries.map((query, i) => (
        <AccordionItem
          value={`item-${i}`}
          className={
            responses[i] ? "bg-gray-50 text-left" : "bg-gray-50 text-left"
          }
          key={i}
        >
          <AccordionTrigger
            className={
              responses[i] ? "p-[10px] " : "p-[10px]"
            }
            onMouseEnter={() => {if(activeQuery==i){
              setIsQuesHovered(true)
            }}}
            onMouseLeave={() => setIsQuesHovered(false)}
            onClick={() => {
              if (!isQuesEditing) {
                setActiveQuery(i);
              }
              setScore(apiResponse[i]?.confidence_score || 80)
              setActiveChunk(apiResponse[i]?.chunks[0]?.chunk || "");
            }}
          >
            {
              !isQuesEditing ? (
                <div className="flex relative w-full">
                  <h1>{query}</h1>
                  {
                    isQuesHovered && activeQuery==i &&
                    <div
                      className="absolute justify-end right-[-15px] top-[2px] bg-slate-200 hover:cursor-pointer z-20"
                      onClick={() => {
                        setIsQuesEditing(true);
                        setIndexWithEditQuestion(i);
                        setEditableQuestion(query || "");
                      }}
                    >
                      {/* Removed SquarePen */}
                    </div>
                  }
                </div>
              ) : (
                <>
                  {
                    indexWithEditQuestion == i ? (
                      <div className="flex relative justify-between w-[95%]">
                        <Input
                          className="w-full"
                          value={editableQuestion}
                          onChange={(e) => {
                            setEditableQuestion(e.target.value)
                          }}>
                        </Input>
                        <div className="absolute top-2 right-1 bg-white">
                          <SendHorizontal onClick={()=>{
                            handleQueryWithQuesChange().catch((error) => {
                              console.error(
                                "Failed to save response",
                                error
                              );
                            });

                          }
                            } size={20} className="" strokeWidth={1.25} />
                        </div>
                      </div>

                    ) : (
                      <div className="flex justify-around">
                        <h1>{query}</h1>
                        {
                          isQuesHovered &&
                          <div
                            className="hover:cursor-pointer"
                            onClick={() => {
                              setIsQuesEditing(true);
                              setIndexWithEditQuestion(i);
                              setEditableQuestion(query || "");
                            }}
                          >
                            {/* Removed SquarePen */}
                          </div>
                        }
                      </div>)
                  }
                </>
              )
            }

          </AccordionTrigger>
          <AccordionContent className="mb-1 bg-white p-[10px] text-gray-700">
            {!loading ? (
              <>
                {responses[i] ? (
                  <>
                    {!isEditing ? (
                      <>
                        <div
                          className="relative flex w-full rounded-xl border bg-slate-100"
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                          <ReactMarkdown className="p-2">
                            {responses[i]}
                          </ReactMarkdown>
                          {isHovered && (
                            <div
                              className="absolute left-[8px] top-[8px] bg-slate-100 hover:cursor-pointer"
                              onClick={() => {
                                setIsEditing(true);
                                setEditableResponse(responses[i] || "");
                              }}
                            >
                              {/* Removed SquarePen */}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex justify-start gap-x-1 w-full">
                          <Slider
                            defaultValue={[score]}
                            max={100}
                            step={1}
                            onValueChange={(value) =>
                              setScore(value?.[0] || 80)
                            }
                          />
                          {/* <h1 className="text-[16px] font-medium">{score}%</h1> */}
                        </div>
                        <div className="mt-3 flex justify-end w-full">
                          <Button
                            className={score === 80 ? "px-[6px] py-1 opacity-40" : "px-[6px] py-1"}
                            disabled={score === 80}
                            onClick={() => {
                              handleQueryWithScore().catch((error) => {
                                console.error(
                                  "Failed to save response",
                                  error
                                );
                              });
                            }}
                          >
                            Regenerate Response
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="relative w-full">
                        <Textarea
                          className="w-full p-2"
                          value={editableResponse}
                          onChange={(e) => setEditableResponse(e.target.value)}
                        />
                        <div className="absolute left-0 top-0 flex justify-start gap-x-1 px-2 py-[4px]">
                          <CheckSquare
                            onClick={() => {
                              changeResponse(activeQuery, editableResponse);
                              handleSaveResponse().catch((error) => {
                                console.error(
                                  "Failed to save response",
                                  error
                                );
                              });
                            }}
                            strokeWidth={1.25}
                            className="hover:cursor-pointer"
                            size={18}
                          />
                          <XSquare
                            onClick={() => setIsEditing(false)}
                            strokeWidth={1.25}
                            className="hover:cursor-pointer"
                            size={18}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex w-full flex-col items-center justify-center">
                    <h1 className="text-[14px] font-medium italic text-gray-800">
                      Loading
                    </h1>
                    <Button
                      className="mt-2 w-max px-[6px] py-1"
                      onClick={() => {
                        setActiveQuery(i);
                        handleQueryWithScore().catch((error) => {
                          console.error("Failed to fetch response", error);
                        });
                      }}
                    >
                      Generate Response
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex w-full items-center justify-center">
                <h1 className="text-[14px] font-medium italic text-gray-700">
                  Loading...
                </h1>
              </div>
            )}
            <ChunkDisplay queryIndex={activeQuery} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionComponent;
