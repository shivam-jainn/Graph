"use client";

import React, { useState, useRef } from 'react';
import { Card } from '../ui/card';
import { Plus, X, FileText } from 'lucide-react';
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (index: number, onClick: () => void, isToggle?: boolean) => {
    if (isToggle) {
      setToggledStates((prev) => ({
        ...prev,
        [index]: !prev[index]
      }));
    }
    onClick();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Filter for PDF files only
    const pdfFiles = Array.from(files).filter(file => file.type.includes('pdf'));
    
    if (pdfFiles.length !== files.length) {
      alert('Only PDF files are supported');
    }

    setSelectedFiles(prev => [...prev, ...pdfFiles]);
    
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitWithFiles = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pass the files to the parent component
    onSubmit(e, selectedFiles);
    
    // Clear the selected files after submission
    setSelectedFiles([]);
  };

  const featButtons = [
    {
      label: <Plus className="h-6 w-6" />,
      onClick: handleFileSelect,
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
      <form onSubmit={handleSubmitWithFiles} className='w-full'>
        <Card className="w-full flex flex-col gap-2 bg-[#303030] border-[0.1px] border-zinc-200 p-3 rounded-xl">
          {/* File badges */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md text-sm"
                >
                  <FileText size={14} />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button 
                    type="button" 
                    onClick={() => removeFile(index)}
                    className="ml-1 hover:text-red-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
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
              
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf" 
                multiple
              />
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