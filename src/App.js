
import './App.css';
import WorkoutSets from './components/WorkoutSets';
import ExerciseSelection from './components/ExerciseSelection';
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AuthForm from './components/AuthForm';
import { auth } from './firebase';

function App() {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [user, setUser] = useState(null);

    // Monitor the authentication state
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser); // Set the logged-in user
      });
  
      // Cleanup the listener on unmount
      return () => unsubscribe();
    }, []);

  // Function to handle when an exercise is selected
  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  // Function to handle returning back to the exercise selection list
  const handleBackToExercises = () => {
    setSelectedExercise(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Reset user state
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <div className="App">
      {/* Show AuthForm if user is not logged in */}
      {!user ? (
        <AuthForm />
      ) : (
        <div>

          {/* Main app content based on selected exercise */}
          {!selectedExercise ? (
            <ExerciseSelection
             onSelectExercise={setSelectedExercise}
             userId={user.uid} />
          ) : (
            <WorkoutSets 
              exerciseName={selectedExercise.name} 
              onBackToExercises={handleBackToExercises}
              onLogout={handleLogout}  
              userId={user.uid} 
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
