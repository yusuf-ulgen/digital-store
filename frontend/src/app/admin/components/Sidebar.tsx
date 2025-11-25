"use client";

import Link from "next/link"; 
import { usePathname, useRouter } from "next/navigation"; 
import { ShoppingCartIcon, ShoppingBagIcon, UsersIcon, ArrowLeftOnRectangleIcon, } from "@heroicons/react/24/outline"; 
import { logout } from "@/lib/auth";

const navigation = [ { name: "Orders", href: "/admin/orders", icon: ShoppingCartIcon }, 
    { name: "Products", href: "/admin/products", icon: ShoppingBagIcon }, 
    { name: "Users", href: "/admin/users", icon: UsersIcon }, ];

function classNames(...classes: string[]) { return classes.filter(Boolean).join(" "); }

export default function Sidebar() { const pathname = usePathname(); const router = useRouter();

return ( 
<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-stone-200"> 
    <div className="flex h-16 shrink-0 items-center"> <div onClick={() => router.push('/admin')} className="text-lg font-semibold text-stone-900 hover:text-stone-700 cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { router.push('/admin'); } }} >
         Admin Panel 
         </div>
          </div> <nav className="flex flex-1 flex-col"> <ul role="list" className="flex flex-1 flex-col gap-y-7"> 
            <li>
                 <ul role="list" className="-mx-2 space-y-1"> {navigation.map((item) => ( <li key={item.name}> <Link href={item.href} className={classNames( pathname.startsWith(item.href) ? "bg-stone-100 text-stone-900" : "text-stone-700 hover:text-stone-900 hover:bg-stone-50", "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold" )} >
                  <item.icon className={classNames( pathname.startsWith(item.href) ? "text-stone-900" : "text-stone-500 group-hover:text-stone-900", "h-6 w-6 shrink-0" )} aria-hidden="true" /> {item.name} </Link> </li> ))} 
                  </ul> 
            </li> 
                  <li className="mt-auto"> <a href="#" onClick={(e) => { e.preventDefault(); if (confirm('Çıkış yapmak istediğinize emin misiniz?')) { logout().then(() => { window.location.href = '/login'; }); } }} className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-stone-700 hover:bg-stone-50 hover:text-stone-900" > <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0 text-stone-500 group-hover:text-stone-900" aria-hidden="true" /> 
                  Çıkış Yap 
                </a> 
            </li> 
        </ul> 
    </nav> 
</div> ); }