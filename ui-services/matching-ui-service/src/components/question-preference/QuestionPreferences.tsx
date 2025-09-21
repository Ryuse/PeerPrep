import { Button } from "@/components/ui/button";
import { useState } from "react";
import TopicSelector from "./TopicSelector";
import DifficultySelector from "./DifficultySelector";
import TimeLimitSelector from "./TimeLimitSelector";

interface QuestionPreferencesProps {
  onConfirm: (preferences: {
    topics: string[];
    difficulties: string[];
    minTime: number;
    maxTime: number;
  }) => void;
}

const QuestionPreferences: React.FC<QuestionPreferencesProps> = ({
  onConfirm,
}) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
    []
  );
  const [timeMin, setTimeMin] = useState<number>(10);
  const [timeMax, setTimeMax] = useState<number>(120);

  const handleConfirm = () => {
    const preferences = {
      topics: selectedTopics,
      difficulties: selectedDifficulties,
      minTime: timeMin,
      maxTime: timeMax,
    };

    onConfirm(preferences);
  };

  return (
    <div className="text-white p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TopicSelector
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
        />
        <div className="space-y-8 text-start">
          <DifficultySelector
            selectedDifficulties={selectedDifficulties}
            setSelectedDifficulties={setSelectedDifficulties}
          />
          <TimeLimitSelector
            timeMin={timeMin}
            timeMax={timeMax}
            setTimeMin={(value) => setTimeMin(Number(value))}
            setTimeMax={(value) => setTimeMax(Number(value))}
          />
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleConfirm}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-6"
        >
          Confirm Preferences!
        </Button>
      </div>
    </div>
  );
};

export default QuestionPreferences;
