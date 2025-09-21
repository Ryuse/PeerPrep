import { useState } from "react";
import QuestionPreferences from "@/components/question-preference/QuestionPreferences";
import MatchFound from "@/components/MatchFound";

import MatchSearch from "@/components/MatchSearch";
import StartMatching from "@/components/StartMatching";

type PageView = "initial" | "preferences" | "matching" | "matchFound";

const MatchingPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<PageView>("initial");
  const [matchData, setMatchData] = useState<any | null>(null);
  const [preferences, setPreferences] = useState<any | null>(null);

  const handleStartMatching = (): void => {
    setCurrentView("preferences");
  };

  const handleConfirmPreferences = (prefs: any): void => {
    setPreferences(prefs);
    setCurrentView("matching");
  };

  const handleMatchFound = (): void => {
    setCurrentView("matchFound");
  };

  const handleAcceptMatch = (): void => {
    setCurrentView("initial");
  };

  const handleCancel = (): void => {
    setCurrentView("initial");
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center">
      {currentView === "initial" && (
        <StartMatching onStart={handleStartMatching} />
      )}

      {currentView === "preferences" && (
        <QuestionPreferences
          onConfirm={handleConfirmPreferences}
          userId={"TEST_USER"}
        />
      )}

      {currentView === "matching" && preferences && (
        <MatchSearch
          preferences={preferences}
          onMatchFound={(data) => {
            setMatchData(data);
            handleMatchFound();
          }}
          onCancel={handleCancel}
        />
      )}

      {currentView === "matchFound" && matchData && (
        <MatchFound
          matchedName={matchData.userId}
          difficulty={matchData.difficulties[0]}
          timeMins={matchData.minTime}
          topic={matchData.topics[0]}
          onCancel={handleCancel}
          onAccept={handleAcceptMatch}
          initialTime={15}
        />
      )}
    </main>
  );
};

export default MatchingPage;
