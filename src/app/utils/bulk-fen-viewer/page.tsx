"use client";

// React
import React from "react";
import { useState } from "react";

// React hook form
import { useForm } from "react-hook-form";

// Components
import { Chessboard } from "@/components/Chessboard";

type FormValues = {
  fens: string;
};

export default function Page() {
  const [index, setIndex] = useState<number | undefined>();
  const [fenList, setPgnList] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = ({ fens }: FormValues) => {
    const newPgnList = fens.split("\n");
    if (newPgnList.length > 0) {
      setIndex(0);
      setPgnList(newPgnList);
    }
  };

  const gotoPrevious = () => {
    if (index !== undefined && index > fenList.length - 1) {
      setIndex(index - 1);
    }
  };

  const gotoNext = () => {
    if (index !== undefined && index < fenList.length - 1) {
      setIndex(index + 1);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-2">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-start gap-2"
        >
          <textarea
            {...register("fens", { required: true })}
            className="text-black"
          />
          {errors.fens && <span>This field is required</span>}
          <button
            type="submit"
            className="rounded-sm bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-700"
          >
            Submit
          </button>
        </form>
        {index !== undefined && <Chessboard fen={fenList[index]} />}
        {fenList.length > 1 && (
          <div className="flex flex-col gap-2">
            <button onClick={gotoPrevious}>Previous</button>
            <button onClick={gotoNext}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
