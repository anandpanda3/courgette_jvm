import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../ui/button";
import ReactMarkdown from "react-markdown";
import { useQuestionStore } from "~/utils/store/questionStore";
import { ChunkDisplay } from "./ChunkDisplay";
import { backendClient } from "~/api/backend";
import { Textarea } from "../ui/textarea";
import { SquarePen, SquareCheck, SquareX, SendHorizontal } from "lucide-react";
import { PdfData } from "~/pages/documents";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider"; // Import the updated Slider component

const AccordionComponent = () => {
  const queries = useQuestionStore((state) => state.queries);
  const responses = useQuestionStore((state) => state.responses);
  const setActiveQuery = useQuestionStore((state) => state.setActiveQuery);
  const activeQuery = useQuestionStore((state) => state.activeQuery);
  const apiResponse = useQuestionStore((state) => state.apiResponse);
  const changeResponse = useQuestionStore((state) => state.changeResponse);
  const changeQueryatIndex = useQuestionStore((state) => state.changeQueryatIndex);
  const changeApiResponse = useQuestionStore((state) => state.changeApiResponse);

  const [isEditing, setIsEditing] = useState(false);
  const [isQuesEditing, setIsQuesEditing] = useState(false);
  const [indexWithEditQuestion, setIndexWithEditQuestion] = useState(-1);
  const [editableResponse, setEditableResponse] = useState("");
  const [editableQuestion, setEditableQuestion] = useState("");
  const setActiveChunk = useQuestionStore((state) => state.setActiveChunk);
  const [isHovered, setIsHovered] = useState(false);
  const [isQuesHovered, setIsQuesHovered] = useState<boolean>(false);
  const emptyResponseAtIndex = useQuestionStore((state) => state.emptyResponseAtIndex);
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const initialScores = queries.map((_, index) =>
      apiResponse[index]?.confidence_score || 80
    );
    setScores(initialScores);
  }, [queries, apiResponse]);

  const handleScoreChange = (index: number, newScore: number) => {
    setScores((prevScores) => {
      const newScores = [...prevScores];
      newScores[index] = newScore;
      return newScores;
    });
  };

  const handleSaveResponse = async (): Promise<void> => {
    if (queries[activeQuery] && editableResponse !== "") {
      try {
        await backendClient.saveQna(
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

  const handleQueryWithScore = async (index: number): Promise<void> => {
    if (queries[index]) {
      try {
        setLoading(true);
        const res = await backendClient.fetchQueryWithScore(
          "/processquery/",
          queries[index] || "",
          scores[index]
        );
        if (res) {
          const apiRes = {
            reponseMessage: res.message,
            confidence_score: scores[index],
            chunks: res.Chunks,
            files: res.pdf_data.map((data: PdfData) => ({
              id: data.pdf_name,
              filename: data.pdf_name,
              url: data.url,
              type: data.type,
            })),
          };
          changeApiResponse(index, apiRes);
          changeResponse(index, res.message);
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
    emptyResponseAtIndex(activeQuery);
    setIsQuesEditing(false);

    try {
      setLoading(true);
      const res = await backendClient.fetchQueryWithScore(
        "/processquery/",
        editableQuestion || "",
        scores[activeQuery]
      );
      if (res) {
        const apiRes = {
          reponseMessage: res.message,
          confidence_score: scores[activeQuery],
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
            className={responses[i] ? "p-[10px] text-left" : "p-[10px] text-left"}
            onClick={() => {
              if (!isQuesEditing) {
                setActiveQuery(i);
              }
              setActiveChunk(apiResponse[i]?.chunks[0]?.chunk || "");
            }}
          >
            {!isQuesEditing ? (
              <div className="flex relative w-full items-center">
                <h1 className="flex-grow text-left">{query}</h1>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleQueryWithScore(i)}
                  className="ml-2"
                >
                  Generate Response
                </Button>
                <div
                  className="ml-2 bg-slate-200 hover:cursor-pointer z-20"
                  style={{ position: "relative" }}
                  onClick={() => {
                    setIsQuesEditing(true);
                    setIndexWithEditQuestion(i);
                    setEditableQuestion(query || "");
                  }}
                >
                  <SquarePen strokeWidth={1.25} size={20} />
                </div>
              </div>
            ) : (
              <>
                {indexWithEditQuestion === i ? (
                  <div className="flex relative justify-between w-[95%]">
                    <Input
                      className="w-full"
                      value={editableQuestion}
                      onChange={(e) => {
                        setEditableQuestion(e.target.value);
                      }}
                    />
                    <div className="absolute top-2 right-1 bg-white">
                      <SendHorizontal
                        onClick={() => {
                          handleQueryWithQuesChange().catch((error) => {
                            console.error("Failed to save response", error);
                          });
                        }}
                        size={20}
                        className=""
                        strokeWidth={1.25}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <h1>{query}</h1>
                    <div
                      className="hover:cursor-pointer"
                      onClick={() => {
                        setIsQuesEditing(true);
                        setIndexWithEditQuestion(i);
                        setEditableQuestion(query || "");
                      }}
                    >
                      <SquarePen strokeWidth={1.25} size={20} />
                    </div>
                  </div>
                )}
              </>
            )}
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
                          <ReactMarkdown className="p-2 flex-grow">
                            {responses[i]}
                          </ReactMarkdown>
                          <div
                            className="absolute top-[-24px] right-[8px] bg-slate-100 hover:cursor-pointer z-20"
                            style={{ position: "relative" }}
                            onClick={() => {
                              setIsEditing(true);
                              setEditableResponse(responses[i] || "");
                            }}
                          >
                            {/* <SquarePen strokeWidth={1.25} size={20} /> */}
                          </div>
                          <div
                            className="absolute top-[0px] right-[8px] bg-slate-100 hover:cursor-pointer z-20"
                            style={{ position: "relative", top: "30px" }}
                            onClick={() => {
                              setIsEditing(true);
                              setEditableResponse(responses[i] || "");
                            }}
                          >
                            <SquarePen strokeWidth={1.25} size={20} />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center space-x-2">
                          <div className="flex w-full">
                            <Slider
                              value={[scores[i]]}
                              max={100}
                              step={1}
                              onValueChange={(value) => handleScoreChange(i, value[0])}
                              displayValue={scores[i]} // Add this prop to display the current score
                            />
                          </div>
                        </div>
                        <div>
                          {apiResponse[i]?.chunks && (
                            <ChunkDisplay
                              heading="Processed chunks"
                              chunks={apiResponse[i]?.chunks || []}
                            />
                          )}
                          {apiResponse[i]?.files && (
                            <ChunkDisplay
                              heading="Relevant files"
                              files={apiResponse[i]?.files || []}
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full">
                        <Textarea
                          className="w-full"
                          value={editableResponse}
                          onChange={(e) => setEditableResponse(e.target.value)}
                        />
                        <div className="flex justify-between mt-2">
                          <div className="flex space-x-2">
                            <SquareCheck
                              size={20}
                              strokeWidth={1.25}
                              onClick={() => handleSaveResponse()}
                              className="hover:cursor-pointer"
                            />
                            <SquareX
                              size={20}
                              strokeWidth={1.25}
                              onClick={() => setIsEditing(false)}
                              className="hover:cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full">
                    <Textarea
                      className="w-full"
                      placeholder="Loading..."
                      value={editableResponse}
                      onChange={(e) => setEditableResponse(e.target.value)}
                    />
                    <div className="mt-2 flex justify-between gap-x-2">
                      <SquareCheck
                        size={20}
                        strokeWidth={1.25}
                        onClick={() => handleSaveResponse()}
                        className="hover:cursor-pointer"
                      />
                      <SquareX
                        size={20}
                        strokeWidth={1.25}
                        onClick={() => setIsEditing(false)}
                        className="hover:cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>Loading...</div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionComponent;
