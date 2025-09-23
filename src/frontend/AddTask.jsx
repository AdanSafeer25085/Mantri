import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTasks} from "react-icons/fa";
import { activitiesApi, tasksApi } from "../lib/supabase";

export default function AddTask() {
  const [activities, setActivities] = useState([]);
  const [activity, setActivity] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const editId = location.state?.editId;

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activitiesApi.getAll();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };
    fetchActivities();
  }, []);

  // Prefill on edit
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await tasksApi.getByActivity(); // Get all tasks and find the one we need
        const task = data.find(t => t.id === editId);
        if (task) {
          setActivity(task.activity?.id || task.activity || "");
          setTitle(task.title || "");
          setStatus(task.status || "");
        }
      } catch (error) {
        console.error("Error loading task:", error);
        alert("Failed to load task for editing");
      }
    })();
  }, [editId]);

  // Save Task API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const taskData = {
        activity_id: activity,
        title,
        status
      };

      if (editId) {
        await tasksApi.update(editId, taskData);
        console.log("Task updated");
      } else {
        const newTask = await tasksApi.create(taskData);
        console.log("Task saved:", newTask);
      }

      // redirect back to task dashboard
      navigate("/dashboard/task");
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Error saving task");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-start justify-center py-6 sm:py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex flex-col sm:flex-row items-center justify-center gap-2">
            <FaTasks className="text-blue-600" />
            <span className="text-center">MANTRI CONSTRUCTIONS</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Add a new task to your dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Activity Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Activity</label>
            <div className="relative">
             
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full pl-10 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                required
              >
                <option value="" disabled>
                  Select activity
                </option>
                {activities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Title</label>
            <div className="relative">
             
              <input
                type="text"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm sm:text-base">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
              required
            >
              <option value="" disabled>
                Select status
              </option>
              <option>Active</option>
              <option>Deactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between mt-4 sm:mt-6 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/task")}
              className="w-full sm:flex-1 px-4 py-2 sm:py-3 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              {editId ? "Save Changes" : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
