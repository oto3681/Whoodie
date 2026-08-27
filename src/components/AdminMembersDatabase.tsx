import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Edit3, 
  Search, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  ShieldCheck, 
  Package, 
  DollarSign, 
  Calendar, 
  X, 
  ExternalLink,
  Plus,
  RefreshCw,
  Eye,
  ArrowUpDown,
  Filter,
  Check,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RegisteredMember, Order, OrderStatus } from '../types';
import { exportMembersToExcel, exportDatabaseCombinedToExcel } from '../utils/excelExporter';

export const AdminMembersDatabase: React.FC = () => {
  const { 
    registeredMembers, 
    orders, 
    addRegisteredMember, 
    updateRegisteredMember, 
    deleteRegisteredMember, 
    deleteOrder,
    updateOrderStatus,
    showToast 
  } = useApp();

  const [activeSection, setActiveSection] = useState<'members' | 'orders' | 'backup'>('members');
  
  // Member Search & Filters
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<string>('all');
  const [memberStatusFilter, setMemberStatusFilter] = useState<string>('all');
  const [memberSortBy, setMemberSortBy] = useState<'name' | 'orders' | 'spend' | 'date'>('date');
  const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>('desc');

  // Order Search & Filters in Database View
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<RegisteredMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<RegisteredMember | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [viewMemberOrdersModal, setViewMemberOrdersModal] = useState<RegisteredMember | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Form State for Adding / Editing Member
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    city: 'Nairobi',
    role: 'user' as 'user' | 'manager' | 'admin',
    status: 'active' as 'active' | 'inactive' | 'suspended' | 'pending',
    notes: '',
    provider: 'email' as 'email' | 'google' | 'facebook' | 'manual'
  });

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '+254',
      companyName: '',
      city: 'Nairobi',
      role: 'user',
      status: 'active',
      notes: '',
      provider: 'manual'
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (member: RegisteredMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      companyName: member.companyName || '',
      city: member.city || 'Nairobi',
      role: member.role || 'user',
      status: member.status || 'active',
      notes: member.notes || '',
      provider: member.provider || 'email'
    });
    setShowEditMemberModal(true);
  };

  // Submit Add Member
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Missing Fields', 'Please enter both a valid Name and Email.', 'warning');
      return;
    }

    // Check if email already exists
    const emailLower = formData.email.trim().toLowerCase();
    const exists = registeredMembers.some(m => m.email.toLowerCase() === emailLower);
    if (exists) {
      showToast('Email Already Registered', `A member with email ${formData.email} already exists in database.`, 'warning');
      return;
    }

    addRegisteredMember({
      name: formData.name.trim(),
      email: emailLower,
      phone: formData.phone.trim() || '+254700000000',
      companyName: formData.companyName.trim() || undefined,
      city: formData.city.trim() || 'Nairobi',
      role: formData.role,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
      provider: formData.provider,
      ordersCount: 0,
      totalSpend: 0,
      avatar: formData.role === 'admin' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    });

    setShowAddMemberModal(false);
    resetForm();
  };

  // Submit Edit Member
  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Missing Fields', 'Please enter both a valid Name and Email.', 'warning');
      return;
    }

    updateRegisteredMember(selectedMember.id, {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      companyName: formData.companyName.trim() || undefined,
      city: formData.city.trim() || 'Nairobi',
      role: formData.role,
      status: formData.status,
      notes: formData.notes.trim() || undefined,
      lastActive: new Date().toISOString()
    });

    setShowEditMemberModal(false);
    setSelectedMember(null);
    resetForm();
  };

  // Confirm Delete Member
  const handleConfirmDeleteMember = () => {
    if (memberToDelete) {
      deleteRegisteredMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  // Confirm Delete Order
  const handleConfirmDeleteOrder = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
    }
  };

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    return registeredMembers.filter((m) => {
      const matchesSearch = 
        m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        (m.phone && m.phone.includes(memberSearchQuery)) ||
        (m.companyName && m.companyName.toLowerCase().includes(memberSearchQuery.toLowerCase())) ||
        (m.city && m.city.toLowerCase().includes(memberSearchQuery.toLowerCase()));

      const matchesRole = memberRoleFilter === 'all' || m.role === memberRoleFilter;
      const matchesStatus = memberStatusFilter === 'all' || m.status === memberStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      if (memberSortBy === 'name') {
        const comp = a.name.localeCompare(b.name);
        return memberSortOrder === 'asc' ? comp : -comp;
      }
      if (memberSortBy === 'orders') {
        const diff = (a.ordersCount || 0) - (b.ordersCount || 0);
        return memberSortOrder === 'asc' ? diff : -diff;
      }
      if (memberSortBy === 'spend') {
        const diff = (a.totalSpend || 0) - (b.totalSpend || 0);
        return memberSortOrder === 'asc' ? diff : -diff;
      }
      // date
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return memberSortOrder === 'asc' ? diff : -diff;
    });
  }, [registeredMembers, memberSearchQuery, memberRoleFilter, memberStatusFilter, memberSortBy, memberSortOrder]);

  // Filtered Orders for Database
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        (o.customerPhone && o.customerPhone.includes(orderSearchQuery)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
        (o.deliveryCity && o.deliveryCity.toLowerCase().includes(orderSearchQuery.toLowerCase()));

      const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  // Aggregate Stats
  const totalSpendAllMembers = useMemo(() => {
    return registeredMembers.reduce((sum, m) => sum + (m.totalSpend || 0), 0);
  }, [registeredMembers]);

  const activeMembersCount = useMemo(() => {
    return registeredMembers.filter(m => m.status === 'active').length;
  }, [registeredMembers]);

  const adminCount = useMemo(() => {
    return registeredMembers.filter(m => m.role === 'admin' || m.role === 'manager').length;
  }, [registeredMembers]);

  return (
    <div id="admin-members-database-panel" className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" /> Database & Member Management
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Live Firestore Synced
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Customer & Order Database
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Full database directory for all registered accounts, verified customers, staff members, and real orders. Add new members, modify permissions, or remove accounts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setShowAddMemberModal(true);
              }}
              id="admin-add-member-btn"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Member</span>
            </button>

            <button
              onClick={() => exportDatabaseCombinedToExcel(registeredMembers, orders)}
              id="admin-export-db-excel-btn"
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
              title="Download full database backup (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export Full Database</span>
            </button>
          </div>
        </div>

        {/* Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Total Members
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {registeredMembers.length}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
              {activeMembersCount} Active accounts
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-400" /> Total Orders Placed
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {orders.length}
            </div>
            <div className="text-[10px] text-blue-300 font-semibold mt-0.5">
              {orders.filter(o => o.orderStatus === 'Delivered').length} Completed
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Member Lifetime Value
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              KSh {totalSpendAllMembers.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Total cumulative revenue
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Admins & Staff
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-300 mt-1">
              {adminCount}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Privileged system roles
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSection('members')}
            id="admin-tab-members-toggle"
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'members'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Registered Members Database ({registeredMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('orders')}
            id="admin-tab-orders-db-toggle"
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'orders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4 text-blue-400" />
            <span>Orders Database ({orders.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSection === 'members' && (
            <button
              onClick={() => exportMembersToExcel(registeredMembers)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Members (.xlsx)</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: REGISTERED MEMBERS DATABASE */}
      {/* ========================================================================= */}
      {activeSection === 'members' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, company, city..."
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
              />
              {memberSearchQuery && (
                <button
                  onClick={() => setMemberSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* Role filter */}
              <select
                value={memberRoleFilter}
                onChange={(e) => setMemberRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">All Roles ({registeredMembers.length})</option>
                <option value="user">Customers</option>
                <option value="manager">Managers / Staff</option>
                <option value="admin">Administrators</option>
              </select>

              {/* Status filter */}
              <select
                value={memberStatusFilter}
                onChange={(e) => setMemberStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>

              {/* Sort By */}
              <select
                value={memberSortBy}
                onChange={(e) => setMemberSortBy(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="date">Sort: Joined Date</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="orders">Sort: Most Orders</option>
                <option value="spend">Sort: Highest Spend</option>
              </select>

              <button
                onClick={() => setMemberSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                title={`Sort order: ${memberSortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Member Name & Contact</th>
                    <th className="py-3.5 px-4">Role & Status</th>
                    <th className="py-3.5 px-4">Company & Location</th>
                    <th className="py-3.5 px-4">Orders & Spend</th>
                    <th className="py-3.5 px-4">Joined / Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto mb-2 text-slate-300 opacity-60" />
                        <p className="text-sm font-bold text-slate-600">
                          {registeredMembers.length === 0 ? 'No Registered Members in Database' : 'No matching members found'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          {registeredMembers.length === 0 
                            ? 'Users are added to this database automatically when they register via Gmail (Google), Facebook, or Phone/Email, or when created manually by Admin.'
                            : 'Try adjusting your search criteria, clearing filters, or click "Add New Member" to register a client manually.'
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member) => {
                      const memberOrders = orders.filter(o => 
                        (o.customerEmail && o.customerEmail.toLowerCase() === member.email.toLowerCase()) ||
                        o.userId === member.id ||
                        o.customerName.toLowerCase() === member.name.toLowerCase()
                      );

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                          {/* Member Name & Contact */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100"
                                />
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                  member.status === 'active' ? 'bg-emerald-500' : member.status === 'pending' ? 'bg-amber-500' : member.status === 'suspended' ? 'bg-red-500' : 'bg-slate-400'
                                }`} />
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <span>{member.name}</span>
                                  {member.role === 'admin' && (
                                    <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-1.5 py-0.2 rounded-sm uppercase">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <a href={`mailto:${member.email}`} className="hover:underline text-slate-600 font-semibold">
                                    {member.email}
                                  </a>
                                </div>
                                {member.phone && (
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-2.5 h-2.5 text-slate-400" />
                                    <span>{member.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role & Status */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                member.role === 'admin'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : member.role === 'manager'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                <ShieldCheck className="w-3 h-3" />
                                {member.role === 'admin' ? 'Administrator' : member.role === 'manager' ? 'Staff / Manager' : 'Customer'}
                              </span>
                              <div>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  member.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : member.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : member.status === 'suspended'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-slate-50 text-slate-700 border border-slate-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    member.status === 'active' ? 'bg-emerald-500' : member.status === 'pending' ? 'bg-amber-500' : member.status === 'suspended' ? 'bg-red-500' : 'bg-slate-400'
                                  }`} />
                                  {member.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Company & Location */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                <Building className="w-3 h-3 text-slate-400" />
                                <span>{member.companyName || 'Individual Client'}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{member.city || 'Nairobi'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Orders & Spend */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <button
                                onClick={() => setViewMemberOrdersModal(member)}
                                className="font-extrabold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Package className="w-3 h-3" />
                                <span>{memberOrders.length || member.ordersCount || 0} Orders Placed</span>
                              </button>
                              <div className="text-[11px] font-extrabold text-emerald-600">
                                KSh {(member.totalSpend || memberOrders.reduce((s, o) => s + o.totalAmount, 0)).toLocaleString()}
                              </div>
                            </div>
                          </td>

                          {/* Joined / Activity */}
                          <td className="py-3.5 px-4 text-[11px] text-slate-500">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 font-semibold text-slate-700">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{new Date(member.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Auth: <span className="uppercase font-semibold">{member.provider || 'email'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Order History */}
                              <button
                                onClick={() => setViewMemberOrdersModal(member)}
                                title="View Member Orders"
                                className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Member */}
                              <button
                                onClick={() => handleOpenEdit(member)}
                                title="Edit Member Profile"
                                className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Member */}
                              <button
                                onClick={() => setMemberToDelete(member)}
                                title="Remove Member from Database"
                                className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <div>
                Showing <span className="font-bold text-slate-800">{filteredMembers.length}</span> of <span className="font-bold text-slate-800">{registeredMembers.length}</span> registered members
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Database Engine: Firebase Firestore</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ORDERS DATABASE */}
      {/* ========================================================================= */}
      {activeSection === 'orders' && (
        <div className="space-y-4">
          {/* Order Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by Order ID, customer, phone, location..."
                className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
              />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="all">All Order Statuses ({orders.length})</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Artwork Approved">Artwork Approved</option>
                <option value="In Printing">In Printing</option>
                <option value="Quality Check">Quality Check</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>

              <button
                onClick={() => exportDatabaseCombinedToExcel(registeredMembers, orders)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Orders (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order ID & Date</th>
                    <th className="py-3.5 px-4">Registered Customer</th>
                    <th className="py-3.5 px-4">Items & Specification</th>
                    <th className="py-3.5 px-4">Total & Payment</th>
                    <th className="py-3.5 px-4">Production Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Package className="w-10 h-10 mx-auto mb-2 text-slate-300 opacity-60" />
                        <p className="text-sm font-bold text-slate-600">No database orders found</p>
                        <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Order ID & Date */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-blue-600">#{order.id}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {order.createdAt}
                          </div>
                        </td>

                        {/* Registered Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{order.customerName}</span>
                            {order.isRegisteredUser && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-sm uppercase">
                                Registered
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{order.customerPhone}</span>
                          </div>
                          {order.customerEmail && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-2.5 h-2.5 text-slate-400" />
                              <span>{order.customerEmail}</span>
                            </div>
                          )}
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">
                            {order.items.length} Product(s)
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {order.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                          </div>
                        </td>

                        {/* Total & Payment */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">
                            KSh {order.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{order.paymentStatus || 'Paid'} ({order.paymentMethod || 'M-Pesa'})</span>
                          </div>
                        </td>

                        {/* Production Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'Out for Delivery'
                              ? 'bg-purple-100 text-purple-800'
                              : order.orderStatus === 'Printing & Production'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {order.orderStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderDetail(order)}
                              title="View Full Order Details"
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setOrderToDelete(order)}
                              title="Delete Order from Database"
                              className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD REGISTERED MEMBER */}
      {/* ========================================================================= */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Add New Registered Member</h3>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Wanjiku"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sarah@company.co.ke"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number (M-Pesa)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+254712345678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Tech Safari Ltd"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    City / Delivery Hub
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Nairobi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Account Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="user">Customer (Standard User)</option>
                    <option value="manager">Staff / Production Manager</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="active">Active (Verified)</option>
                    <option value="pending">Pending Verification</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Registration Source
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="manual">Manual Admin Entry</option>
                    <option value="email">Direct Web Registration</option>
                    <option value="google">Google Workspace OAuth</option>
                    <option value="facebook">Meta / Facebook</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Admin Internal Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. VIP bulk printing client, eligible for 10% corporate discounts."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Save Member to Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT REGISTERED MEMBER */}
      {/* ========================================================================= */}
      {showEditMemberModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Edit Member Profile: {selectedMember.name}</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditMemberModal(false);
                  setSelectedMember(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditMemberSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Account Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="user">Customer (Standard User)</option>
                    <option value="manager">Staff / Production Manager</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="active">Active (Verified)</option>
                    <option value="pending">Pending Verification</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Member ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedMember.id}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Admin Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add notes about this member..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditMemberModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW MEMBER ORDERS HISTORY */}
      {/* ========================================================================= */}
      {viewMemberOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={viewMemberOrdersModal.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={viewMemberOrdersModal.name}
                  className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                />
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-2">
                    <span>{viewMemberOrdersModal.name}</span>
                    <span className="text-xs text-amber-400 font-normal">({viewMemberOrdersModal.email})</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lifetime Spend: <span className="text-emerald-400 font-bold">KSh {(viewMemberOrdersModal.totalSpend || 0).toLocaleString()}</span> • Joined {new Date(viewMemberOrdersModal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewMemberOrdersModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-96 overflow-y-auto space-y-3">
              {(() => {
                const memberOrders = orders.filter(o => 
                  (o.customerEmail && o.customerEmail.toLowerCase() === viewMemberOrdersModal.email.toLowerCase()) ||
                  o.userId === viewMemberOrdersModal.id ||
                  o.customerName.toLowerCase() === viewMemberOrdersModal.name.toLowerCase()
                );

                if (memberOrders.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400">
                      <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold text-slate-600">No orders recorded for this member yet.</p>
                    </div>
                  );
                }

                return memberOrders.map((ord) => (
                  <div key={ord.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-600 text-xs">#{ord.id}</span>
                      <span className="text-[11px] font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        KSh {ord.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700">
                      {ord.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Status: <strong className="text-slate-800">{ord.orderStatus}</strong></span>
                      <span>{ord.createdAt}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewMemberOrdersModal(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELETE MEMBER */}
      {/* ========================================================================= */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-red-600 text-white flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-white shrink-0" />
              <div>
                <h3 className="font-extrabold text-base">Remove Registered Member?</h3>
                <p className="text-xs text-red-100 mt-0.5">This action will delete the member record from Firestore.</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900">{memberToDelete.name}</strong> (<span className="text-slate-700 font-mono">{memberToDelete.email}</span>) from the registered database?
              </p>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold">⚠️ Warning:</p>
                <p>The member's login credentials, permissions, and profile record will be deleted from the database.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMember}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Remove Member</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELETE ORDER */}
      {/* ========================================================================= */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-red-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-red-600 text-white flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-white shrink-0" />
              <div>
                <h3 className="font-extrabold text-base">Delete Order #{orderToDelete.id}?</h3>
                <p className="text-xs text-red-100 mt-0.5">Permanent database removal</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to delete order <strong className="text-slate-900">#{orderToDelete.id}</strong> placed by <strong className="text-slate-900">{orderToDelete.customerName}</strong> (KSh {orderToDelete.totalAmount.toLocaleString()})?
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOrder}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-red-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ORDER DETAILS */}
      {/* ========================================================================= */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Order #{selectedOrderDetail.id} Details</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Customer:</span>
                  <p className="font-bold text-slate-900">{selectedOrderDetail.customerName}</p>
                  <p className="text-slate-600">{selectedOrderDetail.customerPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Delivery:</span>
                  <p className="font-bold text-slate-900">{selectedOrderDetail.deliveryCity}</p>
                  <p className="text-slate-600">{selectedOrderDetail.deliveryAddress}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Order Items:</span>
                <div className="space-y-2">
                  {selectedOrderDetail.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-900">{it.product.name} (x{it.quantity})</p>
                        {it.customization?.instructions && (
                          <p className="text-[10px] text-slate-500">Instructions: {it.customization.instructions}</p>
                        )}
                        {it.customization?.selectedSize && (
                          <p className="text-[10px] text-slate-500">Size: {it.customization.selectedSize}</p>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">
                        KSh {(it.calculatedPrice || (it.product.price * it.quantity)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between font-extrabold text-sm text-emerald-900">
                <span>Grand Total Paid:</span>
                <span>KSh {selectedOrderDetail.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
