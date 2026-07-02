import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './SaaS.css';
import { toast } from 'react-hot-toast';

function UsersManager() {
  const [usersList, setUsersList] = useState([]);
  const { user: currentUser } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsersList(response.data);
    } catch (error) {
      toast.error('Lỗi lấy danh sách khách hàng');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    if (window.confirm(`Bạn có chắc muốn cấp quyền ${newRole.toUpperCase()} cho người dùng này?`)) {
      try {
        await api.put(`/users/${id}/role`, { role: newRole });
        toast.success(`Đã cập nhật quyền thành ${newRole.toUpperCase()}`);
        fetchUsers();
      } catch (error) {
        toast.error('Cập nhật quyền thất bại');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Cảnh báo: Hành động này sẽ xóa hoàn toàn tài khoản. Bạn chắc chứ?")) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Đã xóa tài khoản');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Xóa thất bại');
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Khách Hàng & Phân Quyền</h1>
          <p className="text-secondary">Quản lý tài khoản và phân quyền Staff</p>
        </div>
      </div>

      <div className="panel bg-elevated">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-secondary">
              <th className="py-3 px-4">Tên</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phân quyền (Role)</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map(u => (
              <tr key={u._id} className="border-b hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-bold">
                  {u.name} {u._id === currentUser._id && <span className="text-xs text-accent ml-2">(Bạn)</span>}
                </td>
                <td className="py-3 px-4 text-secondary">{u.email}</td>
                <td className="py-3 px-4">
                  <select 
                    className="input-field py-1 px-2 text-sm max-w-[120px]" 
                    value={u.role}
                    disabled={u.role === 'admin' && u._id === currentUser._id}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  >
                    <option value="user">USER</option>
                    <option value="staff">STAFF</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  {u._id !== currentUser._id && u.role !== 'admin' && (
                    <button className="btn-outline text-xs py-1 px-3 text-primary border-primary" onClick={() => handleDelete(u._id)}>
                      XÓA
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersManager;
