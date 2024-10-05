import React, { useState, useEffect } from "react";
import './WorkoutSets.css'; 
import { doc, getDoc, updateDoc, deleteField } from "firebase/firestore"; // Firestore methods
import { db } from "../firebase"; // Firebase configuration

const WorkoutSets = ({ exerciseName, onBackToExercises, userId, onLogout }) => {
  const [sets, setSets] = useState([]);

  // Function to sanitize exercise name for Firestore (replace spaces with underscores)
  const sanitizeExerciseName = (name) => {
    return name.replace(/\s+/g, "_").toLowerCase();
  };

  // Fetch saved sets from Firestore on component mount
  useEffect(() => {
    if (!userId) return;

    const fetchSets = async () => {
      const sanitizedExerciseName = sanitizeExerciseName(exerciseName); // Ensure valid Firestore path
      const exerciseDocRef = doc(db, "Users", userId, "exercises", sanitizedExerciseName);
      const exerciseDoc = await getDoc(exerciseDocRef);

      if (exerciseDoc.exists()) {
        const exerciseData = exerciseDoc.data();
        const savedSets = Object.keys(exerciseData)
          .filter(key => key.startsWith("set_"))
          .map(key => ({
            setNumber: key,
            reps: exerciseData[key].reps,
            weight: exerciseData[key].weight,
            isCompleted: false, // Set isCompleted to false initially so fields are editable
          }))
          .sort((a, b) => { // Sort by set number
            const setNumberA = parseInt(a.setNumber.split('_')[1]);
            const setNumberB = parseInt(b.setNumber.split('_')[1]);
            return setNumberA - setNumberB;
          });

        // Load past sets and initialize the present fields
        setSets(savedSets.map(pastSet => ({
          past: { reps: pastSet.reps, weight: pastSet.weight },
          present: { reps: "", weight: "" },
          isCompleted: pastSet.isCompleted // Allow modification if not completed
        })));
      }
    };

    fetchSets();
  }, [exerciseName, userId]);

  const addSet = () => {
    if (sets.length === 0 || sets[sets.length - 1].isCompleted) {
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

  // Function to handle marking a set as completed and saving to Firestore
  const markCompleted = async (index) => {
    const currentSet = sets[index];

    if (currentSet.present.weight && currentSet.present.reps) {
      const updatedSets = sets.map((set, idx) =>
        idx === index
          ? {
              ...set,
              past: set.present,
              isCompleted: true, // Mark as completed after saving
            }
          : set
      );
      setSets(updatedSets);

      try {
        const sanitizedExerciseName = sanitizeExerciseName(exerciseName);
        const exerciseDocRef = doc(db, "Users", userId, "exercises", sanitizedExerciseName);

        // Update or add the set in Firestore
        const newSetNumber = `set_${index + 1}`;
        await updateDoc(exerciseDocRef, {
          [newSetNumber]: {
            reps: currentSet.present.reps,
            weight: currentSet.present.weight,
          },
        });
      } catch (error) {
        console.error("Error saving set: ", error);
      }
    } else {
      alert("Please make sure both weight and reps fields are filled to mark this set as completed.");
    }
  };

  const handleChange = (index, field, value) => {
    const updatedSets = sets.map((set, idx) =>
      idx === index
        ? {
            ...set,
            present: {
              ...set.present,
              [field]: value,
            },
          }
        : set
    );
    setSets(updatedSets);
  };

  const clearStats = async () => {
    if (window.confirm("Are you sure you want to clear all stats for this exercise?")) {
      try {
        const sanitizedExerciseName = sanitizeExerciseName(exerciseName);
        const exerciseDocRef = doc(db, "Users", userId, "exercises", sanitizedExerciseName);
  
        // Prepare the update object to delete all set fields
        const updatedExercise = {};
        sets.forEach((_, index) => {
          updatedExercise[`set_${index + 1}`] = deleteField(); // Use deleteField()
        });
  
        // Update Firestore to remove set fields
        await updateDoc(exerciseDocRef, updatedExercise);
        setSets([]); // Clear local state
      } catch (error) {
        console.error("Error clearing stats: ", error);
      }
    }
  };

  return (
    <div className="container" style={{ position: "relative" }}>
      <div className="header-container">
        <button onClick={onBackToExercises} className="back-button">
          Back
        </button>
        <h3>{exerciseName}</h3>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>

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
