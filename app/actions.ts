const CODEFORCES_API = "https://codeforces.com/api/";

// TODO: move these types somewhere else
export enum ProblemType {
  PROGRAMMING = "PROGRAMMING",
  QUESTION = "QUESTION",
};

export type Problem = {
  contestId: number,
  index: string,
  name: string,
  type: ProblemType,
  points: number,
  rating: number | 0,
  tags: string[],
};

export type Member = {
  handle: string,
  name: string,
};

export enum ParticipantType {
  CONTESTANT = "CONTESTANT",
  PRACTICE = "PRACTICE",
  VIRTUAL = "VIRTUAL",
  MANAGER = "MANAGER",
  OUT_OF_COMPETITION = "OUT_OF_COMPETITION",
};

export type Party = {
  contestId: number,
  members: Member[],
  participantType: ParticipantType,
  teamId: number,
  teamName: string,
  ghost: boolean,
  room: number,
  startTimeSeconds: number,
};

export enum SubmissionStatus {
  FAILED = "FAILED",
  OK = "OK",
  PARTIAL = "PARTIAL",
  COMPILATION_ERROR = "COMPILATION_ERROR",
  RUNTIME_ERROR = "RUNTIME_ERROR",
  WRONG_ANSWER = "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
  MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED",
  IDLENESS_LIMIT_EXCEEDED = "IDLENESS_LIMIT_EXCEEDED",
  SECURITY_VIOLATED = "SECURITY_VIOLATED",
  CRASHED = "CRASHED",
  INPUT_PREPARATION_CRASHED = "INPUT_PREPARATION_CRASHED",
  CHALLENGED = "CHALLENGED",
  SKIPPED = "SKIPPED",
  TESTING = "TESTING",
  REJECTED = "REJECTED",
  SUBMITTED = "SUBMITTED",
};

export enum TestSet {
  SAMPLES = "SAMPLES",
  PRETESTS = "PRETESTS",
  TESTS = "TESTS",
  CHALLENGES = "CHALLENGES",
  TESTS1 = "TESTS1",
  TESTS2 = "TESTS2",
  TESTS3 = "TESTS3",
  TESTS4 = "TESTS4",
  TESTS5 = "TESTS5",
  TESTS6 = "TESTS6",
  TESTS7 = "TESTS7",
  TESTS8 = "TESTS8",
  TESTS9 = "TESTS9",
  TESTS10 = "TESTS10",
};

export type Submission = {
  id: number,
  contestId: number,
  creationTimeSeconds: number,
  relativeTimeSeconds: number,
  problem: Problem,
  author: Party,
  programmingLanguage: string,
  verdict: SubmissionStatus,
  testset: TestSet,
  passedTestCount: number,
  timeConsumedMillis: number,
  memoryConsumedBytes: number,
  points: number,
};

export async function fetchProblems(): Promise<Problem[]> {
  const METHOD = `problemset.problems`;
  const DESTINATION = CODEFORCES_API + METHOD;

  const response = await fetch(DESTINATION).then((response) => response.json());
  const result = response["result"];
  const problems = result["problems"];

  return problems;
}

export async function fetchData(userName: string): Promise<Submission[]> {
  const METHOD = `user.status?handle=${userName}`;
  const DESTINATION = CODEFORCES_API + METHOD;

  const response = await fetch(DESTINATION).then((response) => response.json());
  const result = response["result"];

  return result;
}