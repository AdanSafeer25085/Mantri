import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { projectsApi, stocksApi, materialsApi, activitiesApi, tasksApi } from "../lib/supabase";

export default function GanttChart({ projectId: propProjectId, daysFilter: propDaysFilter, minimal = false }) {
  const [projectData, setProjectData] = useState(null);
  const [, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null); // ✅ For modal
  const [daysFilter] = useState(7); // Default to 7 days
  const location = useLocation();
  const projectId = propProjectId || location.state?.projectId;
const [stockCheck, setStockCheck] = useState(null); // store stock details
const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

  // Add comprehensive filters
  const [filter, setFilter] = useState({
    fromDate: "",
    toDate: "",
    searchTerm: "",
    activity: "",
    minProgress: "",
    maxProgress: ""
  });

  // Use prop daysFilter if provided, otherwise use internal state
  const activeDaysFilter = propDaysFilter !== undefined ? propDaysFilter : daysFilter;

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!projectId) {
          setLoading(false);
          return;
        }
        const projectData = await projectsApi.getById(projectId);
        let activitiesData = await activitiesApi.getAll(projectId);
        const tasksData = await tasksApi.getAll();

        // If no activities exist, create a demo activity
        if (!activitiesData || activitiesData.length === 0) {
          activitiesData = [{
            id: 'demo-activity',
            title: 'Demo Activity',
            description: 'This is a demo activity to show the Gantt Chart'
          }];
        }

        // Group tasks by activity and add fallback properties
        const activitiesWithTasks = (activitiesData || []).map(activity => {
          const activityTasks = tasksData.filter(task =>
            task.activity_id === activity.id ||
            task.activity?.id === activity.id
          ).map(task => {
            // Create realistic fallback dates
            const now = new Date();
            const defaultStartDate = task.startDate || task.start_date || task.created_at || now;
            const defaultEndDate = task.endDate || task.end_date || task.updated_at || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

            return {
              // Copy existing task properties
              ...task,
              // Add fallback properties if missing
              title: task.title || task.name || `Task for ${activity.title}`,
              startDate: defaultStartDate,
              endDate: defaultEndDate,
              materials: task.materials || [],
              days: task.days || 7,
              performance: task.performance || 50
            };
          });

          // If no tasks exist for this activity, create a demo task so something shows up
          if (activityTasks.length === 0) {
            const now = new Date();
            activityTasks.push({
              id: `demo-${activity.id}`,
              title: `Demo task for ${activity.title}`,
              startDate: now,
              endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              materials: [],
              days: 7,
              performance: 50,
              activity_id: activity.id
            });
          }

          return {
            ...activity,
            tasks: activityTasks
          };
        });

        // Combine project data with activities
        const combinedData = {
          ...projectData,
          projectDetails: {
            activities: activitiesWithTasks
          }
        };

        console.log("✅ Fetched project data:", projectData);
        console.log("✅ Fetched activities data:", activitiesData);
        console.log("✅ Fetched tasks data:", tasksData);
        console.log("✅ Combined data:", combinedData);

        setProjectData(combinedData);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setProjectData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [projectId]);
const handleCheckStock = async (task) => {
  try {
    // Fetch both stocks AND materials to resolve IDs to names
    const rawStocksData = await stocksApi.getAll();
    const rawMaterialsData = await materialsApi.getAll();

    const stocksData = Array.isArray(rawStocksData) ? rawStocksData : [];
    const materialsData = Array.isArray(rawMaterialsData) ? rawMaterialsData : [];

    // Use EXACT same logic as StockManagement.jsx
    const pickTitle = (x) => (x?.title || x?.name || x?.label || x?.fullName || "");

    const resolveRef = (value, map) => {
      if (!value) return "";
      if (typeof value === "object") {
        const title = pickTitle(value);
        if (title) return title;
        if (value.id && map[value.id]) return map[value.id];
        return "";
      }
      if (map[value]) return map[value];
      return value;
    };

    // Build materials map like StockManagement does
    const materialsMap = {};
    materialsData.forEach((x) => {
      if (x?.id) materialsMap[x.id] = pickTitle(x) || "Untitled";
    });

    console.log("Materials map:", materialsMap);

    const vendorsMap = {};
    const contractorsMap = {};

    // Process stocks EXACTLY like StockManagement does
    const stocks = stocksData.map((doc, idx) => {
      // Extract material name directly - handle all possible formats
      let materialName = "";

      if (typeof doc.material === "string") {
        materialName = doc.material;
      } else if (doc.material && typeof doc.material === "object") {
        materialName = doc.material.title || doc.material.name || doc.material.label || doc.material.fullName || "";
      }

      // If still empty, try other approaches
      if (!materialName) {
        materialName = resolveRef(doc.material, materialsMap);
      }

      const vendorName = resolveRef(doc.vendor, vendorsMap);
      const contractorName = resolveRef(doc.contractor, contractorsMap);

      console.log("Processing raw stock entry:", {
        original: doc.material,
        materialName: materialName,
        quantity: doc.quantity,
        type: doc.type,
        materialType: typeof doc.material,
        materialKeys: doc.material && typeof doc.material === 'object' ? Object.keys(doc.material) : 'not object',
        fullMaterialObject: doc.material
      });

      return {
        id: doc.id,
        sequence: idx + 1,
        date: doc.date,
        project: doc.project || "-",
        material: materialName || "-",
        type: doc.type || "-",
        vendorName: vendorName || "",
        contractorName: contractorName || "",
        quantity: doc.quantity ?? "-",
        stock: doc.stock ?? "-",
      };
    });

    // Calculate stocks EXACTLY like StockManagement does
    const materialTotals = {};
    const calculatedStocks = stocks
      .sort((a, b) => {
        const parseDate = (dateStr) => {
          if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [dd, mm, yy] = dateStr.split("/");
            return new Date(`${yy}-${mm}-${dd}`);
          }
          return new Date(dateStr);
        };
        return parseDate(a.date) - parseDate(b.date);
      })
      .map((entry, idx) => {
        const material = entry.material;

        if (!materialTotals[material]) {
          materialTotals[material] = { stock: 0, totalInward: 0, totalOutward: 0 };
        }

        const qty = Number(entry.quantity || 0);

        if (entry.type === "Inward") {
          materialTotals[material].stock += qty;
          materialTotals[material].totalInward += qty;
        } else if (entry.type === "Outward") {
          materialTotals[material].stock -= qty;
          materialTotals[material].totalOutward += qty;
        }

        return {
          ...entry,
          sequence: idx + 1,
          stock: materialTotals[material].stock,
          totalInward: materialTotals[material].totalInward,
          totalOutward: materialTotals[material].totalOutward,
        };
      });

    console.log("Calculated stocks (same as StockManagement):", calculatedStocks);
    console.log("Material totals:", materialTotals);

    // Now match with task materials
    const materialStatus = task.materials.map((m) => {
      const materialStock = materialTotals[m.material]?.stock || 0;

      console.log(`Looking for material "${m.material}":`, {
        found: !!materialTotals[m.material],
        stock: materialStock,
        availableMaterials: Object.keys(materialTotals)
      });

      return {
        material: m.material,
        required: m.qty,
        available: materialStock,
        status: materialStock >= m.qty ? "✅ Sufficient" : "❌ Insufficient",
      };
    });

    setStockCheck({ taskTitle: task.title, materials: materialStatus });
  } catch (e) {
    console.error(e);
    setStockCheck({ taskTitle: task.title, materials: [] });
  }
};

  /*
  // Generate rows for a specific activity, filter by days
  const generateRowsForActivity = (activity) => {
    const rows = [];
    let taskCounter = 1;
    const now = new Date();
    const endFilterDate = new Date(now.getTime() + activeDaysFilter * 24 * 60 * 60 * 1000);

    activity.tasks?.forEach((task) => {
      if (task.startDate && task.endDate) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        // Only include tasks that start within the next 'daysFilter' days or are currently running
        if (
          (startDate <= endFilterDate && startDate >= now) ||
          (startDate <= now && endDate >= now)
        ) {
          // Calculate progress based on current date
          const today = now;
          let progress = 0;
          if (today >= endDate) {
            progress = 100;
          } else if (today >= startDate) {
            const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
            const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
            const calculatedProgress = Math.min(Math.round((elapsedDays / totalDays) * 100), 100);
            progress = calculatedProgress;
          }
          // Duration from input days or calculated
          const duration = task.days
            ? parseInt(task.days)
            : Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          // Use input performance or calculate default
          const performance = task.performance ? parseInt(task.performance) : 50;
          // Resources from materials - show actual material values
          const resources =
            task.materials?.length > 0
              ? task.materials.map((m) => `${m.material} (${m.qty})`).join(", ")
              : "No materials";
          rows.push([
            `Task${taskCounter}`,
            task.title,
            resources,
            startDate,
            endDate,
            duration * 24 * 60 * 60 * 1000,
            performance,
            null,
          ]);
          taskCounter++;
        }
      }
    });
    return rows;
  };
  */

  // Get activities with valid tasks
  const getActivitiesWithTasks = () => {
    if (!projectData?.projectDetails?.activities) {
      console.log("No projectDetails.activities found");
      return [];
    }

    console.log("Project details activities:", projectData.projectDetails.activities);

    const validActivities = projectData.projectDetails.activities.filter((activity) => {
      const hasValidTasks = activity.tasks?.some((task) => {
        console.log("Checking task:", task);
        return task.startDate && task.endDate;
      });
      console.log(`Activity ${activity.title} has valid tasks:`, hasValidTasks);
      return hasValidTasks;
    });

    console.log("Valid activities:", validActivities);
    return validActivities;
  };

  const activitiesWithTasks = getActivitiesWithTasks();

  // Custom Gantt chart bar colors
  const getBarColor = (percent) => {
    if (percent >= 67) return "#44cc44"; // High
    if (percent >= 34) return "#ffaa00"; // Medium
    return "#ff4444"; // Low
  };
const handleDateFilter = () => {
  if (!fromDate || !toDate) {
    alert("Please select both From and To dates");
    return;
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);

  // ✅ Filter activities/tasks based on date range
  if (projectData?.project_details?.activities) {
    const filtered = projectData.project_details.activities.filter((activity) =>
      activity.tasks?.some((task) => {
        if (!task.startDate) return false;
        const taskDate = new Date(task.startDate);
        return taskDate >= from && taskDate <= to;
      })
    );

    setProjectData(prevData => ({
      ...prevData,
      project_details: {
        ...prevData.project_details,
        activities: filtered
      }
    }));
  }
};

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilter({
      fromDate: "",
      toDate: "",
      searchTerm: "",
      activity: "",
      minProgress: "",
      maxProgress: ""
    });
  };

  // Custom Gantt chart renderer
  function CustomGanttChart({ activities }) {
    // Flatten all tasks based on daysFilter
    const now = new Date();
    const endFilterDate = new Date(now.getTime() + activeDaysFilter * 24 * 60 * 60 * 1000);
    let allTasks = [];
    activities.forEach((activity) => {
      activity.tasks?.forEach((task) => {
        if (task.startDate && task.endDate) {
          const startDate = new Date(task.startDate);
          const endDate = new Date(task.endDate);
          // Only include tasks that start within the next 'daysFilter' days or are currently running
          if (
            (startDate <= endFilterDate && startDate >= now) ||
            (startDate <= now && endDate >= now)
          ) {
            // Calculate progress
            let progress = 0;
            if (now >= endDate) progress = 100;
            else if (now >= startDate) {
              const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
              const elapsedDays = (now - startDate) / (1000 * 60 * 60 * 24);
              progress = Math.min(Math.round((elapsedDays / totalDays) * 100), 100);
            }
            allTasks.push({
              title: task.title,
              startDate,
              endDate,
              progress,
              resources:
                task.materials?.length > 0
                  ? task.materials.map((m) => `${m.material} (${m.qty})`).join(", ")
                  : "No materials",
              materials: task.materials || [],
              activity: activity.title,
            });
          }
        }
      });
    });

    // Apply comprehensive filters
    const filteredTasks = allTasks.filter((task) => {
      // Date filter
      if (filter.fromDate) {
        const fromDate = new Date(filter.fromDate);
        if (task.startDate < fromDate) return false;
      }
      if (filter.toDate) {
        const toDate = new Date(filter.toDate);
        if (task.startDate > toDate) return false;
      }

      // Search filter (task title)
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        if (!task.title?.toLowerCase().includes(searchLower)) return false;
      }

      // Activity filter
      if (filter.activity && task.activity !== filter.activity) return false;

      // Progress range filter
      if (filter.minProgress && task.progress < parseInt(filter.minProgress)) return false;
      if (filter.maxProgress && task.progress > parseInt(filter.maxProgress)) return false;

      return true;
    });

    allTasks = filteredTasks;

    if (allTasks.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Nothing is present here.
        </div>
      );
    }

    // Find min/max date for chart scale
    const minDate = new Date(Math.min(...allTasks.map((t) => t.startDate.getTime())));
    const maxDate = new Date(Math.max(...allTasks.map((t) => t.endDate.getTime())));
    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

    // Helper to get left offset and width for a bar
    const dayWidth = 32; // px per day
    const getBarStyle = (start, end) => {
      const left = ((start - minDate) / (1000 * 60 * 60 * 24)) * dayWidth;
      const width = ((end - start) / (1000 * 60 * 60 * 24) + 1) * dayWidth;
      return { left, width };
    };

    // Render day headers
    const daysArray = Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(minDate.getTime() + i * 24 * 60 * 60 * 1000);
      return d;
    });

    // Add some extra width for the right button column (so button does not overlap)
    const extraRightSpace = 240; // px for right button column and padding
    const containerMinWidth = `${totalDays * dayWidth + extraRightSpace}px`;

    return (
      <div className="overflow-x-auto border rounded-lg p-2 sm:p-4 bg-white">
        <div style={{ minWidth: containerMinWidth }}>
          {/* Day headers with vertical grid */}
          <div className="flex border-b pb-2 mb-2 relative" style={{ minHeight: 32 }}>
            <div className="w-48 text-xs font-bold text-gray-700">Task</div>
            {daysArray.map((d, idx) => (
              <div
                key={idx}
                className="w-8 text-xs text-gray-500 text-center border-l border-gray-200"
              >
                {d.getDate()}
              </div>
            ))}
            {/* Right spacer so headers align with button column */}
            <div className="w-28 flex-shrink-0" />
            {/* Vertical grid lines */}
            <div
              className="absolute left-48 top-0 h-full w-full pointer-events-none"
              style={{ zIndex: 0 }}
            >
              {daysArray.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    left: idx * dayWidth,
                    width: 0,
                    borderLeft: "1px solid #e5e7eb",
                    position: "absolute",
                    height: "100%",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Task bars with alternating backgrounds and tooltips */}
          {allTasks.map((task, idx) => {
            const { left, width } = getBarStyle(task.startDate, task.endDate);
            return (
              <div
                key={idx}
                className={`flex items-center relative ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                } rounded-lg mb-2`}
                style={{ height: 64 }}
              >
                {/* Label column */}
                <div className="w-48 pr-2 text-sm text-gray-800 font-medium py-2">
                  <div>{task.title}</div>
                  <div className="text-xs text-gray-500">{task.activity}</div>
                </div>

                {/* Timeline column */}
                <div
                  className="relative flex-1"
                  style={{ height: 64 }}
                >
                  {/* Inner timeline sized to totalDays (keeps bars and headers aligned) */}
                  <div style={{ position: "relative", minWidth: `${totalDays * dayWidth}px`, height: "100%" }}>
                    <div
                      className="absolute rounded-full shadow-lg group cursor-pointer"
                      style={{
                        left,
                        width,
                        height: 32,
                        background: getBarColor(task.progress),
                        opacity: 0.92,
                        transition: "width 0.3s",
                        top: 16,
                        zIndex: 2,
                      }}
                    >
                      <span className="absolute left-2 top-1 text-xs text-white font-bold">
                        {task.progress}%
                      </span>

                      {/* Tooltip - multi-line */}
                      <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 -top-24 bg-gray-900 text-white text-xs rounded px-3 py-2 z-10 whitespace-pre-line text-left w-max max-w-xs">
                        <div><strong>Task:</strong> {task.title}</div>
                        <div><strong>Activity:</strong> {task.activity}</div>
                        <div><strong>Materials:</strong></div>
                        {task.materials.length > 0 ? (
                          task.materials.map((m, i) => (
                            <div key={i} className="pl-2">- {m.material}: {m.qty}</div>
                          ))
                        ) : (
                          <div className="pl-2">No materials</div>
                        )}
                        <div><strong>Progress:</strong> {task.progress}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Button column (fixed width, does not overlap the bar) */}
                <div className="w-45 flex-shrink-0 flex items-center justify-center pr-2">
                  <button
                    className="bg-blue-500 text-white text-xs px-3 py-1 rounded shadow hover:bg-blue-600"
                    onClick={() => setSelectedTask(task)}
                  >
                    View Details
                  </button>
                    <button
    className="bg-green-500 text-white text-xs px-3 py-1 ml-5 rounded shadow hover:bg-green-600"
    onClick={() => handleCheckStock(task)}
  >
    Check Stock
  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (activitiesWithTasks.length === 0 || !projectData) {
    return (
      <div className="px-3 sm:px-6 py-4 text-center text-gray-500">
        Nothing is present here.
      </div>
    );
  }

  // Minimal mode for use in reports (just the chart)
  if (minimal) {
    return <CustomGanttChart activities={activitiesWithTasks} />;
  }

  // Full mode for standalone page
  return (
    <div className="px-3 sm:px-6 py-4 space-y-6 sm:space-y-8 max-w-full lg:max-w-[1000px] mx-auto">
      <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 break-words">
        Gantt Chart - {projectData?.name || "Project Timeline"}
      </h2>



      {/* Project Info */}
      {projectData && (
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-700">
            <strong>Project:</strong> {projectData.name} | <strong>Location:</strong>{" "}
            {projectData.location} | <strong>Status:</strong> {projectData.status}
          </p>
        </div>
      )}
      <div className="bg-white shadow-lg rounded-2xl p-3 sm:p-6">
        <h3 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">
          Project Timeline (Gantt Chart)
        </h3>

        {/* Comprehensive Filters */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">🔍 Filters</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                name="fromDate"
                value={filter.fromDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">To Date</label>
              <input
                type="date"
                name="toDate"
                value={filter.toDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Search Tasks</label>
              <input
                type="text"
                name="searchTerm"
                value={filter.searchTerm}
                onChange={handleFilterChange}
                placeholder="Task title..."
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Activity</label>
              <select
                name="activity"
                value={filter.activity}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Activities</option>
                {activitiesWithTasks.map((activity) => (
                  <option key={activity.title} value={activity.title}>{activity.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Min Progress (%)</label>
              <input
                type="number"
                name="minProgress"
                value={filter.minProgress}
                onChange={handleFilterChange}
                placeholder="0"
                min="0"
                max="100"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Max Progress (%)</label>
              <input
                type="number"
                name="maxProgress"
                value={filter.maxProgress}
                onChange={handleFilterChange}
                placeholder="100"
                min="0"
                max="100"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={resetFilters}
              className="bg-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-400 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Days Filter Input - Only show if no prop provided */}
        {propDaysFilter === undefined && (
          <div className="mb-4 sm:mb-6">
            <label htmlFor="daysFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Show next (days):
            </label>
            <div className="flex items-center gap-2">
  <input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />

  <span className="text-sm">to</span>

  <input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />

  <button
    onClick={handleDateFilter}
    className="bg-blue-500 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-600 transition"
  >
    Filter
  </button>
</div>
          </div>
        )}
        <CustomGanttChart activities={activitiesWithTasks} />
      </div>

      {/* ✅ Modal for View Details */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-96 relative border border-gray-200">
    <h3 className="text-xl font-bold mb-4 text-gray-800">Task Details</h3>

    <div className="space-y-2 text-gray-700">
      <p><strong>Task:</strong> {selectedTask.title}</p>
      <p><strong>Activity:</strong> {selectedTask.activity}</p>
      <p><strong>Progress:</strong> {selectedTask.progress}%</p>

      <div>
        <strong>Materials:</strong>
        {selectedTask.materials.length > 0 ? (
          <ul className="list-disc list-inside mt-1">
            {selectedTask.materials.map((m, i) => (
              <li key={i}>{m.material}: {m.qty}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No materials</p>
        )}
      </div>
    </div>

    <button
      className="mt-6 w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:from-red-600 hover:to-red-700 transition"
      onClick={() => setSelectedTask(null)}
    >
      Close
    </button>
  </div>
</div>
      )}
      {stockCheck && (
  <>
    {/* Print Styles for Stock Check */}
    <style jsx>{`
      @media print {
        body * { visibility: hidden; }
        .stock-print-area, .stock-print-area * { visibility: visible; }
        .stock-print-area {
          position: fixed;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
          padding: 20px;
        }
        .no-print { display: none !important; }
        .print-only { display: block !important; }
      }
      .print-only { display: none; }
    `}</style>

    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-96 relative border border-gray-200 stock-print-area">
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          Stock Check - {stockCheck.taskTitle}
        </h3>

        {/* Print header - only visible during print */}
        <div className="print-only mb-4 border-b pb-2">
          <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">Project: {projectData?.name || 'N/A'}</p>
        </div>

        {stockCheck.materials.length > 0 ? (
          <ul className="space-y-2 text-gray-700 text-sm">
            {stockCheck.materials.map((m, i) => (
              <li
                key={i}
                className="flex justify-between items-center border-b pb-1"
              >
                <span>{m.material} (Req: {m.required})</span>
                <span className={m.status.includes("✅") ? "text-green-600" : "text-red-600"}>
                  {m.available} | {m.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No materials found.</p>
        )}

        <div className="flex gap-2 mt-6">
          <button
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:from-blue-700 hover:to-indigo-700 transition no-print"
            onClick={() => window.print()}
          >
            📄 Print / Save as PDF
          </button>
          <button
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:from-green-600 hover:to-green-700 transition no-print"
            onClick={() => setStockCheck(null)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </>
)}

    </div>
  );
}
