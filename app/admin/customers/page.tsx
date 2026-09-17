"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Filter,
  DollarSign,
  Calendar,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  UserCheck,
  Check,
} from "lucide-react";
import { AdminCustomer } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatDisplayDate(dateVal?: string | null): string {
  if (!dateVal) return "—";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "—";
    return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return "—";
  }
}

export default function AdminCustomersPage() {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [ordersFilter, setOrdersFilter] = useState("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<AdminCustomer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<AdminCustomer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "customer",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all customers from API with ignore cancellation flag
  useEffect(() => {
    let ignore = false;
    async function loadCustomers() {
      try {
        const res = await fetch("/api/admin/customers");
        const data = await res.json();
        if (!ignore && res.ok && data.customers) {
          setCustomers(data.customers);
        } else if (!ignore && !res.ok) {
          throw new Error(data.error || "Failed to load customers");
        }
      } catch (err: unknown) {
        if (!ignore) {
          error(err instanceof Error ? err.message : "Failed to load customer list.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCustomers();
    return () => {
      ignore = true;
    };
  }, [error, refreshTrigger]);

  const refreshCustomers = () => setRefreshTrigger((prev) => prev + 1);

  // Reset form
  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      role: "customer",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
    });
  };

  // Open Edit Modal
  const openEditModal = (customer: AdminCustomer) => {
    setEditingCustomer(customer);
    const addr = customer.primary_address;
    setFormData({
      full_name: customer.full_name || "",
      email: customer.email,
      phone: customer.phone || addr?.phone || "",
      role: customer.role || "customer",
      address_line1: addr?.address_line1 || "",
      address_line2: addr?.address_line2 || "",
      city: addr?.city || "",
      state: addr?.state || "",
      postal_code: addr?.postal_code || "",
      country: addr?.country || "India",
    });
  };

  // Handle Save (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      error("Email address is required.");
      return;
    }

    try {
      setSubmitting(true);
      const isEditing = Boolean(editingCustomer);
      const url = isEditing
        ? `/api/admin/customers/${editingCustomer!.id}`
        : `/api/admin/customers`;
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        address: {
          address_line1: formData.address_line1.trim(),
          address_line2: formData.address_line2.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postal_code: formData.postal_code.trim(),
          country: formData.country.trim(),
          phone: formData.phone.trim(),
          full_name: formData.full_name.trim(),
        },
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save customer.");
      }

      success(
        isEditing
          ? `Customer "${formData.full_name || formData.email}" updated successfully.`
          : `New customer "${formData.full_name || formData.email}" added.`
      );

      setIsAddOpen(false);
      setEditingCustomer(null);
      resetForm();
      refreshCustomers();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to save customer details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Customer
  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/admin/customers/${deletingCustomer.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete customer");
      }

      success(`Customer "${deletingCustomer.full_name || deletingCustomer.email}" removed.`);
      setDeletingCustomer(null);
      refreshCustomers();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error deleting customer profile.");
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const buyers = customers.filter((c) => c.total_orders > 0).length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgSpend = buyers > 0 ? totalRevenue / buyers : 0;
    return { total, buyers, totalRevenue, avgSpend };
  }, [customers]);

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const addr = c.primary_address;
      const matchesSearch =
        !query ||
        c.full_name?.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        addr?.city?.toLowerCase().includes(query) ||
        addr?.state?.toLowerCase().includes(query) ||
        addr?.address_line1?.toLowerCase().includes(query);

      // Role filter
      const matchesRole =
        roleFilter === "all" || c.role === roleFilter;

      // Orders filter
      const matchesOrders =
        ordersFilter === "all" ||
        (ordersFilter === "buyers" && c.total_orders > 0) ||
        (ordersFilter === "no-orders" && c.total_orders === 0);

      return matchesSearch && matchesRole && matchesOrders;
    });
  }, [customers, searchQuery, roleFilter, ordersFilter]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8E5DE] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">
              Directory & CRM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#0E0E0E]">
            Customers Management
          </h1>
          <p className="text-xs sm:text-sm text-[#73706A] mt-1">
            Browse registered clients, inspect delivery addresses, and track real-time order volume.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0E0E0E] hover:bg-[#242321] text-white text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm rounded-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C5A880]" />
          Add Customer
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#E8E5DE] p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold block mb-1">
              Total Customers
            </span>
            <div className="text-2xl font-serif text-[#0E0E0E]">{metrics.total}</div>
            <span className="text-[11px] text-[#73706A]">Registered accounts</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E8E5DE] flex items-center justify-center text-[#0E0E0E]">
            <Users className="w-5 h-5 text-[#C5A880]" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E5DE] p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold block mb-1">
              Active Buyers
            </span>
            <div className="text-2xl font-serif text-[#0E0E0E]">{metrics.buyers}</div>
            <span className="text-[11px] text-[#73706A]">
              {metrics.total > 0
                ? `${Math.round((metrics.buyers / metrics.total) * 100)}% conversion`
                : "No customers yet"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E8E5DE] flex items-center justify-center text-[#0E0E0E]">
            <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E5DE] p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold block mb-1">
              Total Order Spend
            </span>
            <div className="text-2xl font-serif text-[#0E0E0E]">
              {formatPrice(metrics.totalRevenue)}
            </div>
            <span className="text-[11px] text-[#73706A]">Across all orders</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E8E5DE] flex items-center justify-center text-[#0E0E0E]">
            <DollarSign className="w-5 h-5 text-[#C5A880]" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E5DE] p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold block mb-1">
              Avg. Spend / Buyer
            </span>
            <div className="text-2xl font-serif text-[#0E0E0E]">
              {formatPrice(metrics.avgSpend)}
            </div>
            <span className="text-[11px] text-[#73706A]">Customer lifetime value</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E8E5DE] flex items-center justify-center text-[#0E0E0E]">
            <UserCheck className="w-5 h-5 text-[#C5A880]" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E8E5DE] p-4 rounded-sm shadow-sm flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#73706A]" />
          <input
            type="text"
            placeholder="Search by name, email, phone, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] placeholder:text-[#73706A] focus:outline-none focus:border-[#0E0E0E] transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#73706A]" />
            <span className="text-xs text-[#73706A] font-medium">Filter:</span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Admins Only</option>
          </select>

          <select
            value={ordersFilter}
            onChange={(e) => setOrdersFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm text-xs text-[#0E0E0E] focus:outline-none focus:border-[#0E0E0E]"
          >
            <option value="all">All Order Counts</option>
            <option value="buyers">Has Orders (1+)</option>
            <option value="no-orders">No Orders (0)</option>
          </select>

          {(searchQuery || roleFilter !== "all" || ordersFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setOrdersFilter("all");
              }}
              className="text-xs text-[#C5A880] hover:underline font-medium px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white border border-[#E8E5DE] rounded-sm shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin" />
            <p className="text-xs text-[#73706A] uppercase tracking-widest">
              Loading Customers...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Users className="w-12 h-12 text-[#E8E5DE] mx-auto mb-3" />
            <h3 className="text-base font-serif text-[#0E0E0E] mb-1">
              No Customers Found
            </h3>
            <p className="text-xs text-[#73706A] max-w-sm mx-auto mb-6">
              {customers.length === 0
                ? "No registered customers in the database yet. New accounts created via website registration or Google OAuth will appear here automatically."
                : "No customers match your search criteria. Try modifying your filters."}
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsAddOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E0E0E] text-white text-xs uppercase tracking-widest font-semibold rounded-sm hover:bg-[#242321]"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
              Add Customer Manually
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#E8E5DE] text-[10px] uppercase tracking-widest text-[#73706A] font-bold">
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Primary Delivery Address</th>
                  <th className="py-3.5 px-4 text-center">Orders Placed</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-4 sm:pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DE] text-xs">
                {filteredCustomers.map((customer) => {
                  const addr = customer.primary_address;
                  const initials = (customer.full_name || customer.email || "C")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-[#FAF9F6]/60 transition-colors group"
                    >
                      {/* Customer Profile */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0E0E0E] text-[#FAF9F6] font-bold flex items-center justify-center text-xs shrink-0 border border-[#C5A880]/30 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#0E0E0E]">
                                {customer.full_name || "Unnamed Client"}
                              </span>
                              {customer.role === "admin" && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider bg-[#C5A880]/20 text-[#8F7449] border border-[#C5A880]/40">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#73706A] block font-mono">
                              ID: {customer.id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details (Email & Phone) */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[#0E0E0E]">
                            <Mail className="w-3.5 h-3.5 text-[#73706A] shrink-0" />
                            <a
                              href={`mailto:${customer.email}`}
                              className="hover:text-[#C5A880] transition-colors truncate max-w-[180px] block"
                              title={customer.email}
                            >
                              {customer.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#73706A]">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {customer.phone || addr?.phone || (
                                <span className="italic text-[#A8A59E]">Not provided</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Primary Delivery Address */}
                      <td className="py-4 px-4 max-w-[260px]">
                        {addr && (addr.address_line1 || addr.city) ? (
                          <div className="space-y-0.5">
                            <div className="flex items-start gap-1 text-[#0E0E0E]">
                              <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                              <span className="line-clamp-1 font-medium">
                                {addr.address_line1}
                                {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#73706A] pl-4">
                              {addr.city}, {addr.state} {addr.postal_code}
                            </div>
                            <div className="text-[10px] text-[#A8A59E] pl-4 uppercase tracking-wider font-semibold">
                              {addr.country || "India"}
                              {customer.addresses && customer.addresses.length > 1 && (
                                <span className="ml-2 text-[#C5A880] font-normal">
                                  (+{customer.addresses.length - 1} more)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#A8A59E] italic text-[11px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#E8E5DE]" />
                            No address on file
                          </span>
                        )}
                      </td>

                      {/* Total Orders Placed */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              customer.total_orders > 0
                                ? "bg-[#0E0E0E] text-white"
                                : "bg-[#FAF9F6] text-[#73706A] border border-[#E8E5DE]"
                            }`}
                          >
                            {customer.total_orders}{" "}
                            {customer.total_orders === 1 ? "Order" : "Orders"}
                          </span>
                          {customer.total_spent > 0 && (
                            <span className="text-[11px] font-semibold text-[#8F7449] mt-1">
                              {formatPrice(customer.total_spent)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-4 px-4 text-[#73706A] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#A8A59E]" />
                          <span>{formatDisplayDate(customer.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="p-1.5 text-[#73706A] hover:text-[#0E0E0E] hover:bg-[#FAF9F6] border border-transparent hover:border-[#E8E5DE] rounded-sm transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCustomer(customer)}
                            className="p-1.5 text-[#73706A] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-sm transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddOpen || Boolean(editingCustomer)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingCustomer(null);
          resetForm();
        }}
        title={editingCustomer ? "Edit Customer Profile" : "Add New Customer"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Personal Info */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold block mb-3">
              Personal Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lady Genevieve Vance"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="client@luxury.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-[#E8E5DE]" />

          {/* Customer Address Info */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#73706A] font-bold block mb-3">
              Delivery / Shipping Address
            </span>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Street Address Line 1
                </label>
                <input
                  type="text"
                  placeholder="e.g. 45 Grand Promenade, Residence 8B"
                  value={formData.address_line1}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line1: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Apartment, suite, tower"
                  value={formData.address_line2}
                  onChange={(e) =>
                    setFormData({ ...formData, address_line2: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Mumbai / London"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="400001"
                    value={formData.postal_code}
                    onChange={(e) =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0E0E0E] mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="India"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E8E5DE] rounded-sm focus:outline-none focus:border-[#0E0E0E]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E5DE]">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setIsAddOpen(false);
                setEditingCustomer(null);
                resetForm();
              }}
              className="px-4 py-2 text-xs text-[#73706A] hover:text-[#0E0E0E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E0E0E] hover:bg-[#242321] text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                  {editingCustomer ? "Update Customer" : "Create Customer"}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog Modal */}
      <Modal
        isOpen={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        title="Delete Customer Profile"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-sm text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold block">Permanent Deletion</span>
              <p className="leading-relaxed">
                Are you sure you want to delete profile for{" "}
                <strong>
                  {deletingCustomer?.full_name || deletingCustomer?.email}
                </strong>
                ?
              </p>
              <p className="text-[11px] text-rose-700">
                Their saved delivery addresses will be removed. Existing order financial records will remain preserved with detached user reference.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E5DE]">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setDeletingCustomer(null)}
              className="px-4 py-2 text-xs text-[#73706A] hover:text-[#0E0E0E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Confirm Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
