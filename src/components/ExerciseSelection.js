import React, { useState, useEffect } from "react";
import './ExerciseSelection.css'; 
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore"; // Firestore methods
import { db, auth } from "../firebase"; // Firebase configuration
import { signOut } from "firebase/auth"; // Firebase Auth method for signout
import defaultExercises from "./data/defaultExercises.json"; // Import default exercises

// Utility function to sanitize exercise names (replace spaces with underscores and make lowercase)
const sanitizeExerciseName = (name) => {
  return name.replace(/\s+/g, "_").toLowerCase();
};

const ExerciseSelection = ({ onSelectExercise, userId }) => {
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseCategory, setExerciseCategory] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Fetch exercises from Firestore on component mount
  useEffect(() => {
    if (!userId) return;
    const fetchExercises = async () => {
      const exerciseCollectionRef = collection(db, "Users", userId, "exercises");
      const querySnapshot = await getDocs(exerciseCollectionRef);
      const fetchedExercises = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // If fetched exercises are empty, use the default exercises
      if (fetchedExercises.length === 0) {
        await populateWithDefaultExercises(userId);
        setExercises(defaultExercises);
      } else {
        setExercises(fetchedExercises);
      }
    };

    fetchExercises(); // Fetch data on component mount
  }, [userId]);

  const populateWithDefaultExercises = async (userId) => {
    try {
      const batch = defaultExercises.map(async (exercise) => {
        // Sanitize the exercise name to use as document ID
        const sanitizedExerciseName = sanitizeExerciseName(exercise.name);
  
        // Create a document reference with the sanitized exercise name
        const exerciseDocRef = doc(db, "Users", userId, "exercises", sanitizedExerciseName);
        
        // Add exercise data to Firestore (document name is sanitized)
        await setDoc(exerciseDocRef, {
          name: exercise.name,         // Keep the original name as a field
          category: exercise.category  // Keep the original category
        });
      });
  
      await Promise.all(batch);
    } catch (error) {
      console.error("Error populating default exercises:", error);
    }
  };

  // Function to handle adding a new exercise to Firestore
  const handleAddExercise = async () => {
    if (exerciseName.trim() && exerciseCategory.trim()) {
      const sanitizedExerciseName = sanitizeExerciseName(exerciseName); // Sanitize the exercise name
      const newExercise = { 
        name: exerciseName, 
        category: exerciseCategory 
      };

      try {
        const exerciseDocRef = doc(db, "Users", userId, "exercises", sanitizedExerciseName);
        await setDoc(exerciseDocRef, newExercise); // Set the document with sanitized name

        // Update local state after successfully adding to Firestore
        setExercises([...exercises, { id: sanitizedExerciseName, ...newExercise }]);
        setExerciseName(""); // Clear the input fields
        setExerciseCategory(""); // Clear the input fields
      } catch (error) {
        console.error("Error adding exercise: ", error);
      }
    } else {
      alert("Please provide both exercise name and category.");
    }
  };

  // Function to delete an exercise from Firestore
  const deleteExercise = async (e, index) => {
    e.stopPropagation();
    const exerciseToDelete = exercises[index];

    try {
      const exerciseDocRef = doc(db, "Users", userId, "exercises", exerciseToDelete.id);
      await deleteDoc(exerciseDocRef);

      // Update local state after successfully deleting from Firestore
      setExercises(exercises.filter((_, idx) => idx !== index));
    } catch (error) {
      console.error("Error deleting exercise: ", error);
    }
  };

  // Handle resetting exercises to default and clearing Firestore collection
  const resetExercises = async () => {
    if (window.confirm("Are you sure you want to reset all exercises?")) {
      try {
        // Delete all exercises in Firestore for this user
        const batch = exercises.map(async (exercise) => {
          const exerciseDocRef = doc(db, "Users", userId, "exercises", exercise.id);
          await deleteDoc(exerciseDocRef);
        });
        await Promise.all(batch);

        // Reset local state to default exercises
        setExercises(defaultExercises);
      } catch (error) {
        console.error("Error resetting exercises: ", error);
      }
    }
  };

  // Handle search and filter logic
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const categories = ["All", ...new Set(exercises.map(exercise => exercise.category))];

  // Filter the exercises based on the search term
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || exercise.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container">
      <div className="header-container">
        <h3>Exercises</h3>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />

      {/* Category Filter Dropdown */}
      <select value={filterCategory} onChange={handleCategoryChange} className="category-filter">
        {categories.map((category, index) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>
      
      <ul className="exercise-list">
        {filteredExercises.map((exercise, index) => (
          <li 
            key={exercise.id || index} 
            className="exercise-item"
            onClick={() => onSelectExercise(exercise)} // Notify parent about the selected exercise
            style={{ cursor: "pointer" }}
          >
            <strong className="exercise-name">{exercise.name}</strong>
            <small className="exercise-category">{exercise.category}</small>
            <button onClick={(e) => deleteExercise(e, index)} className="delete-button">
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Section for adding a new exercise */}
      <div className="add-exercise-section">
        <input
          type="text"
          placeholder="Exercise Name"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Category"
          value={exerciseCategory}
          onChange={(e) => setExerciseCategory(e.target.value)}
          className="input-field"
        />
        <button onClick={handleAddExercise} className="add-exercise-button">
          Add Exercise
        </button>
        <button onClick={resetExercises} className="reset-button">
          Reset
        </button>
      </div>
    </div>
  );
};

export default ExerciseSelection;
