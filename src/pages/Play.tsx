import {
    IonButton,
    IonCard,
    IonContent,
    IonHeader,
    IonIcon,
    IonNote,
    IonPage,
    IonPopover,
    IonText,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import "./Play.css";
import { useEffect, useState } from "react";
import exercisesBasic from '../../public/exercises/exercises_basic.json';
import exercisesIntermediate from '../../public/exercises/exercises_intermediate.json';
import exercisesAdvanced from '../../public/exercises/exercises_advanced.json';
import GaugeComponent from 'react-gauge-component';
import { alertCircleOutline, closeCircleOutline } from 'ionicons/icons';

type Difficulty = 'basic' | 'intermediate' | 'advanced';
type NumExercises = 1 | 2 | 3 | 4 | 5;

export interface PlayProps {
    difficulty: Difficulty;
    numExercises: NumExercises;
}

const Play: React.FC<PlayProps> = ({ difficulty, numExercises }) => {
    const [exercises, setExercises] = useState < any[] > ([]);
    const [speed, setSpeed] = useState < number > (1000);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState < number > (0);
    const [currentExercise, setCurrentExercise] = useState < any > (null);
    const [operationParts, setOperationParts] = useState < string[] > ([]);
    const [currentPartIndex, setCurrentPartIndex] = useState < number > (0);
    const [displayText, setDisplayText] = useState < string > ('');
    const [isAnimating, setIsAnimating] = useState < boolean > (false);
    const [showOptions, setShowOptions] = useState < boolean > (false);
    const [score, setScore] = useState < number > (0);
    const [maxScore, setMaxScore] = useState < number > (0);
    const [activeButtonIndex, setActiveButtonIndex] = useState < number | null > (null);
    const [activeButtonStyle, setActiveButtonStyle] = useState < string > ('');
    const [isComplete, setisComplete] = useState < boolean > (true);
    const [countdown, setCountdown] = useState < number > (3);
    const [showCountdown, setShowCountdown] = useState < boolean > (true);
    const [feedbackMessage, setFeedbackMessage] = useState < string | null > (null);
    const [showFeedback, setShowFeedback] = useState < boolean > (false);
    const [showSummary, setShowSummary] = useState < boolean > (false);
    const [showInstructions, setShowInstructions] = useState < boolean > (false);
    const [reroll, setReroll] = useState < number > (0);

    const POINTS_PER_CORRECT = 10;

    const correctMessages = [
        "¡Excelente! 🎯",
        "¡Muy bien hecho! 💪",
        "¡Perfecto! 🌟",
        "¡Súper respuesta! 🚀",
        "¡Buen trabajo! 😎"
    ];

    const incorrectMessages = [
        "¡Ups! ❌",
        "Sigue intentando 💪",
        "Casi lo logras 😅",
        "No te rindas 🔁",
        "Intenta de nuevo 👊"
    ];

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const sampleArray = <T,>(array: T[], max = 5): T[] => {
        const shuffled = shuffleArray(array);
        return shuffled.slice(0, Math.min(max, shuffled.length));
    };

    const resetGame = () => {
        setCurrentExerciseIndex(0);
        setCurrentExercise(null);
        setOperationParts([]);
        setCurrentPartIndex(0);
        setDisplayText('');
        setIsAnimating(false);
        setShowOptions(false);
        setActiveButtonIndex(null);
        setActiveButtonStyle('');
        setScore(0);
        setisComplete(true);

        setCountdown(3);
        setShowCountdown(true);

        setShowSummary(false);

        // NUEVO: fuerza un nuevo muestreo aleatorio
        setReroll(prev => prev + 1);
    };

    useEffect(() => {
        let selectedExercises: any[] = [];

        switch (difficulty) {
            case 'basic':
                selectedExercises = exercisesBasic as any[];
                setSpeed(1000);
                break;
            case 'intermediate':
                selectedExercises = exercisesIntermediate as any[];
                setSpeed(800);
                break;
            case 'advanced':
                selectedExercises = exercisesAdvanced as any[];
                setSpeed(600);
                break;
            default:
                selectedExercises = exercisesBasic as any[];
                setSpeed(1000);
        }

        // NUEVO: tomar al azar, máximo numExercises (tope 5 por el tipo)
        const limitedExercises = sampleArray(selectedExercises, numExercises).map(ex => ({
            ...ex,
            options: shuffleArray(ex.options) // barajar opciones
        }));

        setExercises(limitedExercises);

        // NUEVO: añadimos 'reroll' para re-samplear al reiniciar
    }, [difficulty, numExercises, reroll]);

    useEffect(() => {
        if (showCountdown && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);

            return () => clearTimeout(timer);
        } else if (showCountdown && countdown === 0) {
            setTimeout(() => {
                setShowCountdown(false);
            }, 500);
        }
    }, [countdown, showCountdown]);

    useEffect(() => {
        if (showCountdown) return;

        if (exercises.length > 0 && currentExerciseIndex < exercises.length) {
            const exercise = exercises[currentExerciseIndex];
            setCurrentExercise(exercise);

            const parts = exercise.operation.split(',');
            setOperationParts(parts);
            setCurrentPartIndex(0);
            setDisplayText('');
            setShowOptions(false);
            setIsAnimating(true);
        }

        if (exercises.length > 0) {
            setMaxScore(exercises.length * POINTS_PER_CORRECT);
        }
    }, [exercises, currentExerciseIndex, showCountdown]);

    useEffect(() => {
        if (showCountdown) return;

        if (!isAnimating || operationParts.length === 0) return;

        if (currentPartIndex < operationParts.length) {
            const timer = setTimeout(() => {
                setDisplayText(operationParts[currentPartIndex]);
                setCurrentPartIndex(prev => prev + 1);
            }, speed);

            return () => { clearTimeout(timer) };
        } else {
            setIsAnimating(false);
            setTimeout(() => {
                setDisplayText("¡Listo! Puedes responder.")
                setShowOptions(true);
            }, 500);
        }
    }, [isAnimating, currentPartIndex, operationParts, showCountdown]);

    const handleAnswerSelect = (option: any, index: number) => {
        setActiveButtonIndex(index);
        const style = option.isCorrect ? 'ion-button-pop' : 'ion-button-shake';
        setActiveButtonStyle(style);

        if (option.isCorrect) {
            setScore(prev => prev + POINTS_PER_CORRECT);
        }

        setTimeout(() => {
            const message = option.isCorrect
                ? correctMessages[Math.floor(Math.random() * correctMessages.length)]
                : incorrectMessages[Math.floor(Math.random() * incorrectMessages.length)];

            setFeedbackMessage(message);
            setShowFeedback(true);

            setTimeout(() => {
                setShowFeedback(false);
                setFeedbackMessage(null);
                setActiveButtonIndex(null);
                setActiveButtonStyle('');

                if (currentExerciseIndex < exercises.length - 1) {
                    setCurrentExerciseIndex(prev => prev + 1);
                } else {
                    setTimeout(() => {
                        setFeedbackMessage("🎮 ¡Juego finalizado!");
                        setShowFeedback(true);

                        setTimeout(() => {
                            setShowFeedback(false);
                            setFeedbackMessage(null);
                            setisComplete(false);
                            setShowSummary(true);
                        }, 1200);
                    }, 600);
                }
            }, 1500);
        }, 900);
    };

    return (
        <IonPage>
            {showCountdown && (
                <div className="countdown-overlay">
                    <div className="countdown-number">
                        {countdown > 0 ? countdown : '¡Ahora!'}
                    </div>
                </div>
            )}

            {showFeedback && (
                <div className="feedback-overlay">
                    <div className="feedback-text">{feedbackMessage}</div>
                </div>
            )}

            {showSummary && (
                <div className="summary-overlay">
                    <div className="summary-card">
                        {(() => {
                            const total = exercises.length || 0;
                            const correctas = POINTS_PER_CORRECT > 0
                                ? Math.round(score / POINTS_PER_CORRECT)
                                : 0;

                            const logroMayoría = correctas >= Math.ceil(total / 2);
                            const titulo = logroMayoría ? "¡Felicidades! 🎉" : "¡Buen intento! 💪";

                            return (
                                <>
                                    <h2 className="summary-title">{titulo}</h2>

                                    <div className="summary-stats">
                                        <p><strong>Ejercicios correctos:</strong> {correctas} de {total}</p>
                                        <p><strong>Puntuación final:</strong> {score} / {maxScore}</p>
                                    </div>

                                    <div className="summary-actions">
                                        <IonButton shape="round" expand="block" onClick={resetGame}>
                                            Reiniciar
                                        </IonButton>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {showInstructions && (
                <div className="summary-overlay" onClick={() => setShowSummary(false)}>
                    <div className="summary-card" onClick={(e) => e.stopPropagation()}>
                        <div className="summary-title">
                            <h2 style={{margin: 0}}>Instrucciones</h2>
                            <IonIcon icon={closeCircleOutline} style={{fontSize: '26px'}} onClick={() => setShowInstructions(false)} />
                        </div>

                        <div className="summary-stats">
                            <p style={{textAlign: 'justify'}}><strong>Resuelve mentalmente la operación que aparece en pantalla y elige la respuesta correcta entre las opciones</strong></p>
                        </div>
                    </div>
                </div>
            )}

            <IonContent fullscreen className="ion-padding">
                <div className="header-game ion-no-border">
                    <div className="toolbar-game">
                        <div className="titles">
                            <h1>STEAM-G</h1>
                            <IonIcon icon={alertCircleOutline} size="small" id="info-icon" />
                            <IonPopover trigger="info-icon" side="bottom" alignment="center">
                                <IonCard className="filter-card ion-no-margin">
                                    <div className="section header-section">
                                        <h2>Calculo Mental</h2>
                                    </div>

                                    <div className="section description-section">
                                        <p>Descripción</p>
                                    </div>

                                    <div className="section footer-section">
                                        <span>26 de Octubre del 2025</span>
                                    </div>
                                </IonCard>
                            </IonPopover>
                        </div>
                        <span><strong>Autor:</strong> Jonathan R. | <strong>Version:</strong> 1.0</span>
                    </div>
                </div>

                <div className="instructions-exercises">
                    <IonNote className="instructions" onClick={() => setShowInstructions(true)}>
                        Instrucciones
                    </IonNote>
                    <IonNote>
                        Ejercicio {currentExerciseIndex + 1} de {exercises.length}
                    </IonNote>
                </div>


                <div className="screen-operations">
                    <IonText className={displayText === "¡Listo! Puedes responder." ? "msg-text" : "option-text"}>
                        {displayText}
                    </IonText>
                </div>

                <div className="options-container">
                    {showOptions && currentExercise && (
                        <>
                            {currentExercise.options.map((option: any, index: number) => (
                                <IonButton
                                    key={index}
                                    expand="block"
                                    className={activeButtonIndex === index ? activeButtonStyle : 'ion-button-pulse'}
                                    onClick={() => handleAnswerSelect(option, index)}
                                    disabled={activeButtonIndex !== null || !isComplete}
                                >
                                    {option.text}
                                </IonButton>
                            ))}
                        </>
                    )}
                </div>

                <div className="score">
                    <div className="score-gauge">
                        <IonText>
                            Puntuación
                        </IonText>
                        <GaugeComponent
                            minValue={0}
                            maxValue={maxScore > 0 ? maxScore : 1}
                            value={score}
                            arc={{
                                emptyColor: "#ebebebff",
                                subArcs: [
                                    { length: 33, color: "#EA4228" },
                                    { length: 33, color: "#F5CD19" },
                                    { length: 34, color: "#5BE12C" }
                                ]
                            }}
                            labels={{
                                valueLabel: {
                                    style: {
                                        fill: '#000',
                                        fontSize: '50px',
                                        fontWeight: '500',
                                        textShadow: 'none'
                                    }
                                },
                                tickLabels: { hideMinMax: true }
                            }}
                        />
                    </div>
                </div>

                <div className="button">
                    <IonButton
                        shape="round"
                        expand="full"
                        disabled={isComplete}
                        routerLink="/"
                    >Regresar</IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Play;
