// layout for the root
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/SideBar';
import { checkSubscription } from '@/lib/subscription';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const RootLayout = async ({ children }: Props) => {
  const isPro = await checkSubscription();


  return (
    <div className='h-full'>
        <Navbar isPro={isPro} />
        <div className='hidden md:flex mt-16 w-20 flex-col fixed inset-y-0'>
          <Sidebar isPro={isPro} />
        </div>
      <main className='md:pl-20 pt-16 h-full'>
        {children}
        </main>
    </div>
  );
};

export default RootLayout;
