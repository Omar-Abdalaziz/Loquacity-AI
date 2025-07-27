
import { Stage } from './types';

export const STAGES: Stage[] = [
  Stage.IntentDetection,
  Stage.QueryReformulation,
  Stage.LiveSearch,
  Stage.RAG,
  Stage.AnswerGeneration,
  Stage.PostProcessing,
];
