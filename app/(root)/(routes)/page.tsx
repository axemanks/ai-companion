import { UserButton } from '@clerk/nextjs'
import React from 'react'

type Props = {}

const RootPage = (props: Props) => {
  return (
    <div>
      <UserButton afterSignOutUrl='/'/>
    </div>
  )
}

export default RootPage