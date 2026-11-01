import { v4 as uuidv4 } from 'uuid';

interface Goal {
  id: string;
  title: string;
  category: "Financial" | "Lifestyle" | "Productivity" | "Fitness";
  target_value: number;
  current_value: number;
  unit: string;
  progress_pct: number;
  milestones: string[];
  proof_notes: string;
  status: "Pending" | "In Progress" | "Completed" | "Archived";
}

const LOCAL_STORAGE_KEY = "success_planner_goals";

// Seed data for localStorage fallback
const seedGoals: Omit<Goal, 'id'>[] = [
  {
    title: "₹10L Passive Income",
    category: "Financial",
    target_value: 1000000,
    current_value: 450000,
    unit: "INR",
    progress_pct: 45,
    milestones: ["Research investment options", "Allocate funds"],
    proof_notes: "Started investing in mutual funds.",
    status: "In Progress",
  },
  {
    title: "Private Jet",
    category: "Lifestyle",
    target_value: 1,
    current_value: 0.12,
    unit: "jet",
    progress_pct: 12,
    milestones: ["Research jet models", "Save down payment"],
    proof_notes: "Explored fractional ownership options.",
    status: "In Progress",
  },
  {
    title: "2h Screen Time",
    category: "Productivity",
    target_value: 2,
    current_value: 1.4,
    unit: "hours",
    progress_pct: 70,
    milestones: ["Install screen time tracker", "Identify time sinks"],
    proof_notes: "Using a screen time tracking app, made good progress.",
    status: "In Progress",
  },
];

// Helper for localStorage operations
const getLocalGoals = (): Goal[] => {
  const storedGoals = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedGoals ? JSON.parse(storedGoals) : [];
};

const setLocalGoals = (goals: Goal[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
};

// Initialize localStorage with seed data if empty
if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
  const initialGoals: Goal[] = seedGoals.map(goal => ({ ...goal, id: uuidv4() }));
  setLocalGoals(initialGoals);
}

// Base44 Adapter
const base44Adapter = {
  getGoals: async (): Promise<Goal[]> => {
    // Assuming base44.entities.SuccessGoal.find() returns an array of goals
    return await (window as any).base44.entities.SuccessGoal.find({});
  },
  createGoal: async (data: Omit<Goal, 'id'>): Promise<Goal> => {
    // Assuming base44.entities.SuccessGoal.create() returns the created goal
    const newGoal = await (window as any).base44.entities.SuccessGoal.create(data);
    return newGoal;
  },
  updateGoal: async (id: string, data: Partial<Goal>): Promise<Goal> => {
    // Assuming base44.entities.SuccessGoal.update() takes ID and data, returns updated goal
    const updatedGoal = await (window as any).base44.entities.SuccessGoal.update(id, data);
    return updatedGoal;
  },
  deleteGoal: async (id: string): Promise<boolean> => {
    // Assuming base44.entities.SuccessGoal.delete() takes ID and returns success status
    await (window as any).base44.entities.SuccessGoal.delete(id);
    return true;
  },
};

// LocalStorage Adapter
const localStorageAdapter = {
  getGoals: async (): Promise<Goal[]> => {
    return getLocalGoals();
  },
  createGoal: async (data: Omit<Goal, 'id'>): Promise<Goal> => {
    const goals = getLocalGoals();
    const newGoal: Goal = { ...data, id: uuidv4(), progress_pct: data.progress_pct ?? 0 };
    goals.push(newGoal);
    setLocalGoals(goals);
    return newGoal;
  },
  updateGoal: async (id: string, data: Partial<Goal>): Promise<Goal | null> => {
    const goals = getLocalGoals();
    const index = goals.findIndex((goal) => goal.id === id);
    if (index === -1) return null;
    const updatedGoal = { ...goals[index], ...data };
    goals[index] = updatedGoal;
    setLocalGoals(goals);
    return updatedGoal;
  },
  deleteGoal: async (id: string): Promise<boolean> => {
    let goals = getLocalGoals();
    const initialLength = goals.length;
    goals = goals.filter((goal) => goal.id !== id);
    setLocalGoals(goals);
    return goals.length < initialLength;
  },
};

// Choose adapter based on window.base44 presence
export const api = (window as any).base44 ? base44Adapter : localStorageAdapter;
