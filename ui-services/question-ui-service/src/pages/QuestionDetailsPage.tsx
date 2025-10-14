import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getQuestionById } from "@/api/questionService";
import type { Question } from "@/types/Question";
import QuestionDisplay from "@/components/QuestionDisplay";

interface QuestionDetailsPageProps {
  onNavigate: (path: string) => void;
  questionId: string;
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
}

const QuestionDetailsPage: React.FC<QuestionDetailsPageProps> = ({
  onNavigate,
  questionId,
  onEdit,
  onDelete,
}) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) return;

    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getQuestionById(questionId);
        setQuestion({
          id: data.questionId,
          title: data.title,
          body: data.content,
          topics: [data.categoryTitle ?? "Uncategorized"],
          hints: data.hints ?? [],
          answer: data.answer ?? "",
          difficulty: data.difficulty,
          timeLimit: data.timeLimit,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load question");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  if (loading) return <p className="text-gray-400">Loading question...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!question) return <p className="text-gray-400">No question found.</p>;

  return (
    <div className="p-6 flex gap-6">
      {/* Left Column: Question body */}
      <div className="flex-[2] overflow-y-auto h-[80vh]">
        <QuestionDisplay questionId={questionId} />
      </div>

      {/* Right Column: Meta info + actions */}
      <div className="flex-[1] flex flex-col gap-4">
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-gray-200">
          <h3 className="font-semibold mb-2 text-lg">Details</h3>
          <p>
            <span className="font-semibold">Category:</span>{" "}
            {question.topics[0]}
          </p>
          <p>
            <span className="font-semibold">Difficulty:</span>{" "}
            {question.difficulty}
          </p>
          <p>
            <span className="font-semibold">Time Limit:</span>{" "}
            {question.timeLimit} min
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            disabled={true}
            onClick={() => onEdit?.(question.id)}
            variant="outline"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
          >
            Edit
          </Button>
          <Button
            disabled={true}
            onClick={() => onDelete?.(question.id)}
            variant="outline"
            className="flex-1 bg-red-600 hover:bg-red-500 text-white"
          >
            Delete
          </Button>
          <Button
            onClick={() => onNavigate("/questions")}
            variant="outline"
            className="mb-4 w-24 bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailsPage;
