import React from 'react'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
import Sidebar from '@/components/home/Sidebar';
import ChatUI from '@/components/chat/ChatUI';
  
export default function page() {

  return (
    <ResizablePanelGroup className='h-screen bg-[#212121]' direction="horizontal">
    <ResizablePanel  className='max-w-sm'>
        <Sidebar />
    </ResizablePanel>
    <ResizableHandle />
    <ResizablePanel>
        <ChatUI />
    </ResizablePanel>
  </ResizablePanelGroup>
  
  )
}
