import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore"; // Firestore methods
import { db } from "../firebase"; // Firebase configuration

const FirestoreTest = () => {
  const [testData, setTestData] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "testCollection"));
      const dataList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestData(dataList);
    };

    fetchData(); // Call fetch data on mount
  }, []);

  // Function to add data to Firestore
  const addData = async () => {
    if (inputValue.trim()) {
      try {
        await addDoc(collection(db, "testCollection"), { value: inputValue });
        setTestData([...testData, { value: inputValue }]);
        setInputValue(""); // Clear input
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  return (
    <div>
      <h3>Firestore Test</h3>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter test data"
      />
      <button onClick={addData}>Add Data</button>

      <h4>Saved Data:</h4>
      <ul>
        {testData.map((data, index) => (
          <li key={index}>{data.value}</li>
        ))}
      </ul>
    </div>
  );
};

export default FirestoreTest;
