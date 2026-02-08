import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDeliverySettings = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    chittagongFee: 60,
    outsideChittagongFee: 130,
    freeShippingThreshold: 2000,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/settings/delivery', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          setFormData({
            chittagongFee: response.data.chittagongFee ?? response.data.dhakaFee ?? 60,
            outsideChittagongFee: response.data.outsideChittagongFee ?? response.data.outsideDhakaFee ?? 130,
            freeShippingThreshold: response.data.freeShippingThreshold ?? 2000,
          });
        }
      } catch {
        toast.error('Failed to load delivery settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/admin/settings/delivery',
        {
          chittagongFee: Number(formData.chittagongFee),
          outsideChittagongFee: Number(formData.outsideChittagongFee),
          freeShippingThreshold: Number(formData.freeShippingThreshold),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Delivery settings updated');
    } catch {
      toast.error('Failed to update delivery settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-maroon">Delivery Settings</h1>
        <p className="text-slate">Manage shipping fees and free delivery rules.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-semibold text-slate mb-1">Within Chittagong Division Fee (BDT)</label>
          <p className="text-xs text-slate mb-2">Including Cox's Bazar, Chittagong, and surrounding areas</p>
          <input
            name="chittagongFee"
            type="number"
            value={formData.chittagongFee}
            onChange={handleChange}
            className="input-field w-full"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate mb-1">Outside Chittagong Division Fee (BDT)</label>
          <p className="text-xs text-slate mb-2">Rest of Bangladesh (Dhaka, Sylhet, Rajshahi, etc.)</p>
          <input
            name="outsideChittagongFee"
            type="number"
            value={formData.outsideChittagongFee}
            onChange={handleChange}
            className="input-field w-full"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate mb-1">Free Shipping Threshold (BDT)</label>
          <input
            name="freeShippingThreshold"
            type="number"
            value={formData.freeShippingThreshold}
            onChange={handleChange}
            className="input-field w-full"
            min="0"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary">Save Settings</button>
        </div>
      </form>
    </div>
  );
};

export default AdminDeliverySettings;
