'use client'


import { useAuth, useCart } from "@/hooks";
import { LayoutDashboard, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Header() {
  const {totalItems}=useCart()
  const {isAuthenticated,isLoading,user,logout}=useAuth()
  const router=useRouter()
  const handleDashboardClick=()=>{
    if(user && user.role ==='ADMIN'){
      router.push('/admin')
    }
    else if (user && user.role ==='USER'){
      router.push('/user')
    }
  }
  const handleLogoutClick=async()=>{
    //handle logout
    await logout()
  }
  const handleLoginClick =()=>{
    //handle login
    router.push('/auth/login')
  }
  return (
    <header className="w-full bg-white border-lime-100 sticky top-0 z-10 border-b-gray-100 border-2">
        {/* container */}
      <div className='max-w-7xl mx-auto  px-10 py-2 bg-white flex justify-between items-center'>
        
       {/* logo */}
       <Link href="/" className="font-bold text-2xl text-black tracking-[0.10em] hover:opacity-80 transition-opacity cursor-pointer">SHOPI</Link>
       {/* icons */}
       <div className="flex items-center gap-[1rem] text-black">
        <Link href="/cart" className="relative p-[0.625rem] background-transparent text-black border-[1px] border-gray-500 rounded-[0.25rem] transition-opacity hover:opacity-80 transition-all duration-200 ease-in-out flex align-items-center justify-center hover:bg-white  hover:border-b-white cursor-pointer">
        <ShoppingCart size={25}/>
        {totalItems >0 && <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">{totalItems}</span>}
        </Link>
        {isAuthenticated ?(<>
        <LayoutDashboard onClick={handleDashboardClick}/>
        <button onClick={handleLogoutClick} disabled={isLoading} className="text-md md:flex hidden font-medium transition-all bg-black text-white py-2 px-6 rounded border border-transparent cursor-pointer hover:bg-white hover:text-black hover:border-black transition-colors" >Logout</button></>):(<>
        <button onClick={handleLoginClick} disabled={isLoading} className="text-md md:flex hidden font-medium transition-all bg-black text-white py-2 px-6 rounded border border-transparent cursor-pointer hover:bg-white hover:text-black hover:border-black transition-colors" >Login</button>
        </>)}
       </div>
      </div>
    </header>
  );
}