// EnhancedWorkoutSets.js
import React, { useState, useEffect } from "react";
import './WorkoutSets.css'; 

const WorkoutSets = ({ exerciseName, onBackToExercises }) => {
    const [sets, setSets] = useState([]); // Start with an empty array for sets

    // This function will be used later to add a new set
    const addSet = () => {
        if (sets.length === 0 || (sets[sets.length - 1].isCompleted)) {
          const newSet = {
            past: { weight: "", reps: "" },
            present: { weight: "", reps: "" },
            isCompleted: false,
          };
          setSets([...sets, newSet]);
        } else {
          alert("Please fill in the weight and reps for the current set before adding a new one.");
        }
      };
      // Function to handle updating the present values of a set
  const handleChange = (index, field, value) => {
    const updatedSets = sets.map((set, idx) =>
      idx === index
        ? {
            ...set,
            present: {
              ...set.present,
              [field]: value, // Update the specific field (weight or reps)
            },
          }
        : set
    );
    setSets(updatedSets);
  };

    useEffect(() => {
        const savedPastSets = JSON.parse(localStorage.getItem(exerciseName)) || [];
        setSets(savedPastSets.map(pastSet => ({
          past: pastSet, // Retrieve past values from the saved data
          present: { weight: "", reps: "" },
          isCompleted: false,
        })));
      }, [exerciseName]);
    
        // Function to handle marking a set as completed and updating the past data
    const markCompleted = (index) => {
        const currentSet = sets[index];

        // Check if both fields are filled
        if (currentSet.present.weight && currentSet.present.reps) {
        const updatedSets = sets.map((set, idx) =>
            idx === index
            ? {
                ...set,
                past: set.present,
                isCompleted: true,
                }
            : set
        );
        setSets(updatedSets);

        // Save the updated sets to localStorage for future sessions
        const pastSetsData = updatedSets.map(set => set.past);
        localStorage.setItem(exerciseName, JSON.stringify(pastSetsData));
        } else {
        alert("Please make sure both weight and reps fields are filled to mark this set as completed.");
        }
    };

    // Function to clear all stats for this exercise
    const clearStats = () => {
    if (window.confirm("Are you sure you want to clear all stats for this exercise?")) {
        localStorage.removeItem(exerciseName); // Remove from localStorage
        setSets([]); // Clear the state
    }
    };
  
    return (
      <div className="container" style={{ position: "relative" }}>
        {/* Moved the "Back to Exercises" button here */}
      <button onClick={onBackToExercises} className="back-button">
        Back to Exercises
      </button>

        <h3>{exerciseName}</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Set</th>
              <th>Previous</th>
              <th>lbs</th>
              <th>Reps</th>
            </tr>
          </thead>
          <tbody>
          {sets.map((set, index) => (
            <tr key={index} className="row">
              <td>{index + 1}</td>
              <td>
                {set.past.weight ? `${set.past.weight} lbs x ${set.past.reps}` : "N/A"}
              </td>
              <td>
                <input
                  type="number"
                  value={set.present.weight}
                  onChange={(e) => handleChange(index, "weight", e.target.value)}
                  disabled={set.isCompleted}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={set.present.reps}
                  onChange={(e) => handleChange(index, "reps", e.target.value)}
                  disabled={set.isCompleted}
                />
              </td>
              <td>
                <button
                  onClick={() => markCompleted(index)}
                  disabled={set.isCompleted}
                  className="complete-button"
                >
                  ✔️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
        <button onClick={addSet} className="add-set-button">
        Add Set
        </button>
        <button onClick={clearStats} className="clear-stats-button">
        Clear Stats
        </button>
      </div>
    );
  };

export default WorkoutSets;