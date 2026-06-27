const ROOM = {

  generateCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)];
    for (let i = 0; i < 2; i++) code += digits[Math.floor(Math.random() * digits.length)];
    return code;
  },

  async create(supabase, hostId) {
    let code;
    let attempts = 0;

    while (attempts < 10) {
      code = this.generateCode();
      const { data } = await supabase
        .from('rooms')
        .select('code')
        .eq('code', code)
        .single();

      if (!data) break;
      attempts++;
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code: code,
        host_id: hostId,
        status: 'waiting',
        player_count: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async get(supabase, code) {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (error) throw error;
    return data;
  }

};
