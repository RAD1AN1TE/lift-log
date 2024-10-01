import React, { useState, useEffect } from "react";
import './ExerciseSelection.css'; 

const ExerciseSelection = ({ onSelectExercise }) => {
    // Sample list of exercises
    const defaultExercises = [
      { name: "Ab wheel", category: "Reps" },
      { name: "Archer curl", category: "Arms" },
      { name: "Arnold press", category: "Shoulders" },
      { name: "Assisted chin up", category: "Back, Arms" },
      { name: "Assisted Dip", category: "Chest, Arms" },
      { name: "Assisted pull up", category: "Back" },
      { name: "Back extension", category: "Lower Back" },
    ];
    
    const [exercises, setExercises] = useState(() => {
        const savedExercises = JSON.parse(localStorage.getItem("exercises"));
        return savedExercises || defaultExercises;
    });

    // Save the exercises to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("exercises", JSON.stringify(exercises));
    }, [exercises]);
    

    const [searchTerm, setSearchTerm] = useState("");
    const [exerciseName, setExerciseName] = useState("");
    const [exerciseCategory, setExerciseCategory] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");
  
    // Function to handle search input
    const handleSearch = (e) => {
      setSearchTerm(e.target.value);
    };

    // Handle filtering by category
    const handleCategoryChange = (e) => {
        setFilterCategory(e.target.value);
      };

      const categories = ["All", ...new Set(exercises.map(exercise => exercise.category))];

    // Filter the exercises based on the search term
    const filteredExercises = exercises.filter((exercise) => {
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "All" || exercise.category === filterCategory;
        return matchesSearch && matchesCategory;
    }
    );

    

    // Function to handle adding a new exercise
    const handleAddExercise = () => {
        if (exerciseName.trim() && exerciseCategory.trim()) {
            const newExercise = { name: exerciseName, category: exerciseCategory };
            const updatedExercises = [...exercises, newExercise];
            setExercises(updatedExercises);
            setExerciseName(""); // Clear the input field
            setExerciseCategory(""); // Clear the input field
        } else {
            alert("Please provide both exercise name and category.");
        }
    };

    // Function to delete an exercise
    const deleteExercise = (e, index) => {
        if (e && e.stopPropagation) {
            e.stopPropagation(); // Prevent parent onClick from firing
          }
        const updatedExercises = exercises.filter((_, idx) => idx !== index);
        setExercises(updatedExercises);
    };

    // Handle resetting exercises to default and clearing localStorage
    const resetExercises = () => {
        if (window.confirm("Are you sure you want to reset all exercises? This will clear your custom exercises data.")) {
        localStorage.removeItem("exercises");
        setExercises(defaultExercises);
        }
    };
  
    return (
      <div className="container">
        <h3>Exercises</h3>
        <div className="input-container">
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
        </div>
        <ul className="exercise-list">
          {filteredExercises.map((exercise, index) => (
            <li 
            key={index} 
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