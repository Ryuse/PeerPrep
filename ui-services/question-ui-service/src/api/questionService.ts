import type { QuestionPreview } from "@/types/QuestionPreview";

interface GetQuestionsParams {
  category?: string;
  difficulty?: string;
  minTime?: number;
  maxTime?: number;
  size?: number;
  page?: number;
}

interface GetQuestionsResponse {
  questions: QuestionPreview[];
  totalCount: number;
}

export async function getQuestions(
  params: GetQuestionsParams,
): Promise<GetQuestionsResponse> {
  const apiUri = import.meta.env.VITE_QUESTION_SERVICE_API_LINK;
  const query = new URLSearchParams();

  if (params.category) query.append("category", params.category);
  if (params.difficulty) query.append("difficulty", params.difficulty);
  if (params.minTime !== undefined)
    query.append("minTime", params.minTime.toString());
  if (params.maxTime !== undefined)
    query.append("maxTime", params.maxTime.toString());
  if (params.size) query.append("size", params.size.toString());
  if (params.page) query.append("page", params.page.toString());

  const uriLink = `${apiUri}/questions?${query.toString()}`;

  const response = await fetch(uriLink, { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch questions");

  const data = await response.json();

  // Map backend keys to frontend expected keys
  return {
    questions: data.questions ?? [],
    totalCount: data.total ?? 0,
  };
}

export interface GetCategoriesResponse {
  categories: string[];
}

export async function getCategories(): Promise<GetCategoriesResponse> {
  const apiUri = import.meta.env.VITE_QUESTION_SERVICE_API_LINK;
  const uriLink = `${apiUri}/questions/categories`;

  const response = await fetch(uriLink, { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch categories");

  const data = await response.json();

  return {
    categories: data.categories ?? [],
  };
}

export async function getDifficulties(): Promise<{ difficulties: string[] }> {
  const apiUri = import.meta.env.VITE_QUESTION_SERVICE_API_LINK;
  const response = await fetch(`${apiUri}/questions/difficulties`);
  if (!response.ok) throw new Error("Failed to fetch difficulties");
  const data = await response.json();
  return { difficulties: data.difficulties ?? [] };
}

export interface QuestionDetails {
  questionId: string;
  title: string;
  categoryTitle: string;
  difficulty: string;
  timeLimit: number;
  content: string;
  hints: string[];
  exampleTestcases: string;
  codeSnippets: {
    lang: string;
    langSlug: string;
    code: string;
  }[];
  createdAt: string;
  updatedAt: string;
  answer?: string;
}

/**
 * Fetch question details by ID
 */
export async function getQuestionById(id: string): Promise<QuestionDetails> {
  const apiUri = import.meta.env.VITE_QUESTION_SERVICE_API_LINK;
  const response = await fetch(`${apiUri}/questions/${id}`);

  if (response.status === 404) throw new Error("Question not found");
  if (!response.ok) throw new Error("Failed to fetch question details");

  const data = await response.json();
  return data as QuestionDetails;
}
