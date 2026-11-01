import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle } from 'lucide-react';

export default function Home() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    category: 'Financial', // Default category
    target_value: 0,
    current_value: 0,
    unit: '',
    milestones: [],
    proof_notes: '',
    status: 'In Progress', // Default status
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const fetchedGoals = await api.getGoals();
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Fallback or error handling
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementProgress = async (goalId) => {
    const goalToUpdate = goals.find((g) => g.id === goalId);
    if (goalToUpdate) {
      const newProgressPct = Math.min(100, goalToUpdate.progress_pct + 5);
      const updatedGoal = await api.updateGoal(goalId, { progress_pct: newProgressPct });
      if (updatedGoal) {
        setGoals((prevGoals) =>
          prevGoals.map((g) => (g.id === goalId ? updatedGoal : g))
        );
      }
    }
  };

  const handleMilestoneToggle = async (goalId, milestoneIndex, checked) => {
    const goalToUpdate = goals.find((g) => g.id === goalId);
    if (goalToUpdate) {
      const updatedMilestones = [...goalToUpdate.milestones];
      // Simple toggle for now, in a real app this might track completion status
      updatedMilestones[milestoneIndex] = checked
        ? `✓ ${updatedMilestones[milestoneIndex].replace(/^✓\s/, '')}`
        : updatedMilestones[milestoneIndex].replace(/^✓\s/, '');

      const updatedGoal = await api.updateGoal(goalId, { milestones: updatedMilestones });
      if (updatedGoal) {
        setGoals((prevGoals) =>
          prevGoals.map((g) => (g.id === goalId ? updatedGoal : g))
        );
      }
    }
  };

  const handleAddGoalChange = (e) => {
    const { id, value } = e.target;
    setNewGoal((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const createdGoal = await api.createGoal({
        ...newGoal,
        target_value: parseFloat(newGoal.target_value),
        current_value: parseFloat(newGoal.current_value),
        progress_pct: newGoal.target_value > 0 ? (parseFloat(newGoal.current_value) / parseFloat(newGoal.target_value)) * 100 : 0,
        milestones: newGoal.milestones.filter(m => m.trim() !== ''), // Ensure no empty milestones
      });
      setGoals((prev) => [...prev, createdGoal]);
      setNewGoal({
        title: '',
        category: 'Financial',
        target_value: 0,
        current_value: 0,
        unit: '',
        milestones: [],
        proof_notes: '',
        status: 'In Progress',
      });
      setIsAddGoalDialogOpen(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const overallProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress_pct, 0);
    return Math.round(totalProgress / goals.length);
  }, [goals]);

  const top3Goals = useMemo(() => {
    // Sort by progress_pct descending and take top 3
    return goals.slice().sort((a, b) => b.progress_pct - a.progress_pct).slice(0, 3);
  }, [goals]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Success Planner Dashboard</h1>

        {/* Overall Life Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Life Progress</CardTitle>
            <CardDescription>Average progress across all your goals.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-muted-foreground stroke-current"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                />
                <circle
                  className="text-primary stroke-current"
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={(2 * Math.PI * 40) - (2 * Math.PI * 40 * (overallProgress / 100))}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                {overallProgress}%
              </span>
            </div>
            <Progress value={overallProgress} className="w-full max-w-sm mx-auto" />
          </CardContent>
        </Card>

        {/* Top 3 Goals */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Goals</CardTitle>
            <CardDescription>Your most advanced goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {top3Goals.map((goal) => (
                <Card key={goal.id} className="p-4">
                  <CardTitle className="text-xl mb-2">{goal.title}</CardTitle>
                  <CardDescription className="mb-2">{goal.category}</CardDescription>
                  <div className="flex items-center space-x-2">
                    <Progress value={goal.progress_pct} className="flex-grow" />
                    <span className="text-sm font-medium">{goal.progress_pct}%</span>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Goals List */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Your Active Goals</CardTitle>
            <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddGoalSubmit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={handleAddGoalChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Financial', 'Lifestyle', 'Productivity', 'Fitness'].map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="target_value" className="text-right">
                      Target Value
                    </Label>
                    <Input
                      id="target_value"
                      type="number"
                      value={newGoal.target_value}
                      onChange={handleAddGoalChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current_value" className="text-right">
                      Current Value
                    </Label>
                    <Input
                      id="current_value"
                      type="number"
                      value={newGoal.current_value}
                      onChange={handleAddGoalChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Unit
                    </Label>
                    <Input
                      id="unit"
                      value={newGoal.unit}
                      onChange={handleAddGoalChange}
                      className="col-span-3"
                      placeholder="e.g., INR, jet, hours"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="milestones" className="text-right pt-2">
                      Milestones
                    </Label>
                    <Textarea
                      id="milestones"
                      value={newGoal.milestones.join('\n')}
                      onChange={(e) => setNewGoal((prev) => ({ ...prev, milestones: e.target.value.split('\n') }))}
                      className="col-span-3"
                      placeholder="Enter each milestone on a new line"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="proof_notes" className="text-right pt-2">
                      Proof Notes
                    </Label>
                    <Textarea
                      id="proof_notes"
                      value={newGoal.proof_notes}
                      onChange={handleAddGoalChange}
                      className="col-span-3"
                      placeholder="Notes about your progress or proof"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={newGoal.status}
                      onValueChange={(value) => setNewGoal((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Pending', 'In Progress', 'Completed', 'Archived'].map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Goal</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-center text-muted-foreground">No goals added yet. Click "Add Goal" to get started!</p>
            ) : (
              <div className="grid gap-6">
                {goals.map((goal) => (
                  <Card key={goal.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-grow mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold">{goal.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{goal.category}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <Progress value={goal.progress_pct} className="flex-grow" />
                        <span className="text-sm font-medium">{goal.progress_pct.toFixed(0)}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current: {goal.current_value} {goal.unit} / Target: {goal.target_value} {goal.unit}
                      </p>
                      {goal.milestones && goal.milestones.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-md font-medium mb-2">Milestones:</h4>
                          {goal.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-1">
                              <Checkbox
                                id={`milestone-${goal.id}-${index}`}
                                checked={milestone.startsWith('✓')}
                                onCheckedChange={(checked) => handleMilestoneToggle(goal.id, index, checked)}
                              />
                              <Label htmlFor={`milestone-${goal.id}-${index}`} className="text-sm">
                                {milestone.replace(/^✓\s/, '')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                      {goal.proof_notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">"{goal.proof_notes}"</p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleIncrementProgress(goal.id)}
                      disabled={goal.progress_pct >= 100}
                      className="md:ml-4 flex-shrink-0"
                    >
                      +5% Progress
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
