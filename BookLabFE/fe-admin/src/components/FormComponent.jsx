import React, { useState, useEffect } from "react";
import { roleData } from "../data/roleData";

function FormComponent({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(roleData);

  useEffect(() => {
    setFormData(roleData);
  }, [roleData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">
        {roleData.id ? "Update Data" : "Create New Data"}
      </h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(roleData).map((key) =>
          key !== "id" ? (
            <div key={key} className="mb-4">
              <label className="block font-bold capitalize">{key}:</label>
              <input
                type={
                  key === "age"
                    ? "number"
                    : key === "startDate"
                    ? "date"
                    : "text"
                }
                name={key}
                value={formData[key] || ""}
                onChange={handleChange}
                required
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          ) : null
        )}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {roleData.id ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
}

export default FormComponent;
