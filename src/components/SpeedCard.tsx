import './SpeedCard.css';

import { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import GTSchool from '../../public/animations/GO TO SCHOOL ANIMATION.json';

interface SpeedComponentProps {
  propSpeed: number
}

const SpeedCard: React.FC<SpeedComponentProps> = ({ propSpeed }) => {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(propSpeed);
    }
  }, [propSpeed]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={GTSchool}
      loop={true}
      className="pin-icon"
      style={{ width: '250px', height: '250px' }}
    />
  );
};

export default SpeedCard;
