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

interface Activity {
  id: string;
  title: string;
  duration: number; // in minutes
  category: "Deep Work" | "Fitness" | "Learning" | "Distraction" | "Social" | "Rest" | "Chores";
  is_relevant: boolean;
  date: string; // YYYY-MM-DD
}

const LOCAL_STORAGE_KEY_GOALS = "success_planner_goals";
const LOCAL_STORAGE_KEY_ACTIVITIES = "life_os_activities";

// Seed data for localStorage fallback for Goals
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

// Seed data for localStorage fallback for Activities
const seedActivities: Omit<Activity, 'id'>[] = [
  {
    title: "Code review for project X",
    duration: 120,
    category: "Deep Work",
    is_relevant: true,
    date: "2026-11-01",
  },
  {
    title: "Morning run",
    duration: 45,
    category: "Fitness",
    is_relevant: true,
    date: "2026-11-01",
  },
  {
    title: "Scroll social media",
    duration: 60,
    category: "Distraction",
    is_relevant: false,
    date: "2026-11-01",
  },
  {
    title: "Read 'Clean Code' chapter",
    duration: 90,
    category: "Learning",
    is_relevant: true,
    date: "2026-11-01",
  },
  {
    title: "Team stand-up meeting",
    duration: 30,
    category: "Deep Work",
    is_relevant: true,
    date: "2026-11-01",
  },
  {
    title: "Watch TV series",
    duration: 180,
    category: "Rest",
    is_relevant: false,
    date: "2026-11-01",
  },
  {
    title: "Grocery shopping",
    duration: 60,
    category: "Chores",
    is_relevant: false, // Can be relevant depending on context, but set to false for demo
    date: "2026-11-01",
  },
  {
    title: "Client call",
    duration: 60,
    category: "Deep Work",
    is_relevant: true,
    date: "2026-10-31",
  },
  {
    title: "Workout",
    duration: 60,
    category: "Fitness",
    is_relevant: true,
    date: "2026-10-31",
  },
  {
    title: "Read news",
    duration: 30,
    category: "Distraction",
    is_relevant: false,
    date: "2026-10-31",
  },
  {
    title: "Project planning",
    duration: 120,
    category: "Deep Work",
    is_relevant: true,
    date: "2026-10-30",
  },
];

// Helper for localStorage operations for Goals
const getLocalGoals = (): Goal[] => {
  const storedGoals = localStorage.getItem(LOCAL_STORAGE_KEY_GOALS);
  return storedGoals ? JSON.parse(storedGoals) : [];
};

const setLocalGoals = (goals: Goal[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_GOALS, JSON.stringify(goals));
};

// Helper for localStorage operations for Activities
const getLocalActivities = (): Activity[] => {
  const storedActivities = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVITIES);
  return storedActivities ? JSON.parse(storedActivities) : [];
};

const setLocalActivities = (activities: Activity[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
};

// Initialize localStorage with seed data if empty
if (!localStorage.getItem(LOCAL_STORAGE_KEY_GOALS)) {
  const initialGoals: Goal[] = seedGoals.map(goal => ({ ...goal, id: uuidv4() }));
  setLocalGoals(initialGoals);
}

if (!localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVITIES)) {
  const initialActivities: Activity[] = seedActivities.map(activity => ({ ...activity, id: uuidv4() }));
  setLocalActivities(initialActivities);
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

  getActivities: async (): Promise<Activity[]> => {
    // Assuming base44.entities.SuccessActivity.find() returns an array of activities
    // For now, let's use a dummy entity if SuccessActivity doesn't exist.
    // In a real scenario, this would require defining a SuccessActivity entity in Base44.
    if ((window as any).base44.entities.SuccessActivity) {
      return await (window as any).base44.entities.SuccessActivity.find({});
    }
    console.warn("Base44 SuccessActivity entity not found. Using localStorage fallback for activities.");
    return []; // Return empty if not available
  },
  createActivity: async (data: Omit<Activity, 'id'>): Promise<Activity> => {
    if ((window as any).base44.entities.SuccessActivity) {
      const newActivity = await (window as any).base44.entities.SuccessActivity.create(data);
      return newActivity;
    }
    throw new Error("Base44 SuccessActivity entity not found. Cannot create activity.");
  },
  updateActivity: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    if ((window as any).base44.entities.SuccessActivity) {
      const updatedActivity = await (window as any).base44.entities.SuccessActivity.update(id, data);
      return updatedActivity;
    }
    throw new Error("Base44 SuccessActivity entity not found. Cannot update activity.");
  },
  deleteActivity: async (id: string): Promise<boolean> => {
    if ((window as any).base44.entities.SuccessActivity) {
      await (window as any).base44.entities.SuccessActivity.delete(id);
      return true;
    }
    throw new Error("Base44 SuccessActivity entity not found. Cannot delete activity.");
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

  getActivities: async (): Promise<Activity[]> => {
    return getLocalActivities();
  },
  createActivity: async (data: Omit<Activity, 'id'>): Promise<Activity> => {
    const activities = getLocalActivities();
    const newActivity: Activity = { ...data, id: uuidv4(), date: data.date || new Date().toISOString().split('T')[0] };
    activities.push(newActivity);
    setLocalActivities(activities);
    return newActivity;
  },
  updateActivity: async (id: string, data: Partial<Activity>): Promise<Activity | null> => {
    const activities = getLocalActivities();
    const index = activities.findIndex((activity) => activity.id === id);
    if (index === -1) return null;
    const updatedActivity = { ...activities[index], ...data };
    activities[index] = updatedActivity;
    setLocalActivities(activities);
    return updatedActivity;
  },
  deleteActivity: async (id: string): Promise<boolean> => {
    let activities = getLocalActivities();
    const initialLength = activities.length;
    activities = activities.filter((activity) => activity.id !== id);
    setLocalActivities(activities);
    return activities.length < initialLength;
  },
};

// Choose adapter based on window.base44 presence
const chosenAdapter = (window as any).base44 ? base44Adapter : localStorageAdapter;

export const api = {
  ...chosenAdapter,
  // Ensure that if base44 is not present, the activity methods fallback correctly
  getActivities: chosenAdapter.getActivities,
  createActivity: chosenAdapter.createActivity,
  updateActivity: chosenAdapter.updateActivity,
  deleteActivity: chosenAdapter.deleteActivity,
};
