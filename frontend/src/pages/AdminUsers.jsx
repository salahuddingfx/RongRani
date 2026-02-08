import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Shield, Mail, Phone, MapPin, Calendar, Edit, Trash2, Crown, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('User role updated successfully');
      fetchUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'admin':
        return 'bg-gradient-to-r from-maroon to-red-700 text-white';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-maroon mx-auto mb-4"></div>
          <p className="text-slate font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-maroon to-red-700 bg-clip-text text-transparent mb-2">
              User Management
            </h1>
            <p className="text-slate text-lg">Manage all registered users and their permissions</p>
          </div>
          <button className="bg-gradient-to-r from-maroon to-red-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold mb-1">Total Users</p>
                <h3 className="text-4xl font-black">{users.length}</h3>
              </div>
              <Users className="h-12 w-12 opacity-30" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-maroon to-red-700 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold mb-1">Admins</p>
                <h3 className="text-4xl font-black">{users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}</h3>
              </div>
              <Shield className="h-12 w-12 opacity-30" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold mb-1">Customers</p>
                <h3 className="text-4xl font-black">{users.filter(u => u.role === 'customer').length}</h3>
              </div>
              <UserIcon className="h-12 w-12 opacity-30" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate/50" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border-2 border-maroon/20 rounded-xl focus:outline-none focus:border-maroon text-slate font-medium"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-maroon/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-maroon to-red-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Avatar</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Role</th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase">Joined</th>
                <th className="px-6 py-4 text-center text-sm font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-cream/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${getRoleBadge(user.role)}`}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-maroon text-lg">{user.name}</p>
                      <p className="text-sm text-slate/70 flex items-center space-x-1 mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-slate">
                      {user.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-maroon" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.address?.city && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-maroon" />
                          <span>{user.address.city}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className={`${getRoleBadge(user.role)} px-4 py-2 rounded-full text-sm font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon flex items-center space-x-2`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-slate">
                      <Calendar className="h-4 w-4 text-maroon" />
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors" title="Edit User">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors" 
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-slate/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-maroon mb-2">No Users Found</h3>
            <p className="text-slate">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
