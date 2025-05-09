"use client";

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Plus } from 'lucide-react';
import { BiWorld } from 'react-icons/bi';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

type ChatInputProps = {
  input: string;
  onInputChange: any;
  onSubmit: any;
};

export default function ChatInput({
  input,
  onInputChange,
  onSubmit
}: ChatInputProps) {
  const [toggledStates, setToggledStates] = useState<{ [key: number]: boolean }>({});

  const handleToggle = (index: number, onClick: () => void, isToggle?: boolean) => {
    if (isToggle) {
      setToggledStates((prev) => ({
        ...prev,
        [index]: !prev[index]
      }));
    }
    onClick();
  };

  const featButtons = [
    {
      label: <Plus className="h-6 w-6" />,
      onClick: () => {
        console.log('plus');
      },
      isToggle: false
    },
    {
      label: <BiWorld className="h-6 w-6" />,
      onClick: () => {
        console.log('world');
      },
      isToggle: true
    }
  ];

  return (
    <div className='flex w-full p-8 justify-between items-center h-[20%]'>

    <form onSubmit={onSubmit} className='w-full'>
    <Card className="w-full flex flex-col gap-2 bg-[#303030] border-[0.1px] border-zinc-200 p-3 rounded-xl">
            <Textarea
          placeholder="Declutter your brain"
          className="bg-[#303030] text-white placeholder:text-zinc-400 border-none shadow-none resize-none focus-visible:ring-0 focus-visible:outline-none"
          value={input}
          onChange={onInputChange}
          draggable={false}
        />

        <div className="flex justify-between items-center">
          <div className="flex flex-row gap-2 justify-start" id="ftbtns">
            {featButtons.map((btn, index) => {
              const isToggled = toggledStates[index];
              const toggledClass = isToggled
                ? 'bg-[#19416A] text-[#46A3F5]'
                : 'bg-white text-black hover:bg-gray-100';

              return (
                <Button
                  key={index}
                  type="button"
                  className={`rounded-full p-2 transition-colors ${toggledClass}`}
                  onClick={() => handleToggle(index, btn.onClick, btn.isToggle)}
                >
                  {btn.label}
                </Button>
              );
            })}
          </div>

          <Button type="submit">
            Send
          </Button>
        </div>
      </Card>
    </form>
    </div>
  );
}
