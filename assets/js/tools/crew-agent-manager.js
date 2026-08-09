async function executeTool(inputs) {
  try {
    const { agent_name, persona_description, skill_tags } = inputs;

    // Validate inputs
    if (!agent_name || typeof agent_name !== 'string') {
      throw new Error('Invalid or missing agent_name. Must be a non-empty string.');
    }

    if (!persona_description || typeof persona_description !== 'string') {
      throw new Error('Missing persona_description. Required to define agent personality.');
    }

    // Process skill tags - convert array or comma-separated string
    let processed_tags = [];
    if (Array.isArray(skill_tags)) {
      processed_tags = Array.from(new Set(skill_tags)).filter(t => typeof t === 'string').map(s => s.trim()).filter(Boolean);
    } else if (typeof skill_tags === 'string') {
      processed_tags = skill_tags.split(',').map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')).filter(Boolean);
    }

    // Generate unique ID for this agent
    const timestamp = Date.now();
    const safe_agent_name = encodeURIComponent(agent_name);
    const id_prefix = 'crew-agent';
    let next_id;

    // Get existing agents from localStorage
    let stored_agents = JSON.parse(localStorage.getItem('crewAgents_v1') || '{}');

    // Generate ID based on agent name and timestamp to avoid collisions
    next_id = `${id_prefix}_${safe_agent_name.replace(/[^a-z0-9]/gi, '')}_v${timestamp.toString().slice(-4)}`;

    while (stored_agents[next_id]) {
      const suffix = new Date(timestamp).getMilliseconds();
      timestamp += 1;
      next_id = `${id_prefix}_${safe_agent_name.replace(/[^a-z0-9]/gi, '')}_v${timestamp.toString().slice(-4)}_${suffix}`;
    }

    // Create agent configuration object
    const config = {
      id: next_id,
      name: safe_agent_name,
      persona_description: persona_description.trim(),
      skill_tags: processed_tags.length > 0 ? processed_tags : ['generalist'],
      created_at: new Date().toISOString(),
      status: 'active',
      manifest_version: '1.0'
    };

    // Save to localStorage (merge strategy)
    stored_agents[next_id] = config;
    Object.freeze(config);  // Make immutable after creation for consistency
    localStorage.setItem('crewAgents_v1', JSON.stringify(stored_agents));

    const result_config = { ...config, _immutable: true };
    delete result_config._immutable;

    return {
      success: true,
      message: 'Crew agent persona registered successfully!',
      data: config
    };
  } catch (error) {
    console.error('Agent Manager error:', error.message);
    return {
      success: false,
      result: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      code:
        /invalid/i.test(error?.message || '') ? 400 :
          /^[A-Z]/.test(error.message) ? 502 :
            /storage/.test(error?.stack || error?.message) ? 507 : 500
    };
  }
}