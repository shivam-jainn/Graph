"use client";
import React, { useState, useEffect } from 'react'
import getChats from '@/lib/actions/getChats';
import AccountSelector from '../auth/AccountSelector';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
    const router = useRouter();
    const [chatSessions, setChatSessions] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/api/chatsessions`, {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            })
            const data = await response.json()
            console.log(data)
            setChatSessions(data)
        }
    
        fetchData()
    }, [])
    
    return (
        <div className='text-white flex flex-col py-4 px-2 gap-3 h-full'>
            <Link href="/" className='w-full'>
                <Button className='p-4 bg-white font-bold hover:text-[#E6E050] text-black rounded-md w-full'>
                    <img src="/lifegivesyoulemon.png" width={32} />
                    New Chat
                </Button>
            </Link>

            {/* Chat sessions list */}
            <div className='flex-1'>  {/* Add flex-1 to take up remaining space */}
                {chatSessions.map((chatSession) => (
                    <Link href={`/chat/${chatSession.id}`} key={chatSession.id} className='w-full'>
                        <Button variant={"ghost"} className='w-full'>
                            {chatSession.title}
                        </Button>
                    </Link>
                ))}
            </div>

            {/* Account selector at bottom */}
            <div className='mt-auto w-full '>  {/* mt-auto pushes this to the bottom */}
                <AccountSelector />
            </div>
        </div>
    )
}