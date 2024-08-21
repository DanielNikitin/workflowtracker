export const fadeIn = (direction, delay) => {
  return {
    hidden: {
      y: direction === 'up' ? 80 : direction === 'down' ? -80 : 0,
      opacity: 0,
      x: direction === 'left' ? 80 : direction === 'right' ? -80 : 0,
      transition: {
        type: 'tween',
        duration: 1.5,
        delay: delay,
        ease: [0.25, 0.6, 0.3, 0.8],
      },
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        duration: 1.4,
        delay: delay,
        ease: [0.25, 0.25, 0.25, 0.75],
      },
    },
  };
};

export const opacityPuls = (delay) => {
  return {
    hidden: {
      opacity: 0,
      transition: {
        type: 'tween',
        duration: 2,
        delay: delay,
      },
    },
    show: {
      opacity: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        delay: delay,
      },
    },
  };
};

export const neonGlow = (delay) => {
  return {
    hidden: {
      opacity: 0,
      textShadow: '0px 0px 2px #fff, 0px 0px 10px #fff, 0px 0px 20px #fff, 0px 0px 40px #0ff',
      color: 'transparent',
      transition: {
        type: 'spring',
        stiffness: 1000,
        damping: 500,
        delay: delay,
      },
    },
    show: {
      opacity: 1,
      textShadow: '0px 0px 2px #fff, 0px 0px 10px #fff, 0px 0px 20px #fff, 0px 0px 40px #0ff',
      color: '#00ffff',
      transition: {
        type: 'spring',
        stiffness: 1000,
        damping: 500,
        delay: delay,
        repeat: Infinity,
      },
    },
  };
};

export const opacity = {
    hidden: {
      opacity: 0,
      transition: {
        type: 'tween',
        duration: 2,
      },
    },
    show: {
      opacity: [0, 1],
      transition: {
        duration: 2,
      },
    },
  };