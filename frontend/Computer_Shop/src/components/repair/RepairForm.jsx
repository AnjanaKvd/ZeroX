import React, { useState } from 'react';
import { useRepair } from '../../context/RepairContext';

const RepairForm = () => {
  const { createRepairRequest } = useRepair();
  const [formData, setFormData] = useState({
    deviceType: '',
    deviceBrand: '',
    deviceModel: '',
    issueDetails: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createRepairRequest(formData);
      setFormData({
        deviceType: '',
        deviceBrand: '',
        deviceModel: '',
        issueDetails: '',
      });
    } catch (err) {
      setError('Failed to create repair request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Device Type</label>
        <input
          type="text"
          name="deviceType"
          value={formData.deviceType}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Device Brand</label>
        <input
          type="text"
          name="deviceBrand"
          value={formData.deviceBrand}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Device Model</label>
        <input
          type="text"
          name="deviceModel"
          value={formData.deviceModel}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Issue Details</label>
        <textarea
          name="issueDetails"
          value={formData.issueDetails}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default RepairForm;