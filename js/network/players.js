const PLAYERS = {

  generateDeviceId() {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substr(2, 12);
      localStorage.setItem('device_id', id);
    }
    return id;
  },

  async join(supabase, roomCode, playerName, color) {
    const deviceId = this.generateDeviceId();

    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', roomCode)
      .eq('device_id', deviceId)
      .single();

    if (existing) return existing;

    const { data, error } = await supabase
      .from('players')
      .insert({
        room_code: roomCode,
        device_id: deviceId,
        name: playerName,
        color: color,
        status: 'waiting',
        is_host: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async list(supabase, roomCode) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', roomCode)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data;
  }

};
