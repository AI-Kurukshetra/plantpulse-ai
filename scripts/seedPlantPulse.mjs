import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const projectRoot = process.cwd();
const envFiles = ['.env.local', '.env'].map((file) => path.join(projectRoot, file));

for (const envFile of envFiles) {
  if (!fs.existsSync(envFile)) {
    continue;
  }

  const contents = fs.readFileSync(envFile, 'utf8');
  for (const line of contents.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the seed script.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false
  }
});

const adminEmail = 'admin@plantpulse.ai';
const adminPassword = 'admin123';

async function ensureRoleMap() {
  const { data, error } = await supabase.from('roles').select('id, name');

  if (error || !data) {
    throw error ?? new Error('Unable to load roles.');
  }

  return new Map(data.map((role) => [role.name, role.id]));
}

async function ensureAdminUser() {
  const existingUsers = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw error;
    }

    existingUsers.push(...data.users);

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  let adminUser = existingUsers.find((user) => user.email === adminEmail) ?? null;

  if (!adminUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      app_metadata: {
        role: 'admin',
        seeded_admin: true
      },
      email: adminEmail,
      email_confirm: true,
      password: adminPassword,
      user_metadata: {
        full_name: 'PlantPulse Administrator',
        role: 'admin',
        seeded_admin: true
      }
    });

    if (error || !data.user) {
      throw error ?? new Error('Unable to create admin user.');
    }

    adminUser = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(adminUser.id, {
      app_metadata: {
        role: 'admin',
        seeded_admin: true
      },
      email_confirm: true,
      password: adminPassword,
      user_metadata: {
        full_name: 'PlantPulse Administrator',
        role: 'admin',
        seeded_admin: true
      }
    });

    if (error) {
      throw error;
    }
  }

  return adminUser.id;
}

async function ensurePlant() {
  const plantName = 'PlantPulse Demo Plant';
  const { data: existingPlant } = await supabase
    .from('plants')
    .select('id')
    .eq('name', plantName)
    .maybeSingle();

  if (existingPlant) {
    const { error } = await supabase
      .from('plants')
      .update({
        location: 'Pune, India',
        target_oee: 88,
        timezone: 'Asia/Kolkata'
      })
      .eq('id', existingPlant.id);

    if (error) {
      throw error;
    }

    return existingPlant.id;
  }

  const { data, error } = await supabase
    .from('plants')
    .insert({
      location: 'Pune, India',
      name: plantName,
      target_oee: 88,
      timezone: 'Asia/Kolkata'
    })
    .select('id')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to create plant.');
  }

  return data.id;
}

async function clearPlantData(plantId) {
  const { data: equipmentRows, error: equipmentError } = await supabase
    .from('equipment')
    .select('id')
    .eq('plant_id', plantId);

  if (equipmentError) {
    throw equipmentError;
  }

  const equipmentIds = equipmentRows?.map((row) => row.id) ?? [];

  if (equipmentIds.length) {
    const { data: sensorRows, error: sensorError } = await supabase
      .from('sensors')
      .select('id')
      .in('equipment_id', equipmentIds);

    if (sensorError) {
      throw sensorError;
    }

    const sensorIds = sensorRows?.map((row) => row.id) ?? [];

    if (sensorIds.length) {
      const { error } = await supabase.from('measurements').delete().in('sensor_id', sensorIds);
      if (error) {
        throw error;
      }
    }

    const deletes = [
      supabase.from('maintenance_schedules').delete().in('equipment_id', equipmentIds),
      supabase.from('alerts').delete().in('equipment_id', equipmentIds),
      supabase.from('energy_consumption').delete().in('equipment_id', equipmentIds),
      supabase.from('emissions').delete().in('equipment_id', equipmentIds),
      supabase.from('sensors').delete().in('equipment_id', equipmentIds),
      supabase.from('equipment').delete().in('id', equipmentIds)
    ];

    for (const operation of deletes) {
      const { error } = await operation;
      if (error) {
        throw error;
      }
    }
  }

  const plantScopedDeletes = [
    supabase.from('alerts').delete().eq('plant_id', plantId),
    supabase.from('energy_consumption').delete().eq('plant_id', plantId),
    supabase.from('emissions').delete().eq('plant_id', plantId)
  ];

  for (const operation of plantScopedDeletes) {
    const { error } = await operation;
    if (error) {
      throw error;
    }
  }
}

async function seedProfiles(adminUserId, plantId, roleMap) {
  const { error } = await supabase
    .from('profiles')
    .update({
      email: adminEmail,
      full_name: 'PlantPulse Administrator',
      plant_id: plantId,
      role_id: roleMap.get('admin')
    })
    .eq('id', adminUserId);

  if (error) {
    throw error;
  }
}

async function seedOperationalData(plantId) {
  const equipmentSeed = [
    {
      category: 'Compressor',
      health_score: 93,
      installed_at: '2024-01-15T08:00:00Z',
      name: 'Air Compression Unit A',
      service_interval_hours: 2400,
      status: 'running'
    },
    {
      category: 'CNC',
      health_score: 81,
      installed_at: '2024-02-01T08:00:00Z',
      name: 'CNC Milling Cell 02',
      service_interval_hours: 1800,
      status: 'maintenance'
    },
    {
      category: 'Boiler',
      health_score: 88,
      installed_at: '2024-03-10T08:00:00Z',
      name: 'Steam Boiler West',
      service_interval_hours: 2200,
      status: 'idle'
    }
  ];

  const insertedEquipment = [];

  for (const equipment of equipmentSeed) {
    const { data, error } = await supabase
      .from('equipment')
      .insert({
        ...equipment,
        plant_id: plantId
      })
      .select('id, name')
      .single();

    if (error || !data) {
      throw error ?? new Error(`Unable to insert equipment ${equipment.name}.`);
    }

    insertedEquipment.push(data);
  }

  const sensorTemplates = {
    Boiler: [
      ['temperature', 'C', 'Shell temperature'],
      ['vibration', 'mm/s', 'Casing vibration'],
      ['runtime', 'hours', 'Runtime counter'],
      ['energy', 'kWh', 'Energy meter'],
      ['emissions', 'kgCO2', 'Exhaust emissions']
    ],
    CNC: [
      ['temperature', 'C', 'Spindle temperature'],
      ['vibration', 'mm/s', 'Spindle vibration'],
      ['runtime', 'hours', 'Runtime counter'],
      ['energy', 'kWh', 'Energy meter'],
      ['emissions', 'kgCO2', 'Indirect emissions']
    ],
    Compressor: [
      ['temperature', 'C', 'Outlet temperature'],
      ['vibration', 'mm/s', 'Bearing vibration'],
      ['runtime', 'hours', 'Runtime counter'],
      ['energy', 'kWh', 'Energy meter'],
      ['emissions', 'kgCO2', 'Indirect emissions']
    ]
  };

  const sensorIdsByEquipment = new Map();

  for (const equipment of insertedEquipment) {
    const family = equipment.name.includes('Compressor')
      ? 'Compressor'
      : equipment.name.includes('CNC')
        ? 'CNC'
        : 'Boiler';
    const sensorIds = [];

    for (const [sensorType, unit, label] of sensorTemplates[family]) {
      const { data, error } = await supabase
        .from('sensors')
        .insert({
          equipment_id: equipment.id,
          label,
          sensor_type: sensorType,
          unit
        })
        .select('id, sensor_type')
        .single();

      if (error || !data) {
        throw error ?? new Error(`Unable to insert sensor ${label}.`);
      }

      sensorIds.push(data);
    }

    sensorIdsByEquipment.set(equipment.id, sensorIds);
  }

  const now = Date.now();

  for (const equipment of insertedEquipment) {
    const sensors = sensorIdsByEquipment.get(equipment.id) ?? [];

    for (const sensor of sensors) {
      const baseValue =
        sensor.sensor_type === 'temperature'
          ? equipment.name.includes('CNC')
            ? 74
            : 62
          : sensor.sensor_type === 'vibration'
            ? equipment.name.includes('CNC')
              ? 4.2
              : 2.8
            : sensor.sensor_type === 'runtime'
              ? equipment.name.includes('Compressor')
                ? 1860
                : 1320
              : sensor.sensor_type === 'energy'
                ? equipment.name.includes('Boiler')
                  ? 980
                  : 640
                : 145;

      const measurementRows = Array.from({ length: 4 }, (_, index) => ({
        recorded_at: new Date(now - index * 60 * 60 * 1000).toISOString(),
        sensor_id: sensor.id,
        value: Number((baseValue + index * 1.7).toFixed(3))
      }));

      const { error } = await supabase.from('measurements').insert(measurementRows);
      if (error) {
        throw error;
      }
    }
  }

  const energyRows = insertedEquipment.flatMap((equipment, equipmentIndex) =>
    Array.from({ length: 4 }, (_, index) => ({
      equipment_id: equipment.id,
      measured_at: new Date(now - index * 6 * 60 * 60 * 1000).toISOString(),
      plant_id: plantId,
      production_units: 210 + equipmentIndex * 25 - index * 8,
      usage_kwh: Number((420 + equipmentIndex * 55 + index * 18).toFixed(3))
    }))
  );

  const emissionsRows = energyRows.map((row, index) => ({
    carbon_factor: 0.42 + (index % 2) * 0.03,
    energy_kwh: row.usage_kwh,
    equipment_id: row.equipment_id,
    measured_at: row.measured_at,
    plant_id: row.plant_id
  }));

  const alertRows = [
    {
      acknowledged: false,
      description: 'Spindle vibration exceeded the maintenance threshold for two consecutive windows.',
      equipment_id: insertedEquipment[1].id,
      plant_id: plantId,
      severity: 'critical',
      source: 'predictive_maintenance',
      title: 'CNC spindle anomaly'
    },
    {
      acknowledged: false,
      description: 'Steam output dropped below expected baseline during the last shift.',
      equipment_id: insertedEquipment[2].id,
      plant_id: plantId,
      severity: 'warning',
      source: 'energy_optimization',
      title: 'Boiler efficiency drift'
    },
    {
      acknowledged: true,
      description: 'Compressor service recommendation generated after elevated runtime hours.',
      equipment_id: insertedEquipment[0].id,
      plant_id: plantId,
      severity: 'info',
      source: 'predictive_maintenance',
      title: 'Compressor service window'
    }
  ];

  const maintenanceRows = [
    {
      equipment_id: insertedEquipment[1].id,
      notes: 'Inspect spindle bearings and lubrication line.',
      scheduled_for: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      service_interval_hours: 1800,
      status: 'scheduled'
    }
  ];

  for (const [table, rows] of [
    ['energy_consumption', energyRows],
    ['emissions', emissionsRows],
    ['alerts', alertRows],
    ['maintenance_schedules', maintenanceRows]
  ]) {
    const { error } = await supabase.from(table).insert(rows);
    if (error) {
      throw error;
    }
  }
}

async function main() {
  const roleMap = await ensureRoleMap();
  const adminUserId = await ensureAdminUser();
  const plantId = await ensurePlant();

  await clearPlantData(plantId);
  await seedProfiles(adminUserId, plantId, roleMap);
  await seedOperationalData(plantId);

  console.log(`Seeded PlantPulse AI demo data.`);
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
