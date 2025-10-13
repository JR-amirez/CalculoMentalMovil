import { useMemo } from "react";
import "./NumberCard.css";

interface NumberComponentProps {
    num: number;
    selectedNumber: number;
    onSelect: (num: number) => void;
}

const NumberCard: React.FC<NumberComponentProps> = ({ num, selectedNumber, onSelect }) => {
    const paths = [
        "M50,5 C72,7 93,28 95,50 C93,72 72,93 50,95 C28,93 7,72 5,50 C7,28 28,7 50,5 Z",
        "M50,6 C71,5 94,27 96,50 C95,73 73,95 50,94 C27,95 5,73 4,50 C5,27 27,5 50,6 Z",
        "M50,4 C73,6 95,28 96,50 C94,72 71,94 50,96 C28,94 6,72 4,50 C6,28 28,6 50,4 Z",
        "M50,7 C72,6 93,29 95,50 C92,71 71,93 50,95 C29,92 7,71 5,50 C7,29 29,7 50,7 Z",
        "M50,5 C71,7 94,27 95,50 C94,73 72,94 50,95 C27,94 6,73 5,50 C6,27 27,6 50,5 Z"
    ]

    const getRandomPath = () => {
        const randomIndex = Math.floor(Math.random() * paths.length);
        return paths[randomIndex];
    };

    const selectedPath = useMemo(() => getRandomPath(), []);
    const isSelected = num <= selectedNumber;

    const handleClick = () => {
        onSelect(num);
    }

    return (
        <div className={`circle ${isSelected ? 'selected' : ''}`} onClick={handleClick}>
            <svg viewBox="0 0 100 100">
                <path 
                    d={selectedPath}
                    fill={isSelected ? "#3498db" : "none"}
                    stroke="#2c3e50"
                    stroke-width="2" 
                />
            </svg>
            <span>{num}</span>
        </div>
    )
};

export default NumberCard;

