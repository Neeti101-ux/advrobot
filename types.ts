import { GroundingChunk } from "@google/genai";

export enum View {
  Jailbreak = 'jailbreak',
  CyberLaw = 'cyberlaw',
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: string;
  glitch?: boolean; // Primarily for old jailbreak UI, might be reused or removed.
  sources?: GroundingChunk[]; // For CyberLaw assistant
}

// --- JAILBREAK FEATURE TYPES ---
// Old ProtocolId, JailbreakProtocol, JailbreakTest, TestResult might be deprecated or heavily modified.
// For now, keeping them in case any concept is reused, but the new structure is below.
export enum ProtocolId {
  MrRobot = 'mr_robot',
  ChimeraOmega = 'chimera_omega', // Will be ChimeraAPEX
  Nexus = 'nexus',
  AdvRobot = 'adv_robot', // New
}

export interface JailbreakTest { // This structure seems more like what a "Level" will present
  level: number; // Corresponds to the new Level ID
  name: string; // Level Name or Test Name within a protocol
  prompt: string | ((context?: Record<string, string>) => string); // The instructionPrompt for the level
  objective: string; // Description or objective of the level
}


// New structure for 13-Level Jailbreak System
export interface JailbreakLevelDefinition {
  id: number;
  name: string; // e.g., "Level 1: The Nexus Challenge"
  protocolName: string; // e.g., "Nexus Protocol"
  description: string; // Brief description of the level's goal or the protocol
  instructionPrompt: string; // The specific prompt for the user to copy and test
  animationKey: string; // Identifier for the robot walking animation (placeholder)
  successAnimationKey: string; // Identifier for the "safer LLM" animation (placeholder)
}

export interface JailbreakLevelState extends JailbreakLevelDefinition {
  isCompleted: boolean;
  isUnlocked: boolean;
}


// --- CYBER LAW FEATURE TYPES ---
export enum Jurisdiction {
  India = 'India',
  UAE = 'UAE',
  UK = 'UK',
}

// Ensure process.env.API_KEY is typed if used directly in TS files outside of typical Node env.
// This is mostly for type-checking; actual value comes from execution environment.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY?: string;
    }
  }
}
