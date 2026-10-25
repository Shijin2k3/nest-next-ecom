import Link from "next/link";

export default function Footer() {
    return (
        <footer className="flex justify-center  p-6 text-sm text-white bg-black">
           <div className="flex flex-col items-center justify-center w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">STORE FRONT</h3>
                   <p className="text-gray-400">Your store destination for quality products & we create finest shopping experience </p>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-medium">Shop</h4>
                     <ul>
                        <li>
                            <Link href="/products">All Products</Link>
                        </li>
                        <li>
                            <Link href="/">Categories</Link>
                        </li>
                        <li>
                            <Link href="/">New Arrivals</Link>
                        </li>
                        <li>
                            <Link href="/">Deals</Link>
                        </li>
                     </ul>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-medium">Support</h4>
                     <ul>
                        <li>
                            <Link href="/products">Help Center</Link>
                        </li>
                        <li>
                            <Link href="/">Contact Us</Link>
                        </li>
                        <li>
                            <Link href="/">Shipping & Returns</Link>
                        </li>
                        <li>
                            <Link href="/">Returns Policy</Link>
                        </li>
                   
                     </ul>
                </div>
                <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-medium">Company</h4>
                     <ul>
                        <li>
                            <Link href="/products">About Us</Link>
                        </li>
                        <li>
                            <Link href="/">Careers</Link>
                        </li>
                        <li>
                            <Link href="/">Privacy Policy</Link>
                        </li>
                        <li>
                            <Link href="/">Terms of Service</Link>
                        </li>
                     </ul>
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">Follow Us</h3>
                    <div className="flex gap-2">
                        <a href="#" className="text-gray-400">Facebook</a>
                        <a href="#" className="text-gray-400">Twitter</a>
                        <a href="#" className="text-gray-400">Instagram</a>
                    </div>
                </div>
            </div>
           
           </div>
        </footer>
    );
}