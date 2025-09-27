import { createClient } from '@supabase/supabase-js';

// Use environment variables - REQUIRED for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations

// Projects
export const projectsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Activities
export const activitiesApi = {
  async getAll(projectId = null) {
    let query = supabase
      .from('activities')
      .select('*')
      .order('title');

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(activity) {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Tasks
export const tasksApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        activity:activities(*)
      `)
      .order('title');
    if (error) throw error;
    return data;
  },

  async getByActivity(activityId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('activity_id', activityId)
      .order('title');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        activity:activities(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Materials
export const materialsApi = {
  async getByActivity(activityId, projectId = null) {
    let query = supabase
      .from('materials')
      .select(`
        *,
        unit:units(*)
      `)
      .eq('activity_id', activityId)
      .order('name');

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getAll(projectId = null) {
    let query = supabase
      .from('materials')
      .select(`
        *,
        unit:units(*),
        activity:activities(*)
      `)
      .order('name');

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('materials')
      .select(`
        *,
        unit:units(*),
        activity:activities(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(material) {
    const { data, error } = await supabase
      .from('materials')
      .insert(material)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Units
export const unitsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(unit) {
    const { data, error } = await supabase
      .from('units')
      .insert(unit)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Vendors
export const vendorsApi = {
  async getAll(projectId = null) {
    let query = supabase
      .from('vendors')
      .select('*')
      .order('name');

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(vendor) {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Contractors
export const contractorsApi = {
  async getAll(projectId = null) {
    let query = supabase
      .from('contractors')
      .select(`
        *,
        activity:activities(*)
      `)
      .order('name');

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByActivity(activityId, projectId = null) {
    let query = supabase
      .from('contractors')
      .select('*')
      .eq('activity_id', activityId)
      .order('name');

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('contractors')
      .select(`
        *,
        activity:activities(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(contractor) {
    const { data, error } = await supabase
      .from('contractors')
      .insert(contractor)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('contractors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('contractors')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Customers
export const customersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        project:projects(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Leads
export const leadsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        project:projects(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(lead) {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async convertToCustomer(leadData) {
    // Create customer from lead data
    const customerData = {
      datetime: new Date().toISOString(),
      full_name: leadData.full_name,
      primary_contact: leadData.contact_no,
      secondary_contact: leadData.secondary_contact || null,
      aadhar_no: leadData.aadhar_no,
      address: leadData.address,
      unit_no: leadData.unit_no,
      amount: leadData.amount,
      project_id: leadData.project_id
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// Stocks
export const stocksApi = {
  async getAll(projectId = null) {
    let query = supabase
      .from('stocks')
      .select(`
        *,
        material:materials(*),
        vendor:vendors(*),
        contractor:contractors(*)
      `)
      .order('date', { ascending: false });

    // Filter by project if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByProject(projectName) {
    const { data, error } = await supabase
      .from('stocks')
      .select(`
        *,
        material:materials(*),
        vendor:vendors(*),
        contractor:contractors(*)
      `)
      .eq('project', projectName)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('stocks')
      .select(`
        *,
        material:materials(*),
        vendor:vendors(*),
        contractor:contractors(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(stock) {
    const { data, error } = await supabase
      .from('stocks')
      .insert(stock)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('stocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('stocks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Finance
export const financesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('finances')
      .select(`
        *,
        project:projects(*),
        customer:customers(*),
        contractor:contractors(*),
        vendor:vendors(*)
      `)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('finances')
      .select(`
        *,
        customer:customers(*),
        contractor:contractors(*),
        vendor:vendors(*)
      `)
      .eq('project_id', projectId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('finances')
      .select(`
        *,
        project:projects(*),
        customer:customers(*),
        contractor:contractors(*),
        vendor:vendors(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(finance) {
    const { data, error } = await supabase
      .from('finances')
      .insert(finance)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('finances')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('finances')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Users (Authentication)
export const authApi = {
  async signUp(email, password, username, fullName, additionalData = {}) {
    // First create user in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        full_name: fullName,
        password_hash: password, // In production, hash this on server or use Supabase Auth
        status: additionalData.status || 'Active'
      })
      .select()
      .single();

    if (userError) throw userError;
    return userData;
  },

  async signIn(usernameOrEmail, password) {
    // First find the user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', usernameOrEmail)
      .eq('password_hash', password)
      .single();

    // If not found by username, try by email
    if (userError || !user) {
      const result = await supabase
        .from('users')
        .select('*')
        .eq('email', usernameOrEmail)
        .eq('password_hash', password)
        .single();

      user = result.data;
      userError = result.error;
    }

    if (userError || !user) throw new Error('Invalid credentials');

    // Now get admin data separately
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id);

    // Attach admin data to user object
    user.admin = adminData || [];

    return user;
  },

  async getCurrentUser() {
    // Implement based on your session management
    const userId = localStorage.getItem('userId');
    if (!userId) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async signOut() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    localStorage.removeItem('admin');
  },

  async changePassword(userId, currentPassword, newPassword) {
    // First verify current password
    const { data: user, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('password_hash', currentPassword)
      .single();

    if (verifyError || !user) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: newPassword })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// File uploads
export const filesApi = {
  async uploadTechnicalFile(projectId, file, userId) {
    const fileName = `technical/${projectId}/${Date.now()}_${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Save file reference in database
    const { data, error } = await supabase
      .from('technical_files')
      .insert({
        project_id: projectId,
        file_name: file.name,
        file_url: uploadData.path,
        file_type: file.type,
        uploaded_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadLegalFile(projectId, file, userId) {
    const fileName = `legal/${projectId}/${Date.now()}_${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Save file reference in database
    const { data, error } = await supabase
      .from('legal_files')
      .insert({
        project_id: projectId,
        file_name: file.name,
        file_url: uploadData.path,
        file_type: file.type,
        uploaded_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTechnicalFiles(projectId) {
    const { data, error } = await supabase
      .from('technical_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getLegalFiles(projectId) {
    const { data, error } = await supabase
      .from('legal_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteFile(tableName, fileId) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  }
};

// Admins
export const adminsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('admins')
      .select(`
        id,
        user_id,
        job_title,
        mobile,
        status,
        role,
        permissions,
        plain_password,
        created_at,
        updated_at,
        users(
          full_name,
          email,
          username,
          status
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Transform data to match frontend expectations
    return data.map(admin => ({
      id: admin.id,
      user_id: admin.user_id,
      position: admin.job_title,
      mobile: admin.mobile,
      status: admin.status,
      role: admin.role,
      permissions: admin.permissions,
      plain_password: admin.plain_password,
      fullName: admin.users?.full_name,
      name: admin.users?.full_name,
      email: admin.users?.email,
      username: admin.users?.username,
      user_status: admin.users?.status,
      created_at: admin.created_at,
      updated_at: admin.updated_at,
      displayPassword: admin.plain_password || '••••••••'
    }));
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('admins')
      .select(`
        id,
        user_id,
        job_title,
        mobile,
        status,
        role,
        permissions,
        plain_password,
        created_at,
        updated_at,
        users(
          full_name,
          email,
          username,
          status
        )
      `)
      .eq('id', id)
      .single();
    if (error) throw error;

    // Transform data to match frontend expectations
    return {
      id: data.id,
      user_id: data.user_id,
      position: data.job_title,
      mobile: data.mobile,
      status: data.status,
      role: data.role,
      permissions: data.permissions,
      plain_password: data.plain_password,
      fullName: data.users?.full_name,
      name: data.users?.full_name,
      email: data.users?.email,
      username: data.users?.username,
      user_status: data.users?.status,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async create(adminData) {
    const { data, error } = await supabase
      .from('admins')
      .insert({
        user_id: adminData.user_id,
        job_title: adminData.position,
        mobile: adminData.mobile,
        status: adminData.status || 'Active',
        role: adminData.role || 'admin',
        permissions: adminData.permissions || [],
        plain_password: adminData.plain_password
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('admins')
      .update({
        job_title: updates.position,
        mobile: updates.mobile,
        status: updates.status,
        role: updates.role,
        permissions: updates.permissions,
        plain_password: updates.plain_password
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    // First get the admin to find the user_id
    const { data: admin, error: getError } = await supabase
      .from('admins')
      .select('user_id')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Delete the admin record
    const { error: deleteAdminError } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (deleteAdminError) throw deleteAdminError;

    // Optionally delete the user record too
    if (admin.user_id) {
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', admin.user_id);

      if (deleteUserError) console.warn('Could not delete user:', deleteUserError);
    }
  }
};

export default supabase;