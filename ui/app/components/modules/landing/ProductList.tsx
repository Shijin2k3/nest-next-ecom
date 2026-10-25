"use client"
import { useProducts } from "@/hooks"
import { useCallback, useEffect, useState } from "react"
import ProductCard from "./ProductCard"

export default function ProductList() {
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [ debouncedSearch, setDebouncedSearch] = useState("")
    const { isLoading, products ,getProducts,error,meta} = useProducts()
    const limit=12;

    const handlePrevPage=()=>{
        if(page >1){
            setPage(page-1)
        }
    }

    const handleNextPage=()=>{
        if(meta && page < meta.totalPages){
            setPage(page+1)
        }
    }
    
    useEffect(()=>{
      getProducts({page,limit,search:debouncedSearch})
    },[getProducts,debouncedSearch,page])

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        setPage(1)
        setTimeout(() => {
            setDebouncedSearch(value)
        }, 500)
    }, [])
    return <section className="w-[100%] p-3 px-2 min-h-[60vh]">
        <div className="flex flex-col w-full justify-center m-auto ">
            <div className="flex flex-col justify-center items-center w-full mb-[2rem]">
                <h2 className="text-[1.5rem] mb-2 tracking-tight md:text-[2rem] text-black font-bold">Our Products</h2>
                <p className="text-gray-600 text-[1rem]">Check out our wide range of products</p>
            </div>

            <div className="w-full flex justify-center mb-8">
                <input className="w-[100%] max-w-[500px] text-black text-[0.875rem]  px-2 py-1 border-r-[1px] border-b-[1px] border-t-[1px] border-l-[1px] border-gray-300 rounded-md focus:outline-black"
                    type="text" value={search} onChange={handleSearchChange}
                    placeholder="Search..." />
            </div>
            {
                isLoading ? (
                    <div className="flex justify-center w-full">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex justify-center w-full">
                        {debouncedSearch ? <p>No products found for <span className="font-bold">{debouncedSearch}</span></p> : "No Products Available"}
                    </div>
                ) :
                    (<>
                    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                        {products.map((product) => (<ProductCard key={product.id} product={product}/>))}
                    </div >
                    {/* pagination */}
                    {
                        meta && meta.totalPages >=1 &&(
                            <div className="flex justify-center items-center gap-1 mt-3">
                                <button className='py-2 px-4 bg-white  border border-[#e5e5e5] rounded cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 enabled:hover:border-black disabled:opacity-50 disabled:cursor-not-allowed'onClick={handlePrevPage} disabled={page ===1}>Previous</button>
                                <span className="text-sm font-medium px-2">Page {page} of {meta.totalPages}</span>
                                <button className='py-2 px-4 bg-white border border-[#e5e5e5] rounded cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 enabled:hover:border-black disabled:opacity-50 disabled:cursor-not-allowed'onClick={handleNextPage} disabled={page >=meta.totalPages}>next</button>
                            </div>
                        )
                    }
                    </>)
            }
        </div>
    </section>
}