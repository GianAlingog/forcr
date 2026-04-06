import { Problem, Submission, Training, User, SubmissionStatus } from "@/lib/types"
import { fetchUserRating, storeUserRating } from "./utils";

const CODEFORCES_API = "https://codeforces.com/api/";

export function timify(): number {
  return 0;
}

export function stringify(problem: Problem): string {
  return `${problem.contestId}::${problem.index}`;
}

export async function fetchUserInfo(userName: string): Promise<User | null> {
  const METHOD = `user.info?handles=${userName}&checkHistoricHandles=false`;
  const DESTINATION = CODEFORCES_API + METHOD;

  try {
    const response = await fetch(DESTINATION).then((response) => response.json());
    if (response.status !== "OK" || !response.result) return null;

    return response.result[0] as User;
  } catch (err) {
    console.error("Failed to fetch problems:", err);
    return null;
  }
};

// TODO: design some sort of cache?
// this is weird because we're planning to allow local running
// check the file size and maybe save it somewhere
export async function fetchProblems(): Promise<Problem[]> {
  const METHOD = `problemset.problems`;
  const DESTINATION = CODEFORCES_API + METHOD;

  try {
    const response = await fetch(DESTINATION).then((response) => response.json());
    if (response.status !== "OK" || !response.result) return [];

    return response.result.problems as Problem[];
  } catch (err) {
    console.error("Failed to fetch problems:", err);
    return [];
  }
}

// future: also filter by date range
export async function fetchSubmissions(userName: string, limit: number = -1): Promise<Submission[]> {
  let METHOD = `user.status?handle=${userName}`;
  if (limit !== -1) METHOD += `&from=1&count=${limit}`;
  const DESTINATION = CODEFORCES_API + METHOD;

  try {
    const response = await fetch(DESTINATION).then((response) => response.json());
    if (response.status !== "OK" || !response.result) return [];

    return response.result as Submission[];
  } catch (err) {
    console.error("Failed to fetch submissions:", err);
    return [];
  }
}

export async function generateIdentifyProblem(): Promise<Problem> {
  const problems = await fetchProblems();

  const indexedProblems: [number, Problem][] = problems.map(
    (problem) => [Math.random(), problem]
  );

  const shuffledProblems = indexedProblems.sort(
    (a, b) => a[0] - b[0]
  );

  const normalizedProblems = shuffledProblems.map(
    (element) => element[1]
  );

  return normalizedProblems[0];
};

export async function generateTraining(userName: string): Promise<Training> {
  const problems = await fetchProblems();
  const submissions = await fetchSubmissions(userName);

  const submissionsSet = new Set(
    submissions.map(
      (submission) => stringify(submission.problem)
    )
  );

  // future: apply other filters here like tags, rating, date, div, etc
  let filteredProblems = problems.filter(
    (problem) =>
      !submissionsSet.has(stringify(problem))
  );

  const indexedProblems: [number, Problem][] = filteredProblems.map(
    (problem) => [Math.random(), problem]
  );

  const shuffledProblems = indexedProblems.sort(
    (a, b) => a[0] - b[0]
  );

  const normalizedProblems = shuffledProblems.map(
    (element) => element[1]
  );

  return {
    userName,
    preTrainingRating: null,
    postTrainingRating: null,
    problems: normalizedProblems.slice(0, 4),
    results: Array.from({ length: 4 }, () => ({ submission: null })),
    creationTimeSeconds: timify(),
    startTimeSeconds: 0,
    endTimeSeconds: 0,
  };
}

export async function fetchTrainingStatus(training: Training): Promise<Training> {
  // iterate through the submissions
  // then check if user has made those submissions
  const submissions = await fetchSubmissions(training.userName, 100);
  
  // prune the fetch to some limit (~100 or so recent submissions)
  const submissionsMap = new Map<string, Array<Submission>>();

  for (const submission of submissions) {
    if (submission.verdict !== SubmissionStatus.OK) {
      continue;
    }
    
    const key = stringify(submission.problem);
    if (!submissionsMap.has(key)) {
      submissionsMap.set(key, []);
    }

    submissionsMap.get(key)!.push(submission);
  }
  
  for (let i = 0; i < training.problems.length; i++) {
    const problem = training.problems[i];

    // check if any of them have AC
    if (submissionsMap.has(stringify(problem))) {
      training.results[i].submission = submissionsMap.get(stringify(problem))?.at(0) || null;
    }
  }

  return training;
}

export async function checkCompilationError(userName: string, problem: Problem): Promise<boolean> {
  const submissions = await fetchSubmissions(userName, 100);

  const submissionsMap = new Map<string, Array<Submission>>();
  
  for (const submission of submissions) {
    if (submission.verdict !== SubmissionStatus.COMPILATION_ERROR) {
      continue;
    }
    
    const key = stringify(submission.problem);
    if (!submissionsMap.has(key)) {
      submissionsMap.set(key, []);
    }

    submissionsMap.get(key)!.push(submission);
  }

  return submissionsMap.has(stringify(problem));
}