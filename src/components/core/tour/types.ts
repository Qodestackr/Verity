import type React from "react";
export interface TourStep {
  title: string;
  description: string;
  video?: string;
  image?: string;
  component?: React.ReactNode;
  emoji?: string;
}

export interface TourStepProps {
  step: TourStep & { index: number };
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  totalSteps: number;
}

export interface TourOverlayProps {
  steps: TourStep[];
  onClose: () => void;
  role?: "retailer" | "wholesaler" | "distributor";
}

export interface VideoPlayerProps {
  src: string;
  className?: string;
  poster?: string;
}

export interface TourButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}
