// this will handle the layout of the clerk auth sign-up and sign-in pages

const AuthLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="flex justify-center items-center h-full">
      {children}
    </div>
   );
}
 
export default AuthLayout;