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
import { Problem, Submission, fetchProblems, fetchSubmissions, generateTraining } from "@/app/actions";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";

export default function Home() {
  const [userName, setUserName] = useState<string>("tourist");
  const [problems, setProblems] = useState<Problem[]>([] as Problem[]);
  const [submissions, setSubmissions] = useState<Submission[]>([] as Submission[]);

  const getData = async () => {
    const _problems = await generateTraining(userName);
    setProblems(_problems);
  };

  // if user provides tags, we will fetch problems of only that tag
  // ^^^ filter by tags
  // eventually, filter by rating

  // accept saving the userdata

  return (
    <div>
      <Input
        placeholder="Username"
        required
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <Button onClick={getData}>
        Boop
      </Button>

      <div>
        <p>Username: {userName}</p>

        {/* {submissions ? submissions.map((submission) => (
          <p>{submission.problem.name}</p>
        )) : <div></div>} */}

        {problems ? problems.map((problem) => (
          <p>{problem.name}</p>
        )) : <div></div>}
      </div>
    </div>
  );
}
