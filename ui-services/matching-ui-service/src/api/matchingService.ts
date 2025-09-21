export interface UserPreferences {
  userId: string;
  topics: string[];
  difficulties: string[];
  minTime: number;
  maxTime: number;
}

export interface MatchingResponse {
  matchedUserId?: string;
  [key: string]: any;
}

export type MatchResult =
  | { status: "found"; data: MatchingResponse }
  | { status: "notFound" }
  | { status: "error"; error: any };

export async function requestMatch(
  preferences: UserPreferences
): Promise<MatchResult> {
  const apiUri = "http://localhost:5274/api/matching-service/";
  console.log("API URI:", apiUri);
  if (!apiUri) throw new Error("API link is not defined");

  const uriLink = `${apiUri}request-match/${preferences.userId}`;

  try {
    const response = await fetch(uriLink, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });

    if (response.status === 202) {
      return { status: "notFound" };
    }

    if (!response.ok) {
      return { status: "error", error: `HTTP error ${response.status}` };
    }

    const data: MatchingResponse = await response.json();
    return { status: "found", data };
  } catch (err) {
    return { status: "error", error: err };
  }
}
