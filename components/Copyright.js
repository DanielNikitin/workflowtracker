import React from 'react';

const Copyright = () => {
  return (
    <>
      {/* sm */}
      <div className='sm:absolute sm:opacity-80 sm:bottom-4 w-full text-center sm:py-14 text-xs sm:block sm2:hidden lg:hidden md:hidden xl:hidden'>
      COPYRIGHT © 2024. DAILY CUSTOMS GARAGE ALL RIGHTS RESERVED
      </div>

      {/* sm 2 */}
      <div className='sm2:absolute sm2:opacity-80 sm2:bottom-4 w-full text-center py-14 text-xs sm2:block sm:hidden lg:hidden md:hidden xl:hidden'>
      COPYRIGHT © 2024. DAILY CUSTOMS GARAGE ALL RIGHTS RESERVED
      </div>

      {/* md */}
      <div className='md:absolute md:opacity-80 md:-bottom-2 w-full text-center py-20 text-xs md:block sm:hidden sm2:hidden lg:hidden xl:hidden'>
      COPYRIGHT © 2024. DAILY CUSTOMS GARAGE ALL RIGHTS RESERVED
      </div>

      {/* lg */}
      <div className='lg:absolute lg:opacity-80 lg:-bottom-2 w-full text-center py-20 text-xs lg:block sm:hidden sm2:hidden md:hidden xl:hidden'>
      COPYRIGHT © 2024. DAILY CUSTOMS GARAGE ALL RIGHTS RESERVED
      </div>
    </>
  );
};

export default Copyright;
