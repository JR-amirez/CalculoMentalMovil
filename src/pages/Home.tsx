import { IonButton, IonContent, IonHeader, IonPage, IonText, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import DifficultyCard from '../components/DifficultyCard';
import './Home.css';
import { useEffect, useState } from 'react';
import SpeedCard from '../components/SpeedCard';
import NumberCard from '../components/NumberCard';
import Play from './Play';

const Home: React.FC = () => {
  const [rangeValue, setRangeValue] = useState<number>(0);
  const [speedAnimationValue, setSpeedAnimationValue] = useState<number>(1);
  const [speedValue, setSpeedValue] = useState<number>(1);
  // const [numExercises, setNumExercises] = useState<number>(5);
  const [selectedNumber, setSelectedNumber] = useState<number>(0);
  const [dataToSend, setDataToSend] = useState<{}>({
    difficulty: 0,
    speed: 500,
    numExercises: 1
  });

  const [resetKey, setResetKey] = useState(0);

  const handleRangeChange = (value: number) => {
    setRangeValue(value);

    switch(value) {
      case 0:
        setSpeedAnimationValue(1)
        setSpeedValue(700)
        break;
      case 1:
        setSpeedAnimationValue(1.5)
        setSpeedValue(550)
        break;
      case 2:
        setSpeedAnimationValue(2)
        setSpeedValue(400)
        break;
      default:
        setSpeedAnimationValue(1)
        setSpeedValue(700)
        break;
    }
  };

  useEffect(() => {
    setDataToSend({
      difficulty: rangeValue,
      speed: speedValue,
      numExercises: selectedNumber
    });
  }, [rangeValue, speedValue, selectedNumber]);

  const clearData = () => {
    setRangeValue(0)
    setSpeedAnimationValue(1)
    setSpeedValue(500)
    setSelectedNumber(1)

    setDataToSend({
      difficulty: 0,
      speed: 500,
      numExercises: 1
    })
  };

  useIonViewWillEnter(() => {
    setResetKey(prev => prev + 1); 
    clearData();
  });

  return (
    <IonPage>
      <IonHeader translucent={true} className="ion-no-border">
        <IonToolbar>
          <IonTitle>Cálculo Mental</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="difficulty-level">
          <div className="label">
            <IonText className="text-zoom">
              <h5>Nivel de dificultad</h5>
            </IonText>
          </div>
          <div className="options">
              <DifficultyCard
                key={resetKey}
                onValueChange={handleRangeChange}
              />
              {/* <IonNote>Ejercicios disponibles: {numExercises}</IonNote> */}
          </div>
        </div>
        <div className="num-exercises">
          <div className="label">
            <IonText className="text-zoom">
              <h5>Número de ejercicios a realizar</h5>
            </IonText>
          </div>
          <div className="animation">
            {[1, 2, 3, 4, 5].map((num) => (
              <NumberCard 
                key={num}
                num={num}
                selectedNumber={selectedNumber}
                onSelect={setSelectedNumber}
              />
            ))}
          </div>
        </div>
        <div className="speed">
          <SpeedCard 
            propSpeed={speedAnimationValue}
          />
        </div>
        <div className="button-opt">
            <IonButton
              shape="round"
              expand="full"
              routerLink={`/play/${encodeURIComponent(JSON.stringify(dataToSend))}`}
            >Comenzar Juego</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
