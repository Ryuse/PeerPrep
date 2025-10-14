import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import QuestionCard from "./QuestionCard";
import {
  getCategories,
  getDifficulties,
  getQuestions,
} from "@/api/questionService";
import type { QuestionPreview } from "@/types/QuestionPreview";
import { DualRangeSlider } from "./ui/dual-range-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface QuestionListWithFiltersProps {
  onNavigate: (path: string) => void;
}

const itemsPerPage = 8;

const QuestionListWithFilters: React.FC<QuestionListWithFiltersProps> = ({
  onNavigate,
}) => {
  const [questions, setQuestions] = useState<QuestionPreview[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [timeRange, setTimeRange] = useState<[number, number]>([1, 240]);

  const totalPages = totalQuestions
    ? Math.ceil(totalQuestions / itemsPerPage)
    : 1;

  // Fetch categories and difficulties on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catData, diffData] = await Promise.all([
          getCategories(),
          getDifficulties(),
        ]);
        setCategories(catData.categories);
        setDifficulties(diffData.difficulties);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch questions whenever filters/page change
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const data = await getQuestions({
          category: selectedCategory,
          difficulty: selectedDifficulty,
          minTime: timeRange[0],
          maxTime: timeRange[1],
          size: itemsPerPage,
          page: currentPage,
        });
        setQuestions(data.questions);
        setTotalQuestions(data.totalCount);
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [currentPage, selectedCategory, selectedDifficulty, timeRange]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="flex flex-col w-full p-6 rounded-lg">
      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-6">
        {/* Category Dropdown */}
        <div>
          <p className="font-semibold mb-1">Category</p>
          <Select
            value={selectedCategory || undefined} // undefined when no category
            onValueChange={(val) => {
              setSelectedCategory(val ?? "");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Dropdown */}
        <div>
          <p className="font-semibold mb-1">Difficulty</p>
          <Select
            value={selectedDifficulty || undefined} // undefined when no difficulty
            onValueChange={(val) => {
              setSelectedDifficulty(val ?? "");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((diff) => (
                <SelectItem key={diff} value={diff}>
                  {diff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Time Slider */}
        <div className="flex flex-col flex-1">
          <p className="font-semibold mb-2">Time Limit (minutes)</p>
          <DualRangeSlider
            min={1}
            max={240}
            value={timeRange}
            onValueChange={(val) => setTimeRange([val[0], val[1]])}
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{timeRange[0]} min</span>
            <span>{timeRange[1]} min</span>
          </div>
        </div>
      </div>

      {/* Pagination Header */}
      <div className="flex justify-end items-center mb-4 text-gray-400 text-sm gap-2">
        <span>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalQuestions)} of{" "}
          {totalQuestions}
        </span>
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || loading}
          variant="link"
        >
          Previous
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || loading}
          variant="link"
        >
          Next
        </Button>
      </div>

      {/* Column Headers */}
      <div className="p-2 flex items-center gap-4 font-bold">
        <div className="w-15 grid justify-center">No.</div>
        <div className="px-10 flex-1 grid grid-cols-4 gap-4">
          <div>Question</div>
          <div>Topic</div>
          <div>Difficulty</div>
          <div>Time Limit</div>
        </div>
      </div>

      {/* Question List */}
      <div className="flex flex-col items-center gap-4 overflow-y-auto min-h-[60vh]">
        {loading ? (
          <p className="text-gray-500 mt-10">Loading questions...</p>
        ) : questions.length > 0 ? (
          questions.map((item, index) => (
            <QuestionCard
              key={item.questionId}
              item={item}
              index={(currentPage - 1) * itemsPerPage + index + 1}
              // Pass navigation handler on click
              onClick={() => onNavigate(`/questions/${item.questionId}`)}
            />
          ))
        ) : (
          <p className="text-gray-500 mt-10">No questions found.</p>
        )}
      </div>
    </div>
  );
};

export default QuestionListWithFilters;
