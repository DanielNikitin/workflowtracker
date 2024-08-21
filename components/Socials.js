// links
import Link from 'next/link';

// icons
import {
  RiTelegramLine,
  RiInstagramLine,
} from 'react-icons/ri';

const Socials = () => {
  return (
    <div className='flex items-center gap-x-5 text-3xl'>
      <Link href={'https://instagram.com/dcg_tallinn'} className='xl:hover:text-accent sm:hover:text-teal-400 transition-all duration-300'>
        <RiInstagramLine />
      </Link>
      <Link href={'https://t.me/dcg_tallinn'} className='xl:hover:text-accent sm:hover:text-teal-400 transition-all duration-300'>
        <RiTelegramLine />
      </Link>
    </div>
  );
};

export default Socials;
