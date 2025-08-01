const supabase = require('../config/supabase');

const Asset = {
  async findAll() {
    const { data, error } = await supabase
      .from('assets')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async findByPk(id) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? {
      ...data,
      update: async (values) => {
        const { data: updatedData, error: updateError } = await supabase
          .from('assets')
          .update(values)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        return updatedData;
      },
      destroy: async () => {
        const { error: deleteError } = await supabase
          .from('assets')
          .delete()
          .eq('id', id);
        
        if (deleteError) throw deleteError;
        return true;
      }
    } : null;
  },

  async create(values) {
    // Add timestamps if they don't exist
    const dataToInsert = {
      ...values,
      created_at: values.created_at || new Date().toISOString(),
      updated_at: values.updated_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assets')
      .insert([dataToInsert])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

module.exports = Asset; 