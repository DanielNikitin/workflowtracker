// next image
import Image from 'next/image';

// next link
import Link from 'next/link';

// components
import Socials from '../components/Socials';

const Header = () => {
  return (
    <header className='absolute z-30 w-full flex items-center px-16 xl:px-0 xl:h-[120px]'>
      <div className='container xl:mx-auto sm:mx-auto'>
        <div className='flex flex-col lg:flex-row justify-between items-center gap-y-2
        py-8 z-0'>

          {/* logo */}
          <Link href={'/'}>
            <Image
              src={'/dcg_logo.png'}
              width={65}
              height={65}
              alt=''
              priority={true}
            />
          </Link>
          
          {/* socials */}
          <Socials />

        </div>
      </div>
    </header>
  );
};

export default Header;
