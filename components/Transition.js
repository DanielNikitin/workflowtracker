import { motion } from 'framer-motion';

const transitionVariants = {
  initial: {
    opacity: 1,
  },

  animate: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },

  exit: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const Transition = () => {
  return (
    <motion.div
      className='fixed top-0 bottom-0 right-0 left-0 w-screen h-screen z-20 bg-black'
      variants={transitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ pointerEvents: 'none' }}
    ></motion.div>
  );
};

export default Transition;
