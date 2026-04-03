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
import { fetchProblems, fetchSubmissions, fetchTrainingStatus, generateTraining, stringify } from "@/app/actions";
import { Problem, Submission, SubmissionStatus, Training } from "@/lib/types"
import { useState, useEffect } from "react";
import Link from "next/link"

export default function Home() {
  const [userName, setUserName] = useState<string>("tourist");
  // const [problems, setProblems] = useState<Problem[]>([] as Problem[]);
  const [training, setTraining] = useState<Training | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([] as Submission[]);

  const getTraining = async () => {
    const _training = await generateTraining(userName);
    setTraining(_training);
  };

  // if user provides tags, we will fetch problems of only that tag
  // ^^^ filter by tags
  // eventually, filter by rating

  // accept saving the userdata

  return (
    <main className="min-h-svh flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <Input
          placeholder="Username"
          required
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />

        <Button onClick={getTraining}>
          Boop
        </Button>

        <p>Username: {userName}</p>

        {training ? (
          <TrainingPage training={training} />
        ) : null}
      </div>
    </main>
  );
}

function formatTime(timeInSeconds: number): string {
  const seconds = timeInSeconds % 60;
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const hours = Math.floor(timeInSeconds / 3600);

  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function TrainingPage({ training }: { training: Training }) {
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

    training.startTimeSeconds = currentTime;
  };

  const endTraining = () => {
    const currentTime = Math.floor(Date.now() / 1000);

    setEndTimeSeconds(null);
    setTimeRemaining(0);
    setIsTraining(false);

    training.endTimeSeconds = currentTime;
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
    training = await fetchTrainingStatus(training);

    // now go through all and update the screen if solved
    // stub: just console log
    for (const result of training.results) {
      if (result.submission !== null && result.submission.verdict === SubmissionStatus.OK) {
        console.log(`User ${training.userName} has AC on: ${stringify(result.submission.problem)}`);
      }
    }
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