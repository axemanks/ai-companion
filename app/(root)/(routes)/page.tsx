import { Categories } from '@/components/Categories';
import { Companions } from '@/components/Companions';
import { SearchInput } from '@/components/search-input';
import prismadb from '@/lib/prismadb';
import React from 'react';

// searchParams- next13 server component for parsing URL search params
interface RootPageProps {
  searchParams: {
    categoryId: string;
    name: string;
  }
}

const RootPage = async ({
  searchParams
}: RootPageProps) => {
  // load companion data
  const data = await prismadb.companion.findMany({
    // filter by categoryId
    where: {
      categoryId: searchParams.categoryId,
      // search - @db.Text from prisma
      name: {
        search: searchParams.name
      }
    },
    orderBy: {
      createdAt: "desc", // newest first
    },
    include: {
      _count: {
        select: {
          messages: true
        }
      }
    }
  });


  const categories = await prismadb.category.findMany();
  return (
  <div 
  className='h-full p-4 space-y-2'
  >
    <SearchInput />
    <Categories data={categories}/>
    <Companions data={data}/>
    
  </div>
  )
};

export default RootPage;
