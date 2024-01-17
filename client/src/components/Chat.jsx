import React from 'react'

const Chat = () => {
  return (
    <div className='grid grid-cols-2'>
      <div className='bg-base-200'>

      </div>
      <div className='bg-base-300 h-[100vh] grid grid-row-2'>
        <div>
          <div className="chat chat-start">
            <div className="chat-bubble">It's over Anakin, <br />I have the high ground.</div>
          </div>
          <div className="chat chat-end">
            <div className="chat-bubble">You underestimate my power!</div>
          </div>
        </div>
        <div className='px-8 flex '>
          <input type="text" placeholder="Type here" className="input input-bordered w-full " />
        </div>
      </div>
    </div>

  )
}

export default Chat