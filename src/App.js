import logo from './logo.svg';
import './App.css';
import WorkoutSets from './components/WorkoutSets';
import ExerciseSelection from './components/ExerciseSelection';
import React, { useState } from "react";

function App() {
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Function to handle when an exercise is selected
  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  // Function to handle returning back to the exercise selection list
  const handleBackToExercises = () => {
    setSelectedExercise(null);
  };

  return (
    <div className="App">
      {!selectedExercise ? (
        <ExerciseSelection onSelectExercise={setSelectedExercise} />
      ) : (
        <div>
          <WorkoutSets 
          exerciseName={selectedExercise.name} 
          onBackToExercises={handleBackToExercises} 
        />
        </div>
      )}
    </div>
  );
}

export default App;
