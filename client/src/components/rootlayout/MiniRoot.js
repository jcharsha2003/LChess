import React from 'react'
import RootLayout from './RootLayout'
import { MyProSidebarProvider } from '../Sidebar/sidebarContext' 

const MiniRoot = () => {
  return (
    <div><MyProSidebarProvider><RootLayout/></MyProSidebarProvider></div>
  )
}

export default MiniRoot