// this will handle the layout of the clerk auth sign-up and sign-in pages

import React from 'react'

type Props = {
    children: React.ReactNode
}

const AuthLayout = ({children}: Props) => {
  return (
    <div className='flex items-center justify-center h-4'>{children}</div>
  )
}

export default AuthLayout