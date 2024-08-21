// nav.js

// icons
import { HiHome, } from 'react-icons/hi2';
import { MdOutlineSpaceDashboard } from "react-icons/md";

import Copyright from '../components/Copyright';

// nav data
export const navData = [
  { name: 'HOME', path: '/', icon: <HiHome /> },
  { name: 'DASHBOARD', path: '/dashboard', icon: <MdOutlineSpaceDashboard /> },
];

// next link
import Link from 'next/link';

// next router
import { useRouter } from 'next/router';

const Nav = () => {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <nav className='flex flex-col items-center xl:justify-center gap-y-4 fixed h-max
    bottom-0 mt-auto xl:right-[2%] z-50 top-0 w-full xl:w-16 xl:max-w-md xl:h-screen'>

      <Copyright />

      {/* inner */}
      <div className='flex w-full xl:flex-col items-center justify-between
      xl:justify-center gap-y-10 px-4 md:px-40 xl:px-0 h-[20px] xl:h-max py-8 
      bg-white/10
      backdrop-blur-sm text-3xl xl:text-xl xl:rounded-full
      outline shadow-lg xl:outline-red-400/15 xl:shadow-orange-400/50 xl:animate-shadow-pulse
      sm:outline-teal-400/25'>
        {navData.map((link, index) => {
          return (
          <Link
          className={`${link.path === pathname ? 'text-accent' : (link.path === '/ecology' ? 'text-teal' : '')}
          relative flex items-center group xl:hover:text-accent transition-all
          duration-300`} 
          href={link.path}
          key={index}
          >
            {/* hiden category name's */}
            <div className='absolute pr-12 right-0 hidden xl:group-hover:flex'>
              <div className='bg-white/50 relative flex text-primary items-center
              p-[5px] rounded-[5px]'>
                <div className='text-[14px] leading-none font-bold whitespace-nowrap'>
                  {link.name}</div>
              </div>
            </div>
            {/* icons */}
            <div>{link.icon}</div>
          </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Nav;
