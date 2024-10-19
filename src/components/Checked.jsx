import React from 'react'
import { useTypewriter,Cursor } from "react-simple-typewriter";
export default function Checked() {
    const [text]=useTypewriter({
        words:['UPI 2.0'],
        loop:{},
        typeSpeed:120,
        deleteSpeed:80,
      })

  return (
    <div>
      <h3 className="text-4xl sm:text-[55px]  font-bold inline  "><span className="text-[#0B8AC4]">{text}</span><span><Cursor></Cursor></span></h3>
    </div>
  )
}
