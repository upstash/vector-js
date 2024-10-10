"use client"
import { useState } from 'react';
import { UpsertPayload, UpsertResponse } from '../api/upsert/types';

export default function UploadData() {
  const [inputFields, setInputFields] = useState([
    { text: 'The sky is clear and blue today.' },
    { text: 'I love learning about machine learning and artificial intelligence.' },
    { text: 'The sun sets beautifully over the mountains.' },
    { text: 'She enjoys reading books on deep learning and neural networks.' },
    { text: 'Clouds are forming in the sky as the day progresses.' },
  ]);
  const [response, setResponse] = useState<string[]>([])

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputFields = [...inputFields];
    newInputFields[index].text = event.target.value;
    setInputFields(newInputFields);
  };

  const handleAddField = () => {
    setInputFields([...inputFields, { text: '' }]);
  };

  const handleRemoveField = (index: number) => {
    const newInputFields = [...inputFields];
    newInputFields.splice(index, 1);
    setInputFields(newInputFields);
  };

  const handleSendData = async () => {
    const validInputs = inputFields.filter(field => field.text.trim() !== '');

    if (validInputs.length === 0) {
      alert('Please fill in at least one valid field.');
      return;
    }

    
    try {
      const payload: UpsertPayload = {
        texts: validInputs.map(field => field.text)
      }
      const res = await fetch('/api/upsert', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const { result } = await res.json() as UpsertResponse;
      console.log(result);
      
      setResponse(result.map(({id}) => id))
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  };

  return (
    <div>
      <h2 className="text-lg text-balance opacity-60">
        We will start by upserting data to the index. Enter your data below and click the Upsert button.
      </h2>
      
      {inputFields.map((field, index) => (
        <div key={index} className="flex items-center gap-1 mt-2">
          <input
            type="text"
            value={field.text}
            onChange={(e) => handleInputChange(index, e)}
            className="flex-1 p-2 border rounded-md"
            placeholder={`Input ${index + 1}`}
          />
          <button
            onClick={() => handleRemoveField(index)}
            className="group p-2 hover:bg-red-400 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-x text-red-400 group-hover:text-white"
            ><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
          </button>
        </div>
      ))}

      <div className="flex gap-2 mt-2 justify-end">

        <button
          onClick={handleSendData}
          className="p-2 bg-green-500 text-white rounded-md px-3"
        >
          Upsert
        </button>

        <button
          onClick={handleAddField}
          className="group p-2 hover:bg-blue-400 rounded-md border-blue-400 border"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-plus  text-blue-400 group-hover:text-white"
          ><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>
        </button>
      </div>
      
      {response.length !== 0 && 
        <div className="break-all bg-gray-100 rounded-md mt-6 px-3 py-2 w-96">
          <h2 className="text-lg text-balance opacity-60 pb-2">
            Vector IDs:
          </h2>
          <ul>
            {response.map((id, index) => <li key={index}>{id}</li>)}
          </ul>
        </div>
      }
    </div>
  );
}
