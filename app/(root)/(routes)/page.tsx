import { SearchInput } from '@/components/search-input';
import React from 'react';

type Props = {};

const RootPage = (props: Props) => {
  return (
  <div 
  className='h-full p-4 space-y-2'
  >
    <SearchInput />
    
  </div>
  )
};

export default RootPage;
