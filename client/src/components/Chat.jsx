import React, { useState, useEffect, useRef } from 'react'
import { UserContext } from '../context/UserContext'
import axios from 'axios'
import Logo from './Logo'
import Contact from './Contact'

const Chat = () => {
  return (
    <div className='flex h-screen'>
      <div className='flex flex-col w-1/3 bg-base-200'>
        <div className='flex-grow '>
          <Logo />
          <Contact username={"niti"} id={"65841cd535f270799e789054"} online={true} selected={true}/>
          <Contact username={"niti1"} id={"65a8defd62d1c35b089bb9c1"} online={false} selected={false}/>
        </div>
        <div className='p-2 text-center flex items-center justify-center'>
          <span className='mr-2 text-sm text-gray-600 flex items-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Username
          </span>
          <button className='btn btn-ghost text-sm '>
            Logout
          </button>
        </div>
      </div>
      <div className='bg-base-300 flex flex-col w-2/3 p-2'>
        <div className="flex-grow">
          <div className='flex h-full flex-grow items-center justify-center'>
            <div className='text-gray-600'>
              &larr; Select a person from sidebar
            </div>
          </div>
        </div>
        <form className='px-8 flex items-center justify-center space-x-2'>
          <input type="text" placeholder="Type here massge" className="input input-bordered w-full " />
          <label htmlFor="" className='bg-blue-200 p-3 text-gray-600 cursor-pointer rounded-sm border-blue-200'>
            <input type="file" className='hidden' />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
            </svg>
          </label>
          <button type="submit" className='bg-blue-500 p-3 text-white rounded-sm'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>

  )
}

export default Chat