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
import { fetchProblems, fetchSubmissions, generateTraining, stringify } from "@/app/actions";
import { Problem, Submission, Training } from "@/lib/types"
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

function TrainingPage({ training }: { training: Training }) {
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
    </div>
  );
}