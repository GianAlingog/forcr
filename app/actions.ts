import { Problem, Submission, Training, Result, SubmissionStatus } from "@/lib/types"

const CODEFORCES_API = "https://codeforces.com/api/";

// TODO: move these types somewhere else
export function timify(): number {
  return 0;
}

export function stringify(problem: Problem): string {
  return `${problem.contestId}::${problem.index}`;
}

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

// modify this to take some limit amount and date
export async function fetchSubmissions(userName: string): Promise<Submission[]> {
  const METHOD = `user.status?handle=${userName}`;
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
    preTrainingRating: 1500,
    postTrainingRating: 1500,
    problems: normalizedProblems.slice(0, 4),
    results: [] as Result[],
    creationTimeSeconds: timify(),
    startTimeSeconds: 0,
    endTimeSeconds: 0,
  };
}

export async function fetchTrainingStatus(training: Training): Promise<Training> {
  // iterate through the submissions
  // then check if user has made those submissions
  const submissions = await fetchSubmissions(training.userName);
  
  // prune the fetch to some limit (~100 or so recent submissions)
  const submissionsMap = new Map<string, Array<Submission>>();

  for (const submission of submissions) {
    if (submission.verdict !== SubmissionStatus.OK) {
      continue;
    }
    
    // ensure the behavior is that it will create a new one
    submissionsMap.get(stringify(submission.problem))
      ?.push(submission);
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

  const submissions = await fetchSubmissions(userName);

  const submissionsMap = new Map<string, Array<Submission>>();
  
  for (const submission of submissions) {
    if (submission.verdict !== SubmissionStatus.COMPILATION_ERROR) {
      continue;
    }
    
    // ensure the behavior is that it will create a new one
    submissionsMap.get(stringify(submission.problem))
      ?.push(submission);
  }

  return submissionsMap.has(stringify(problem));
}