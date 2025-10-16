# Substep Tracking Implementation Guide

## Overview

This guide explains how to implement **checkable substeps** for each phase that automatically calculate progress in your Project Workflow Journey.

## What You Want

For each project phase (Discovery, Design, Development, Testing, Launch, Support), you want:

1. **Predefined substeps** shown as checkable tasks
2. **Check/uncheck** to mark completion
3. **Automatic progress calculation** based on completed substeps
4. **Progress stored in database** and persists across sessions
5. **Phase progress** = (completed substeps / total substeps) × 100
6. **Overall progress** = average of all phase progresses

## Current Substeps Structure

From your requirements, the substeps are:

### Discovery Phase
- First Call ✅
- Requirements Gathering Session PRD
- Project Kickoff Session

### Design Phase
- Wireframes & User Flow
- UI Design & Prototypes
- Design Review & Approval

### Development Phase
- Environment Setup
- Database Design
- Backend Development
- Frontend Development
- API Integration
- Third-party Integrations

### Testing Phase
- Unit Testing
- Integration Testing
- User Acceptance Testing
- Bug Fixes & Optimization

### Launch Phase
- Production Deployment
- Monitoring Setup
- Go Live
- Launch Support

### Support Phase
- Documentation & Handover
- User Training
- Ongoing Maintenance
- Performance Optimization

## Implementation Steps

### Step 1: Update Database Model

Add `substeps` field to your project workflow:

```javascript
// In projectWorkflow collection
{
  _id: ObjectId,
  userId: String,
  projectName: String,
  // ... other fields

  substeps: {
    discovery: [
      { name: 'First Call', completed: true, completedDate: Date, notes: '' },
      { name: 'Requirements Gathering Session PRD', completed: false, completedDate: null, notes: '' },
      { name: 'Project Kickoff Session', completed: false, completedDate: null, notes: '' }
    ],
    design: [
      { name: 'Wireframes & User Flow', completed: false, completedDate: null, notes: '' },
      // ... more substeps
    ],
    // ... other phases
  },

  progress: {
    overall: 15, // Calculated from substeps
    phases: {
      discovery: 33, // 1/3 substeps completed
      design: 0,
      // ... other phases
    }
  }
}
```

### Step 2: Create Backend API Endpoint

**File: `backend/controllers/projectWorkflowController.js`**

Add this new controller function:

```javascript
import { initializeSubsteps, toggleSubstep, calculatePhaseProgressFromSubsteps, calculateOverallProgressFromPhases } from '../models/substepsHelper.js';

// Toggle substep completion
export const toggleProjectSubstep = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { phase, substepName } = req.body;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Initialize substeps if they don't exist
    let substeps = project.substeps || initializeSubsteps();

    // Toggle the substep
    substeps = toggleSubstep(substeps, phase, substepName);

    // Calculate phase progress
    const phaseProgress = calculatePhaseProgressFromSubsteps(substeps[phase]);

    // Calculate overall progress
    const overallProgress = calculateOverallProgressFromPhases(substeps);

    // Update phase progress
    const phaseProgressUpdate = {};
    Object.keys(substeps).forEach(p => {
      phaseProgressUpdate[`progress.phases.${p}`] = calculatePhaseProgressFromSubsteps(substeps[p]);
    });

    // Update database
    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          substeps,
          'progress.overall': overallProgress,
          ...phaseProgressUpdate,
          updatedAt: new Date(),
          lastUpdatedBy: req.user._id.toString()
        }
      }
    );

    const updatedProject = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    res.json({
      success: true,
      message: 'Substep updated successfully',
      data: { project: sanitizeProjectWorkflow(updatedProject) }
    });

  } catch (error) {
    console.error('Toggle substep error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update substep',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
```

### Step 3: Add API Route

**File: `backend/routes/projectWorkflow.js`**

```javascript
import { toggleProjectSubstep } from '../controllers/projectWorkflowController.js';

// Add this route
router.put('/:projectId/substeps', toggleProjectSubstep);
```

### Step 4: Update Frontend Service

**File: `src/services/projectWorkflowService.ts`**

Add this method to the service:

```typescript
// Toggle substep completion
async toggleSubstep(
  projectId: string,
  phase: string,
  substepName: string
): Promise<{ success: boolean; project?: ProjectWorkflow; error?: any }> {
  try {
    const result = await api.put(`/project-workflow/${projectId}/substeps`, {
      phase,
      substepName
    });

    if (result.success && result.data?.project) {
      return {
        success: true,
        project: result.data.project,
      };
    }

    return { success: false, error: 'Failed to toggle substep' };
  } catch (error) {
    console.error('Error toggling substep:', error);
    return { success: false, error };
  }
},
```

### Step 5: Update Journey UI Component

**File: `src/components/ProjectWorkflowJourney.tsx`**

Replace the milestones section with substeps:

```tsx
// Add substeps display after project overview
{selectedProject && (
  <Card>
    <CardHeader>
      <CardTitle>Progress Tracker</CardTitle>
      <CardDescription>
        Check off tasks as you complete them
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {Object.entries(PHASE_SUBSTEPS).map(([phase, substeps]) => (
        <div key={phase}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold capitalize flex items-center">
              <Badge className={getPhaseColor(phase)} variant="outline" className="mr-2">
                {phase}
              </Badge>
            </h3>
            <span className="text-sm text-muted-foreground">
              {selectedProject.progress.phases[phase as PhaseKey]}%
            </span>
          </div>

          <div className="space-y-2">
            {substeps.map((substep: string) => {
              const isCompleted = selectedProject.substeps?.[phase]
                ?.find(s => s.name === substep)?.completed || false;

              return (
                <div
                  key={substep}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-accent cursor-pointer"
                  onClick={() => handleToggleSubstep(phase, substep)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
                    {substep}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2">
            <Progress value={selectedProject.progress.phases[phase as PhaseKey]} className="h-2" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

Add the handler function:

```tsx
const handleToggleSubstep = async (phase: string, substepName: string) => {
  if (!selectedProject) return;

  const result = await projectWorkflowService.toggleSubstep(
    selectedProject._id,
    phase,
    substepName
  );

  if (result.success) {
    await fetchUserProjects();
    toast({
      title: "Progress Updated",
      description: "Substep status updated successfully",
    });
  } else {
    toast({
      title: "Error",
      description: "Failed to update substep",
      variant: "destructive",
    });
  }
};
```

Add the constants at the top of the component:

```tsx
const PHASE_SUBSTEPS = {
  discovery: ['First Call', 'Requirements Gathering Session PRD', 'Project Kickoff Session'],
  design: ['Wireframes & User Flow', 'UI Design & Prototypes', 'Design Review & Approval'],
  development: ['Environment Setup', 'Database Design', 'Backend Development', 'Frontend Development', 'API Integration', 'Third-party Integrations'],
  testing: ['Unit Testing', 'Integration Testing', 'User Acceptance Testing', 'Bug Fixes & Optimization'],
  launch: ['Production Deployment', 'Monitoring Setup', 'Go Live', 'Launch Support'],
  support: ['Documentation & Handover', 'User Training', 'Ongoing Maintenance', 'Performance Optimization']
};
```

### Step 6: Update Interface

**File: `src/services/projectWorkflowService.ts`**

Add `substeps` to the ProjectWorkflow interface:

```typescript
export interface ProjectWorkflow {
  // ... existing fields
  substeps?: {
    discovery: Substep[];
    design: Substep[];
    development: Substep[];
    testing: Substep[];
    launch: Substep[];
    support: Substep[];
  };
  // ... rest of fields
}

export interface Substep {
  name: string;
  completed: boolean;
  completedDate: Date | null;
  notes: string;
}
```

## How It Works

### 1. User Interaction
1. User clicks on a substep checkbox
2. `handleToggleSubstep()` is called
3. API request sent to `/api/project-workflow/:projectId/substeps`

### 2. Backend Processing
1. Find project in database
2. Toggle the substep's `completed` status
3. Recalculate phase progress: `(completed substeps / total substeps) × 100`
4. Recalculate overall progress: average of all phases
5. Save to database
6. Return updated project

### 3. UI Update
1. Fetch updated project data
2. UI re-renders with new progress
3. Progress bars update automatically
4. Checked substeps show checkmark and strikethrough

## Progress Calculation Formula

### Phase Progress
```
Phase Progress = (Completed Substeps in Phase / Total Substeps in Phase) × 100
```

Example:
- Discovery has 3 substeps
- 1 is completed
- Progress = (1 / 3) × 100 = 33%

### Overall Progress
```
Overall Progress = Average of All Phase Progresses
```

Example:
- Discovery: 33%
- Design: 0%
- Development: 0%
- Testing: 0%
- Launch: 0%
- Support: 0%
- Overall = (33 + 0 + 0 + 0 + 0 + 0) / 6 = 5.5% ≈ 6%

## Files to Create/Modify

### New Files
1. `backend/models/substepsHelper.js` ✅ Created
   - Substep definitions
   - Helper functions

### Files to Modify
1. `backend/controllers/projectWorkflowController.js`
   - Add `toggleProjectSubstep` function

2. `backend/routes/projectWorkflow.js`
   - Add route: `PUT /:projectId/substeps`

3. `src/services/projectWorkflowService.ts`
   - Add `Substep` interface
   - Add `substeps` to `ProjectWorkflow` interface
   - Add `toggleSubstep()` method

4. `src/components/ProjectWorkflowJourney.tsx`
   - Add `PHASE_SUBSTEPS` constant
   - Add substeps display UI
   - Add `handleToggleSubstep()` function

## Testing

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `npm run dev`
3. **Test Flow**:
   - Go to Journey tab
   - See substeps for each phase
   - Click a substep checkbox
   - Verify it checks/unchecks
   - Verify phase progress updates
   - Verify overall progress updates
   - Refresh page - progress persists!

## Expected Behavior

### Initial State
- All substeps unchecked
- All phase progress: 0%
- Overall progress: 0%

### After Checking "First Call" in Discovery
- First Call: ✅ checked
- Discovery progress: 33% (1/3)
- Overall progress: 6% (33/6)

### After Checking All Discovery Substeps
- All Discovery substeps: ✅ checked
- Discovery progress: 100% (3/3)
- Overall progress: 17% (100/6)

## Database Example

```json
{
  "_id": "project123",
  "projectName": "E-Commerce Platform",
  "substeps": {
    "discovery": [
      {
        "name": "First Call",
        "completed": true,
        "completedDate": "2025-01-15T10:00:00Z",
        "notes": ""
      },
      {
        "name": "Requirements Gathering Session PRD",
        "completed": false,
        "completedDate": null,
        "notes": ""
      },
      {
        "name": "Project Kickoff Session",
        "completed": false,
        "completedDate": null,
        "notes": ""
      }
    ],
    "design": [
      // ... design substeps
    ]
  },
  "progress": {
    "overall": 6,
    "phases": {
      "discovery": 33,
      "design": 0,
      "development": 0,
      "testing": 0,
      "launch": 0,
      "support": 0
    }
  }
}
```

## Benefits

✅ **Visual Progress**: See exactly what's done and what's left
✅ **Automatic Calculation**: No manual progress updates needed
✅ **Persistent**: Progress saves to database
✅ **Phase-by-Phase**: Track each phase independently
✅ **Clickable**: Easy checkbox interaction
✅ **Real-time**: Updates immediately on click
✅ **Accurate**: Formula-based calculation

## Summary

This implementation gives you a complete substep tracking system where:

1. Each phase has predefined substeps
2. Users check off substeps as they complete them
3. Progress is automatically calculated
4. Everything is stored in the database
5. UI updates in real-time
6. Progress persists across sessions

The system is robust, accurate, and provides clear visual feedback on project progress!
