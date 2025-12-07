import {
    IonButton,
    IonCard,
    IonContent,
    IonIcon,
    IonNote,
    IonPage,
    IonPopover,
    IonText,
    IonAlert,
    IonChip,
} from "@ionic/react";
import "./Play.css";
import { useEffect, useState } from "react";
import exercisesBasic from "../data/exercises_basic.json";
import exercisesIntermediate from "../data/exercises_intermediate.json";
import exercisesAdvanced from "../data/exercises_advanced.json";
import {
    alertCircleOutline,
    closeCircleOutline,
    playCircleOutline,
} from "ionicons/icons";
import { App } from "@capacitor/app";

interface ScoreGaugeProps {
    min: number;
    max: number;
    value: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ min, max, value }) => {
    const safeMax = max <= min ? min + 1 : max;
    const clamped = Math.min(Math.max(value, min), safeMax);
    const pct = (clamped - min) / (safeMax - min);
    const radius = 75;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - pct);

    const getColorInfo = () => {
        if (pct <= 0.33)
            return {
                gradient: "url(#redGradient)",
                color: "#EA4228",
                glow: "rgba(234, 66, 40, 0.4)",
            };
        if (pct <= 0.66)
            return {
                gradient: "url(#yellowGradient)",
                color: "#F5CD19",
                glow: "rgba(245, 205, 25, 0.4)",
            };
        return {
            gradient: "url(#greenGradient)",
            color: "#5BE12C",
            glow: "rgba(91, 225, 44, 0.4)",
        };
    };

    const colorInfo = getColorInfo();

    return (
        <svg
        width={220}
        height={220}
        viewBox="0 0 220 220"
        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
        >
        <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#FF6B6B", stopOpacity: 1 }} />
                <stop
                    offset="100%"
                    style={{ stopColor: "#EA4228", stopOpacity: 1 }}
                />
            </linearGradient>

            <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#FFD93D", stopOpacity: 1 }} />
                <stop
                    offset="100%"
                    style={{ stopColor: "#F5CD19", stopOpacity: 1 }}
                />
            </linearGradient>

            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#6BCF7F", stopOpacity: 1 }} />
                <stop
                    offset="100%"
                    style={{ stopColor: "#5BE12C", stopOpacity: 1 }}
                />
            </linearGradient>

            <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>

        <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#e8e8e8"
            strokeWidth={strokeWidth}
            fill="none"
            opacity="0.3"
        />

        <circle
            cx="110"
            cy="110"
            r={radius}
            stroke={colorInfo.gradient}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            style={{
            transition: "stroke-dashoffset 0.5s ease-out, stroke 0.3s ease",
            filter: "url(#glow)",
            }}
        />

        <text
            x="50%"
            y="40%"
            textAnchor="middle"
            dominantBaseline="central"
            style={{
            fontSize: "42px",
            fontWeight: 700,
            fill: colorInfo.color,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-1px",
            }}
        >
            {clamped}
        </text>

        <text
            x="50%"
            y="65%"
            textAnchor="middle"
            style={{
            fontSize: "18px",
            fontWeight: 500,
            fill: "#888",
            fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            de {safeMax}
        </text>
        </svg>
    );
};

type Difficulty = "basic" | "intermediate" | "advanced";
type NumExercises = 1 | 2 | 3 | 4 | 5;

type CalculoRuntimeConfig = {
    nivel?: string;
    ejercicios?: number;
    autor?: string;
    version?: string;
    fecha?: string;
    descripcion?: string;
};

export interface PlayProps {
    difficulty?: Difficulty;
    numExercises?: NumExercises;
}

const Play: React.FC<PlayProps> = ({
    difficulty = "basic",
    numExercises = 3,
}) => {
    const [difficultyConfig, setDifficultyConfig] =
        useState<Difficulty>(difficulty);
    const [numExercisesConfig, setNumExercisesConfig] =
        useState<NumExercises>(numExercises);
    const [configLoaded, setConfigLoaded] = useState<boolean>(false);
    const [exercises, setExercises] = useState<any[]>([]);
    const [speed, setSpeed] = useState<number>(1000);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
    const [currentExercise, setCurrentExercise] = useState<any>(null);
    const [operationParts, setOperationParts] = useState<string[]>([]);
    const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);
    const [displayText, setDisplayText] = useState<string>("");
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [maxScore, setMaxScore] = useState<number>(0);
    const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(
        null
    );
    const [activeButtonStyle, setActiveButtonStyle] = useState<string>("");
    const [isComplete, setisComplete] = useState<boolean>(true);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [showSummary, setShowSummary] = useState<boolean>(false);
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [reroll, setReroll] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [showExitModal, setShowExitModal] = useState<boolean>(false);
    const [showStartScreen, setShowStartScreen] = useState<boolean>(true);
    const [countdown, setCountdown] = useState<number>(3);
    const [showCountdown, setShowCountdown] = useState<boolean>(false);
    const [appAutor, setAppAutor] = useState<string>("Jonathan R.");
    const [appVersion, setAppVersion] = useState<string>("1.0");
    const [appFecha, setAppFecha] = useState<string>("2 de Diciembre del 2025");
    const [appDescripcion, setAppDescripcion] = useState<string>(
        "Juego para el desarrollo de habilidades matemáticas"
    );

    const getDifficultyLabel = (nivel: Difficulty): string => {
        const labels: Record<Difficulty, string> = {
            basic: 'Básico',
            intermediate: 'Intermedio',
            advanced: 'Avanzado',
        };
        return labels[nivel] ?? nivel;
    };

    const POINTS_PER_CORRECT = 10;

    const correctMessages = [
        "¡Excelente! 🎯",
        "¡Muy bien hecho! 💪",
        "¡Perfecto! 🌟",
        "¡Súper respuesta! 🚀",
        "¡Buen trabajo! 😎",
    ];

    const incorrectMessages = [
        "¡Ups! ❌",
        "Sigue intentando 💪",
        "Casi lo logras 😅",
        "No te rindas 🔁",
        "Intenta de nuevo 👊",
    ];

    const normalizarNivelConfig = (nivel: string): Difficulty => {
        const limpio = nivel.toLowerCase();
        const mapa: Record<string, Difficulty> = {
        basico: "basic",
        basic: "basic",
        intermedio: "intermediate",
        intermediate: "intermediate",
        avanzado: "advanced",
        advanced: "advanced",
        };
        return mapa[limpio] ?? "basic";
    };

    const formatearFechaLarga = (isoDate?: string) => {
        if (!isoDate) return appFecha;
        const [year, month, day] = isoDate.split("-");
        const meses = [
            "enero",
            "febrero",
            "marzo",
            "abril",
            "mayo",
            "junio",
            "julio",
            "agosto",
            "septiembre",
            "octubre",
            "noviembre",
            "diciembre",
        ];

        const mesIndex = Number(month) - 1;
        if (mesIndex < 0 || mesIndex > 11) return isoDate;

        return `${Number(day)} de ${meses[mesIndex]} del ${year}`;
    };

    useEffect(() => {
        const cargarConfig = async () => {
        try {
            const res = await fetch("/config/calculo-config.json");

            if (!res.ok) {
                setConfigLoaded(true);
                return;
            }

            const data: CalculoRuntimeConfig = await res.json();

            if (data.nivel) {
                setDifficultyConfig(normalizarNivelConfig(data.nivel));
            }

            if (data.autor) setAppAutor(data.autor);
            if (data.version) setAppVersion(data.version);
            if (data.fecha) setAppFecha(formatearFechaLarga(data.fecha));
            if (data.descripcion) setAppDescripcion(data.descripcion);

            if (typeof data.ejercicios === "number") {
                const ejerciciosNormalizados = Math.min(
                    5,
                    Math.max(1, Math.round(data.ejercicios))
                );
                setNumExercisesConfig(ejerciciosNormalizados as NumExercises);
            }
        } catch (err) {
            console.error("No se pudo cargar calculo-config.json", err);
        } finally {
            setConfigLoaded(true);
        }
        };

        cargarConfig();
    }, []);

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
        setDisplayText("");
        setIsAnimating(false);
        setShowOptions(false);
        setActiveButtonIndex(null);
        setActiveButtonStyle("");
        setScore(0);
        setisComplete(true);

        setCountdown(3);
        setShowCountdown(true);

        setShowSummary(false);

        setReroll(prev => prev + 1);
    };

    useEffect(() => {
        if (!configLoaded) return;

        let selectedExercises: any[] = [];

        switch (difficultyConfig) {
        case "basic":
            selectedExercises = exercisesBasic as any[];
            setSpeed(1000);
            break;
        case "intermediate":
            selectedExercises = exercisesIntermediate as any[];
            setSpeed(800);
            break;
        case "advanced":
            selectedExercises = exercisesAdvanced as any[];
            setSpeed(600);
            break;
        default:
            selectedExercises = exercisesBasic as any[];
            setSpeed(1000);
        }

        const limitedExercises = sampleArray(
            selectedExercises,
            numExercisesConfig
        ).map((ex) => ({
            ...ex,
            options: shuffleArray(ex.options),
        }));

        setExercises(limitedExercises);
    }, [difficultyConfig, numExercisesConfig, reroll, configLoaded]);

    useEffect(() => {
        if (showCountdown && countdown > 0) {
        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
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
        if (!currentExercise) {
            const exercise = exercises[currentExerciseIndex];
            setCurrentExercise(exercise);

            const parts = exercise.operation.split(",");
            setOperationParts(parts);
            setCurrentPartIndex(0);
            setDisplayText("");
            setShowOptions(false);
            setIsAnimating(true);
        }
        }

        if (exercises.length > 0) {
        setMaxScore(exercises.length * POINTS_PER_CORRECT);
        }
    }, [exercises, currentExerciseIndex, showCountdown, currentExercise]);

    useEffect(() => {
        if (showCountdown) return;

        if (!isAnimating || operationParts.length === 0) return;

        if (isPaused) return;

        if (currentPartIndex < operationParts.length) {
        const timer = setTimeout(() => {
            setDisplayText(operationParts[currentPartIndex]);
            setCurrentPartIndex((prev) => prev + 1);
        }, speed);

        return () => {
            clearTimeout(timer);
        };
        } else {
        setIsAnimating(false);
        setTimeout(() => {
            setDisplayText("¡Listo! Puedes responder.");
            setShowOptions(true);
        }, 500);
        }
    }, [isAnimating, currentPartIndex, operationParts, showCountdown]);

    const handleAnswerSelect = (option: any, index: number) => {
        if (isPaused) return;

        setActiveButtonIndex(index);
        const style = option.isCorrect ? "ion-button-pop" : "ion-button-shake";
        setActiveButtonStyle(style);

        if (option.isCorrect) {
        setScore((prev) => prev + POINTS_PER_CORRECT);
        }

        setTimeout(() => {
        const message = option.isCorrect
            ? correctMessages[Math.floor(Math.random() * correctMessages.length)]
            : incorrectMessages[
                Math.floor(Math.random() * incorrectMessages.length)
            ];

        setFeedbackMessage(message);
        setShowFeedback(true);

        setTimeout(() => {
            setShowFeedback(false);
            setFeedbackMessage(null);
            setActiveButtonIndex(null);
            setActiveButtonStyle("");

            if (currentExerciseIndex < exercises.length - 1) {
            setCurrentExercise(null);
            setCurrentExerciseIndex((prev) => prev + 1);
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

    const openExitModal = () => {
        setIsPaused(true);
        setIsAnimating(false);
        setShowExitModal(true);
    };

    const handleResume = () => {
        setShowExitModal(false);
        setCountdown(3);
        setShowCountdown(true);
        setIsPaused(false);
        setIsAnimating(true);
    };

    const handleExitApp = async () => {
        try {
        await App.exitApp();
        } catch (e) {
        window.close();
        }
    };

    const handleStartGame = () => {
        setShowStartScreen(false);
        resetGame();
    };

    const handleExitToStart = () => {
        setShowExitModal(false);

        setIsPaused(false);

        setShowCountdown(false);
        setShowInstructions(false);
        setShowSummary(false);
        setShowFeedback(false);

        setShowStartScreen(true);
    };


    return (
        <IonPage>
            {showCountdown && (
                <div className="countdown-overlay">
                <div className="countdown-number">
                    {countdown > 0 ? countdown : "¡Ahora!"}
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
                    const correctas =
                        POINTS_PER_CORRECT > 0
                        ? Math.round(score / POINTS_PER_CORRECT)
                        : 0;

                    const logroMayoría = correctas >= Math.ceil(total / 2);
                    const titulo = logroMayoría
                        ? "¡Felicidades! 🎉"
                        : "¡Buen intento! 💪";

                    return (
                        <>
                        <h2 className="summary-title">{titulo}</h2>

                        <div className="summary-stats">
                            <p>
                            <strong>Ejercicios correctos:</strong> {correctas} de{" "}
                            {total}
                            </p>
                            <p>
                            <strong>Puntuación final:</strong> {score} / {maxScore}
                            </p>
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
                <div className="ins-overlay" onClick={() => setShowInstructions(false)}>
                <div className="ins-card" onClick={(e) => e.stopPropagation()}>
                    <div className="ins-title">
                    <h2 style={{ margin: 0, fontWeight: "bold" }}>Instrucciones</h2>
                    <IonIcon
                        icon={closeCircleOutline}
                        style={{ fontSize: "26px" }}
                        onClick={() => setShowInstructions(false)}
                    />
                    </div>

                    <div className="ins-stats">
                    <p style={{ textAlign: "justify" }}>
                        <strong>
                        Resuelve mentalmente la operación que aparece en pantalla y
                        elige la respuesta correcta entre las opciones
                        </strong>
                    </p>
                    </div>
                </div>
                </div>
            )}

            <IonAlert
                isOpen={showExitModal}
                header="¿Estás seguro de salir?"
                buttons={[
                    {
                        text: "Reanudar",
                        role: "cancel",
                        handler: handleResume,
                    },
                    {
                        text: "Salir",
                        role: "confirm",
                        handler: handleExitToStart,
                    },
                ]}
                onDidDismiss={() => {
                    if (isPaused) handleResume();
                }}
            ></IonAlert>

            <IonContent fullscreen className="ion-padding">
                {showStartScreen ? (
                    <div className="inicio-container">
                        <div className="header-game ion-no-border">
                            <div className="toolbar-game">
                                <div className="titles">
                                    <h1>STEAM-G</h1>
                                    <IonIcon icon={alertCircleOutline} size="small" id="info-icon" />
                                    <IonPopover trigger="info-icon" side="bottom" alignment="center">
                                        <IonCard className="filter-card ion-no-margin">
                                            <div className="section header-section">
                                                <h2>Cálculo mental</h2>
                                            </div>

                                            <div className="section description-section">
                                                <p>{appDescripcion}</p>
                                            </div>

                                            <div className="section footer-section">
                                                <span>{appFecha}</span>
                                            </div>
                                        </IonCard>
                                    </IonPopover>
                                </div>
                                <span><strong>Autor:</strong> {appAutor} | <strong>Versión:</strong> {appVersion}</span>
                            </div>
                        </div>

                        <div className="info-juego">
                            <div className="info-item">
                                <IonChip color="secondary">
                                    <strong>{getDifficultyLabel(difficultyConfig)}</strong>
                                </IonChip>
                            </div>
                            <div className="info-item">
                                <IonChip color="warning">
                                    <strong>{numExercisesConfig} ejercicios</strong>
                                </IonChip>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: "20px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                justifyContent: "center",
                            }}
                        >
                            <IonButton color="primary" onClick={handleStartGame}>
                                <IonIcon slot="start" icon={playCircleOutline}></IonIcon>
                                Iniciar juego
                            </IonButton>
                            <IonButton color="medium" onClick={handleExitApp}>
                                <IonIcon slot="start" icon={closeCircleOutline}></IonIcon>
                                Cerrar aplicación
                            </IonButton>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="header-game ion-no-border">
                        <div className="toolbar-game">
                            <div className="titles">
                            <h1>STEAM-G</h1>
                            <IonIcon icon={alertCircleOutline} size="small" id="info-icon" />
                            <IonPopover trigger="info-icon" side="bottom" alignment="center">
                                <IonCard className="filter-card ion-no-margin">
                                <div className="section header-section">
                                    <h2>Cálculo Mental</h2>
                                </div>

                                <div className="section description-section">
                                    <p>{appDescripcion}</p>
                                </div>

                                <div className="section footer-section">
                                    <span>{appFecha}</span>
                                </div>
                                </IonCard>
                            </IonPopover>
                            </div>
                            <span>
                            <strong>Autor:</strong> {appAutor} | <strong>Version:</strong>{" "}
                            {appVersion}
                            </span>
                        </div>
                        </div>

                        <div className="instructions-exercises">
                        <IonNote
                            className="instructions"
                            onClick={() => setShowInstructions(true)}
                        >
                            Instrucciones
                        </IonNote>
                        <IonNote>
                            Ejercicio {currentExerciseIndex + 1} de {exercises.length}
                        </IonNote>
                        </div>

                        <div className="screen-operations">
                        <IonText
                            className={
                            displayText === "¡Listo! Puedes responder."
                                ? "msg-text"
                                : "option-text"
                            }
                        >
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
                                className={
                                    activeButtonIndex === index
                                    ? activeButtonStyle
                                    : "ion-button-pulse"
                                }
                                onClick={() => handleAnswerSelect(option, index)}
                                disabled={
                                    activeButtonIndex !== null || !isComplete || isPaused
                                }
                                style={{
                                    fontSize:
                                    difficultyConfig === "basic"
                                        ? "xx-large"
                                        : difficultyConfig === "intermediate"
                                        ? "20px"
                                        : "19px",
                                }}
                                >
                                {option.text}
                                </IonButton>
                            ))}
                            </>
                        )}
                        </div>

                        <div className="score">
                        <div className="score-gauge">
                            <IonText>Puntuación</IonText>
                            <ScoreGauge
                            min={0}
                            max={maxScore > 0 ? maxScore : 1}
                            value={score}
                            />
                        </div>
                        </div>

                        <div className="button">
                            <IonButton shape="round" expand="full" onClick={openExitModal}>
                                Pausar
                            </IonButton>
                        </div>
                    </>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Play;
