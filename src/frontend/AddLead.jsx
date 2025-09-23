import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { leadsApi } from "../lib/supabase";

export default function AddLead() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;
  const editId = location.state?.editId;
  const [lead, setLead] = useState({
    fullName: "",
    contactNo: "",
    nextVisit: "",
    visitDate: "",
    note: "",
    leadType: "",
    isConverted: false,
    aadharNo: "",
    address: "",
    unitNo: "",
    amount: "",
  });

  const [convertedLeads, setConvertedLeads] = useState([]);

  // Fetch all converted leads
  const fetchConvertedLeads = async () => {
    try {
      const data = await leadsApi.getAll();
      const converted = data.filter(lead => lead.isConverted);
      setConvertedLeads(converted);
    } catch (err) {
      console.error("Error fetching converted leads:", err);
    }
  };

  useEffect(() => {
    fetchConvertedLeads();
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await leadsApi.getAll();
        const src = data.find(lead => lead.id === editId);
        if (src) {
          setLead({
            fullName: src.fullName || "",
            contactNo: src.contactNo || "",
            nextVisit: src.nextVisit ? src.nextVisit.substring(0,10) : "",
            visitDate: src.visitDate ? src.visitDate.substring(0,10) : "",
            note: src.note || "",
            leadType: src.leadType || "",
            isConverted: Boolean(src.isConverted),
            aadharNo: src.aadharNo || "",
            address: src.address || "",
            unitNo: src.unitNo || "",
            amount: src.amount || "",
          });
        }
      } catch (error) {
        console.error("Error loading lead:", error);
        alert("Failed to load lead for editing");
      }
    })();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLead((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const leadData = {
        ...lead,
        project_id: projectId
      };

      if (editId) {
        await leadsApi.update(editId, leadData);
        alert(`✅ Lead updated successfully!`);
      } else if (lead.isConverted) {
        // Convert lead to customer
        await leadsApi.convertToCustomer(leadData);
        alert(`✅ Lead "${lead.fullName}" converted to Customer successfully!`);
      } else {
        await leadsApi.create(leadData);
        alert(`✅ Lead "${lead.fullName}" added successfully!`);
      }

      setLead({
        fullName: "",
        contactNo: "",
        nextVisit: "",
        visitDate: "",
        note: "",
        leadType: "",
        isConverted: false,
        aadharNo: "",
        address: "",
        unitNo: "",
        amount: "",
      });

      if (lead.isConverted) fetchConvertedLeads();
      // After save, go back to list
      navigate("/dashboard/leads", { state: { projectId } });
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("❌ Failed to save lead. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 sm:py-12 px-4">
      {/* Add Lead Form */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8 sm:mb-12">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {editId ? "Edit Lead" : "Add New Lead"}
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Fill out the form below to add a new lead
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Full Name */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={lead.fullName}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Contact No */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Contact No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactNo"
              value={lead.contactNo}
              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Visit Dates */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
        Preset Visit Date
            </label>
            <input
              type="date"
              name="visitDate"
              value={lead.visitDate}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Next Visit Date
            </label>
            <input
              type="date"
              name="nextVisit"
              value={lead.nextVisit}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Note */}
          <div className="sm:col-span-2">
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Note
            </label>
            <input
              type="text"
              name="note"
              value={lead.note}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Lead Type */}
          <div>
            <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
              Lead Type
            </label>
            <select
              name="leadType"
              value={lead.leadType}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Lead Type</option>
              <option value="Cold">Cold</option>
              <option value="Warm">Moderate</option>
              <option value="Hot">Hot</option>
            </select>
          </div>

          {/* Converted Checkbox */}
          <div className="flex items-center space-x-2 sm:col-span-2">
            <input
              type="checkbox"
              name="isConverted"
              checked={lead.isConverted}
              onChange={handleChange}
              className="w-4 h-4 border-gray-300 rounded"
            />
            <label className="text-sm sm:text-base font-medium text-gray-600">Is Converted</label>
          </div>

          {/* Extra Customer Fields */}
          {lead.isConverted && (
            <>
              <div>
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                  Aadhar No
                </label>
                <input
                  type="text"
                  name="aadharNo"
                  value={lead.aadharNo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={lead.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                  Unit No
                </label>
                <input
                  type="text"
                  name="unitNo"
                  value={lead.unitNo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1 sm:mb-2 text-sm font-medium text-gray-600">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={lead.amount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200">
              {lead.isConverted ? "Convert to Customer" : "Add Lead"}
            </button>
          </div>
        </form>
      </div>

      {/* Converted Leads Table */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Converted Leads</h2>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-4">
          {convertedLeads.length > 0 ? (
            convertedLeads.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Name:</span> {c.fullName}</div>
                  <div><span className="font-medium">Contact:</span> {c.contactNo}</div>
                  <div><span className="font-medium">Aadhar:</span> {c.aadharNo}</div>
                  <div><span className="font-medium">Unit:</span> {c.unitNo}</div>
                  <div><span className="font-medium">Amount:</span> {c.amount}</div>
                  <div><span className="font-medium">Type:</span> {c.leadType}</div>
                  <div className="col-span-2"><span className="font-medium">Address:</span> {c.address}</div>
                  <div><span className="font-medium">Visit:</span> {c.visitDate ? new Date(c.visitDate).toLocaleDateString() : "-"}</div>
                  <div><span className="font-medium">Next:</span> {c.nextVisit ? new Date(c.nextVisit).toLocaleDateString() : "-"}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No converted leads found
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Full Name</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Contact No</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Aadhar No</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Address</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Unit No</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Amount</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Visit Date</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Next Visit</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Lead Type</th>
              </tr>
            </thead>
            <tbody>
              {convertedLeads.length > 0 ? (
                convertedLeads.map((c) => (
                  <tr key={c.id} className="text-center">
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.fullName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.contactNo}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.aadharNo}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.address}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.unitNo}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.amount}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.visitDate
                        ? new Date(c.visitDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.nextVisit
                        ? new Date(c.nextVisit).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {c.leadType}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No converted leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
