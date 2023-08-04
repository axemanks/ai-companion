This is the ai-companion app where you can buld custom AI personalitys to chat with.

Orignial credits to: https://www.youtube.com/watch?v=PjYWpd7xkaM

NextJS
Clerk for auth

Dark Mode - next-themes - provider - https://ui.shadcn.com/docs/dark-mode

Pinecone and Redis for memory and vector embeddings

Memory Manger - lib/memory
Class to handle the chat memory

If you need to reset the database:
npx prisma migrate reset - this will delete everything
npx prisma generate
npx prisma db push
npm run seed
