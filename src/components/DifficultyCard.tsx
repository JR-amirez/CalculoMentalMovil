import './DifficultyCard.css';

import { IonIcon, IonRange } from '@ionic/react';
import { flame, flameOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import Fire from '../../public/animations/Fire.json';

interface RangeComponentProps {
  onValueChange: (value: number) => void;
  initialValue?: number;
}

const DifficultyCard: React.FC<RangeComponentProps> = ({ initialValue=0, onValueChange }) => {
  const [value, setValue] = useState(initialValue);
  
  const getIconSize = (val: number) => {
    switch(val) {
      case 0:
        return 30;
      case 1:
        return 40;
      case 2:
        return 50;
      default:
        return 30;
    }
  };

  const getLevel= (val: number) => {
    switch(val) {
      case 0:
        return "Básico";
      case 1:
        return "Intermedio";
      case 2:
        return "Avanzado";
      default:
        return "Básico";
    }
  };

  const handleChange = (e: CustomEvent) => {
    const newValue = e.detail.value as number;
    setValue(newValue);
    onValueChange(newValue);
  };

  const iconSize = getIconSize(value);

  return (
    <div className="custom-range-container">
      <div 
        className="custom-pin"
        style={{
          left: `calc(${(value / 2) * 100}%)`,
        }}
      >
        <Lottie 
          animationData={Fire}
          loop={true}
          className="pin-icon"
          style={{  width: `${iconSize}px`, height: `${iconSize}px` }}
        />
        {/* <IonIcon 
          icon={flameOutline} 
          className="pin-icon"
          style={{ fontSize: `${iconSize}px` }}
        /> */}
        <span className="pin-value">{getLevel(value)}</span>
      </div>

      <IonRange
        aria-label="Range con ticks e ícono"
        pin={false}
        ticks={true}
        snaps={true}
        min={0}
        max={2}
        value={value}
        onIonChange={handleChange}
      />
    </div>
  );
};

export default DifficultyCard;
