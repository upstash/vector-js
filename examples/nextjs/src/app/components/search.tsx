"use client"
import { useState } from 'react';
import { SearchResponse } from '../api/search/types';

export default function QueryData() {
  const [query, setQuery] = useState('artificial intelligence');
  const [results, setResults] = useState<{ id: string; data: string }[] | null>(null);    
  const [pending, setPending] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      alert('Please enter a valid query.');
      return;
    }
    setPending(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      const { result } = await res.json() as SearchResponse;

      setResults(result);
    } catch (error) {
      console.error('Error querying data:', error);
      setResults(null);
    } finally {
      setPending(false)
    }
  };

  return (
    <div>
      <h2 className="text-lg text-balance opacity-60">
        Next, you can query your vector index by entering a query:
      </h2>

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border rounded-md"
          placeholder="Enter query"
        />
        <button
          disabled={pending}
          onClick={handleSearch}
          className={`p-2 bg-green-500 text-white rounded-md px-3 ${pending && "bg-gray-300"}`}
        >
          Search
        </button>
      </div>

      {results && (
        <div className="break-normal bg-gray-100 rounded-md mt-6 px-3 py-2">
          <table className="table-auto w-full border-collapse">
            <tbody>
              {/* <tr>
                <td className=''>ID</td>
                <td className=''>Data</td>
              </tr> */}
              {results.map((result, index) =>
                <tr key={index}>
                  <td className="font-semibold w-32">{result.id}</td>
                  <td className="opacity-60">{ result.data }</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
