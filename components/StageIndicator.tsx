
import React from 'react';
import { Stage } from '../types';
import { STAGES } from '../constants';
import { CheckCircleIcon } from './icons';

interface StageIndicatorProps {
  currentStage: Stage;
  isDone: boolean;
}

const getStageStatus = (stage: Stage, currentStage: Stage, isDone: boolean) => {
    if (isDone) return 'completed';
    const currentIndex = STAGES.indexOf(currentStage);
    const stageIndex = STAGES.indexOf(stage);
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'upcoming';
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ currentStage, isDone }) => {
    const currentStageIndex = STAGES.indexOf(currentStage);

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            <div className="flex items-center">
                {STAGES.map((stage, index) => {
                    const status = getStageStatus(stage, currentStage, isDone);
                    const isCompleted = status === 'completed';
                    const isActive = status === 'active';

                    return (
                        <React.Fragment key={stage}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isCompleted ? 'bg-sky-500 text-white' : 
                                        isActive ? 'bg-sky-500 ring-4 ring-sky-500/30 text-white' : 
                                        'bg-slate-700 text-slate-400'
                                    }`}
                                >
                                    {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : (index + 1)}
                                </div>
                                <p className={`mt-2 text-xs text-center transition-colors duration-300 ${
                                    isCompleted ? 'text-sky-400' : isActive ? 'text-sky-400 font-bold' : 'text-slate-500'
                                }`}>
                                    {stage.split(' ')[0]}
                                </p>
                            </div>

                            {index < STAGES.length - 1 && (
                                <div className={`flex-1 h-1 transition-colors duration-500 ${isCompleted ? 'bg-sky-500' : 'bg-slate-700'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
