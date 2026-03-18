const CODEFORCES_API = "https://codeforces.com/api/";

export type Problem = {
  contestId: number,
  index: string,
  name: string,
  type: "PROGRAMMING" | "QUESTION",
  points: number
  rating: number | 0
  tags: string[]
};

export async function getProblems(): Promise<Problem[]> {
  const METHOD = "problemset.problems";
  const DESTINATION = CODEFORCES_API + METHOD;

  const response = await fetch(DESTINATION).then((response) => response.json());
  const result = response["result"]
  const problems = result["problems"]

  return problems
}