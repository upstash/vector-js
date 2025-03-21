"use client"
import { useState } from 'react';
import { UpsertPayload, UpsertResponse } from '../api/upsert/types';

export default function UploadData() {
  const [inputFields, setInputFields] = useState([
    { text: 'The sky is clear and blue today.' },
    { text: 'I love learning about machine learning and artificial intelligence.' },
    { text: 'Sun sets beautifully over the mountains.' },
    { text: 'He enjoys reading books on deep learning and neural networks.' },
    { text: 'Clouds are forming in the sky as the day progresses.' },
  ]);
  const [pending, setPending] = useState(false)
  const [response, setResponse] = useState<string[]>([])

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newInputFields = [...inputFields];
    newInputFields[index].text = event.target.value;
    setInputFields(newInputFields);
  };

  const handleSendData = async () => {
    const validInputs = inputFields.filter(field => field.text.trim() !== '');

    if (validInputs.length === 0) {
      alert('Please fill in at least one valid field.');
      return;
    }

    setPending(true)

    
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
    } finally {
      setPending(false)
    }
  };

  return (
    <div>
      <h2 className="text-lg text-balance opacity-60">
        We will start by upserting data to the index.
      </h2>
      
      {inputFields.map((field, index) => (
        <div key={index} className="flex items-center gap-1 mt-2">
          <input
            disabled={true}
            type="text"
            value={field.text}
            onChange={(e) => handleInputChange(index, e)}
            className="flex-1 p-2 border rounded-md"
            placeholder={`Input ${index + 1}`}
          />
        </div>
      ))}

      <div className="flex gap-2 mt-2 justify-end">

        <button
          disabled={pending}
          onClick={handleSendData}
          className={`p-2 bg-green-500 text-white rounded-md px-3 ${pending && "bg-gray-300"}`}
        >
          Upsert
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
