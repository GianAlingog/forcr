"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input";
import { checkCompilationError, fetchProblems, fetchUserInfo, fetchTrainingStatus, generateIdentifyProblem, generateTraining, stringify } from "@/app/actions";
import { fetchUserName, storeUserName, fetchUserRating, storeUserRating } from "@/app/utils";
import { Problem, Submission, SubmissionStatus, Training } from "@/lib/types"
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import Link from "next/link"

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null);
  const [training, setTraining] = useState<Training | null>(null);

  const getUserName = () => {
    setUserName(fetchUserName());
  };

  useEffect(() => {
    getUserName();
  }, []);
  
  // if user provides tags, we will fetch problems of only that tag
  // ^^^ filter by tags
  // eventually, filter by rating

  // accept saving the userdata

  return userName === null
    ? <IdentifyPage getUserName={getUserName} />
    : <TrainingPage userName={userName} training={training} setTraining={setTraining} />;
}

type IdentifyPageProps = {
  getUserName: () => void;
};

function IdentifyPage({ getUserName }: IdentifyPageProps) {
  const [userName, setUserName] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [identifyProblem, setIdentifyProblem] = useState<Problem | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const getIdentifyProblem = async () => {
    const _identifyProblem = await generateIdentifyProblem();
    setIdentifyProblem(_identifyProblem);
    setIsIdentifying(true);
    setTimeRemaining(60);
  };

  const checkIdentifyProblem = async () => {
    const _success = await checkCompilationError(userName, identifyProblem!);
    if (_success) {
      storeUserName(userName);
      getUserName();
    } else {
      setIsFailed(true);
    }
  };

  useEffect(() => {
    if (!isIdentifying) {
      return;
    }

    if (timeRemaining <= 0) {
      checkIdentifyProblem();
      return;
    }

    const id = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isIdentifying, timeRemaining, checkIdentifyProblem]);

  const resetIdentify = () => {
    setIdentifyProblem(null);
    setIsFailed(false);
    setIsIdentifying(false);
  };

  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <Input
          placeholder="Username"
          required
          value={userName ?? ""}
          onChange={(e) => setUserName(e.target.value)}
          disabled={isIdentifying}
        />

        { isIdentifying
          ? isFailed
            ? <Button onClick={resetIdentify}>Retry</Button>
            : null
          : <Button onClick={getIdentifyProblem}>Verify</Button>
        }

        { isIdentifying
          ? isFailed
            ? <p>You failed to submit a compilation error within the alloted time.</p>
            : (
              <>
                <p>Submit a compilation error to the following problem:</p>

                <Link
                  href={`https://codeforces.com/problemset/problem/${identifyProblem!.contestId}/${identifyProblem!.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {identifyProblem!.name} - {identifyProblem!.rating}
                </Link>

                <p>Your submission will be checked in {timeRemaining} seconds.</p>
              </>
            )
          : null
        }
      </div>
    </div>
  );
}

function formatTime(timeInSeconds: number): string {
  const seconds = timeInSeconds % 60;
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const hours = Math.floor(timeInSeconds / 3600);

  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

type TrainingPageProps = {
  userName: string;
  training: Training | null;
  setTraining: Dispatch<SetStateAction<Training | null>>;
};

function TrainingPage({ userName, training, setTraining }: TrainingPageProps) {
  const [userRating, setUserRating] = useState<number | null>(null);

  const getRating = async () => {
    let _userRating = fetchUserRating();

    if (_userRating === null) {
      const _userInfo = await fetchUserInfo(userName);
      if (_userInfo === null || _userInfo.rating == null) {
        _userRating = 1500;
      } else {
        _userRating = _userInfo.rating;
      }
    }

    if (_userRating == null) {
      _userRating = 1500;
    }

    storeUserRating(_userRating);
    setUserRating(_userRating);
  };

  useEffect(() => {
    getRating();
  }, []);

  const getTraining = async () => {
    let _training = await generateTraining(userName);
    
    _training.preTrainingRating = userRating;

    setTraining(_training);
  };

  return (
    <div className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <Button onClick={getTraining}>
          Fetch
        </Button>

        <p>Username: {userName}, Rating: {userRating}</p>

        { training
          ? <TrainingDojo training={training} setTraining={setTraining} />
          : null
        }
      </div>
    </div>
  );
}

type TrainingDojoProps = {
  training: Training;
  setTraining: Dispatch<SetStateAction<Training | null>>;
};

function TrainingDojo({ training, setTraining }: TrainingDojoProps) {
  // TODO: lift state up to parent for the dynamic layout loading
  const [isTraining, setIsTraining] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [endTimeSeconds, setEndTimeSeconds] = useState<number | null>(null);

  const startTraining = () => {
    const duration = 2 * 60 * 60; // in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = currentTime + duration;

    setEndTimeSeconds(endTime);
    setTimeRemaining(duration);
    setIsTraining(true);

    setTraining((prev) => prev ? { ...prev, startTimeSeconds: currentTime} : prev);
  };

  const endTraining = () => {
    const currentTime = Math.floor(Date.now() / 1000);

    setEndTimeSeconds(null);
    setTimeRemaining(0);
    setIsTraining(false);

    // TODO: calculate user rating change

    setTraining((prev) => prev ? { ...prev, endTimeSeconds: currentTime} : prev);
  };

  useEffect(() => {
    if (!isTraining || endTimeSeconds === null) {
      return;
    }

    const id = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, endTimeSeconds - currentTime);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(id);
        endTraining();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [isTraining, endTimeSeconds]);

  const getStatus = async () => {
    // double check that this is safe behavior
    const updatedTraining = await fetchTrainingStatus(training);

    // now go through all and update the screen if solved
    // stub: just console log
    for (const result of updatedTraining.results) {
      if (result.submission !== null && result.submission.verdict === SubmissionStatus.OK) {
        console.log(`User ${updatedTraining.userName} has AC on: ${stringify(result.submission.problem)}`);
      }
    }

    setTraining(updatedTraining);
  };

  return (
    <div className="space-y-2">
      {training.problems.map((problem) => (
        <p key={stringify(problem)}>
          <Link
            href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            {problem.name} - {problem.rating}
          </Link>
        </p>
      ))}

      {isTraining ? (
        <>
          <div>{formatTime(timeRemaining)}</div>

          {/* TODO: ask confirmation from the user to end the training */}
          <Button onClick={endTraining}>
            End
          </Button>

          <Button onClick={getStatus}>
            Refresh
          </Button>
        </>
      ) : (
        <Button onClick={startTraining}>
          Start
        </Button>
      )}
    </div>
  );
}