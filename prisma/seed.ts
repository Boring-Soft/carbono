/**
 * Prisma Seed Script
 * Populates database with realistic test data for CARBONO platform
 */

import { PrismaClient, ProjectType, ProjectStatus, AlertSeverity, AlertStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create polygon geometries
function createPolygon(centerLat: number, centerLng: number, sizeKm: number = 5): any {
  const offset = sizeKm / 111; // Rough conversion to degrees
  return {
    type: 'Polygon',
    coordinates: [
      [
        [centerLng - offset, centerLat - offset],
        [centerLng + offset, centerLat - offset],
        [centerLng + offset, centerLat + offset],
        [centerLng - offset, centerLat + offset],
        [centerLng - offset, centerLat - offset],
      ],
    ],
  };
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.projectStatusHistory.deleteMany();
  await prisma.projectDocument.deleteMany();
  await prisma.deforestationAlert.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();

  // ===========================
  // 1. ORGANIZATIONS
  // ===========================
  console.log('Creating organizations...');

  const organizations = await Promise.all([
    // Community Organizations
    prisma.organization.create({
      data: {
        name: 'Comunidad Indigena Tsimane',
        type: 'Community',
        contactEmail: 'tsimane@ejemplo.bo',
        contactPhone: '+591 73123456',
        address: 'San Borja, Beni, Bolivia',
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Territorio Indigeno Multiét nico (TIM)',
        type: 'Community',
        contactEmail: 'tim@ejemplo.bo',
        contactPhone: '+591 73234567',
        address: 'Trinidad, Beni, Bolivia',
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Comunidad Guarani Charagua',
        type: 'Community',
        contactEmail: 'guarani@ejemplo.bo',
        contactPhone: '+591 73345678',
        address: 'Charagua, Santa Cruz, Bolivia',
      },
    }),
    // NGOs
    prisma.organization.create({
      data: {
        name: 'Fundacion Amigos de la Naturaleza (FAN)',
        type: 'NGO',
        contactEmail: 'fan@conservacion.bo',
        contactPhone: '+591 33567890',
        address: 'Santa Cruz, Bolivia',
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Proteccion del Medio Ambiente Tarija (PROMETA)',
        type: 'NGO',
        contactEmail: 'prometa@conservacion.bo',
        contactPhone: '+591 46678901',
        address: 'Tarija, Bolivia',
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Liga de Defensa del Medio Ambiente (LIDEMA)',
        type: 'NGO',
        contactEmail: 'lidema@conservacion.bo',
        contactPhone: '+591 22789012',
        address: 'La Paz, Bolivia',
      },
    }),
    // Government
    prisma.organization.create({
      data: {
        name: 'Gobierno Autonomo Municipal de Rurrenabaque',
        type: 'Government',
        contactEmail: 'rural@gobierno.bo',
        contactPhone: '+591 38890123',
        address: 'Rurrenabaque, Beni, Bolivia',
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Gobierno Autonomo Departamental de Pando',
        type: 'Government',
        contactEmail: 'pando@gobierno.bo',
        contactPhone: '+591 38901234',
        address: 'Cobija, Pando, Bolivia',
      },
    }),
    // Private
    prisma.organization.create({
      data: {
        name: 'Carbono Verde SA',
        type: 'Private',
        contactEmail: 'carbonoverde@empresa.bo',
        contactPhone: '+591 33012345',
        address: 'Santa Cruz, Bolivia',
      },
    }),
    prisma.organization.create({
      data: {
        name: 'EcoBolivia Consulting',
        type: 'Private',
        contactEmail: 'ecobolivia@empresa.bo',
        contactPhone: '+591 22123456',
        address: 'La Paz, Bolivia',
      },
    }),
  ]);

  console.log(`✓ Created ${organizations.length} organizations`);

  // ===========================
  // 2. PROJECTS
  // ===========================
  console.log('Creating projects...');

  const projects = await Promise.all([
    // BENI - REDD+
    prisma.project.create({
      data: {
        name: 'Conservacion Bosque Amazonico Norte',
        type: ProjectType.REDD_PLUS,
        status: ProjectStatus.CERTIFIED,
        description: 'Proyecto de conservacion de bosque primario en la Amazonia boliviana con participacion de comunidades locales',
        organizationId: organizations[0].id,
        department: 'Beni',
        municipality: 'San Borja',
        communities: 'Tsimane, Moseten, San Borja Centro',
        geometry: createPolygon(-14.85, -66.75, 10),
        areaHectares: 45000,
        estimatedCo2TonsYear: 3150000,
        forestCoveragePercent: 92,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-15'),
        startDate: new Date('2023-01-15'),
        durationYears: 30,
        coBenefits: JSON.stringify(['Biodiversidad', 'Agua', 'Empleo local', 'Educacion']),
      },
    }),
    // PANDO - REDD+
    prisma.project.create({
      data: {
        name: 'Proteccion Selva de Pando',
        type: ProjectType.REDD_PLUS,
        status: ProjectStatus.ACTIVE,
        description: 'Conservacion de bosques tropicales y aprovechamiento sostenible de castana',
        organizationId: organizations[7].id,
        department: 'Pando',
        municipality: 'Cobija',
        communities: 'Puerto Rico, Porvenir, Santos Mercado',
        geometry: createPolygon(-11.05, -68.75, 12),
        areaHectares: 62000,
        estimatedCo2TonsYear: 4340000,
        forestCoveragePercent: 95,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-10'),
        startDate: new Date('2023-06-01'),
        durationYears: 25,
        coBenefits: JSON.stringify(['Biodiversidad', 'Empleo local', 'Seguridad alimentaria']),
      },
    }),
    // SANTA CRUZ - Reforestation
    prisma.project.create({
      data: {
        name: 'Reforestacion Chiquitania',
        type: ProjectType.REFORESTATION,
        status: ProjectStatus.CERTIFIED,
        description: 'Recuperacion de areas degradadas en la Chiquitania con especies nativas',
        organizationId: organizations[3].id,
        department: 'Santa Cruz',
        municipality: 'San Ignacio de Velasco',
        communities: 'San Ignacio, San Miguel, San Rafael',
        geometry: createPolygon(-16.37, -60.96, 8),
        areaHectares: 28000,
        estimatedCo2TonsYear: 1400000,
        forestCoveragePercent: 45,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-20'),
        startDate: new Date('2022-08-01'),
        durationYears: 20,
        coBenefits: JSON.stringify(['Biodiversidad', 'Suelo', 'Agua']),
      },
    }),
    // LA PAZ - Community Conservation
    prisma.project.create({
      data: {
        name: 'Conservacion Yungas La Paz',
        type: ProjectType.COMMUNITY_CONSERVATION,
        status: ProjectStatus.ACTIVE,
        description: 'Manejo comunitario de bosques de montana en los Yungas',
        organizationId: organizations[5].id,
        department: 'La Paz',
        municipality: 'Coroico',
        communities: 'Coroico, Caranavi, Coripata',
        geometry: createPolygon(-16.19, -67.73, 7),
        areaHectares: 18500,
        estimatedCo2TonsYear: 1295000,
        forestCoveragePercent: 88,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-18'),
        startDate: new Date('2023-03-15'),
        durationYears: 15,
        coBenefits: JSON.stringify(['Biodiversidad', 'Agua', 'Empleo local', 'Salud']),
      },
    }),
    // COCHABAMBA - Reforestation
    prisma.project.create({
      data: {
        name: 'Reforestacion Parque Tunari',
        type: ProjectType.REFORESTATION,
        status: ProjectStatus.APPROVED,
        description: 'Restauracion ecologica del Parque Nacional Tunari con especies nativas',
        organizationId: organizations[9].id,
        department: 'Cochabamba',
        municipality: 'Cercado',
        communities: 'Tiquipaya, Quillacollo, Sacaba',
        geometry: createPolygon(-17.35, -66.15, 6),
        areaHectares: 12000,
        estimatedCo2TonsYear: 600000,
        forestCoveragePercent: 35,
        geeVerified: false,
        startDate: new Date('2024-01-10'),
        durationYears: 25,
        coBenefits: JSON.stringify(['Agua', 'Suelo', 'Biodiversidad']),
      },
    }),
    // TARIJA - Regenerative Agriculture
    prisma.project.create({
      data: {
        name: 'Agricultura Regenerativa Tarija',
        type: ProjectType.REGENERATIVE_AGRICULTURE,
        status: ProjectStatus.ACTIVE,
        description: 'Sistemas agroforestales y practicas regenerativas en valles de Tarija',
        organizationId: organizations[4].id,
        department: 'Tarija',
        municipality: 'Cercado',
        communities: 'San Lorenzo, Padcaya, Entre Rios',
        geometry: createPolygon(-21.53, -64.73, 5),
        areaHectares: 8500,
        estimatedCo2TonsYear: 340000,
        forestCoveragePercent: 25,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-12'),
        startDate: new Date('2023-09-01'),
        durationYears: 10,
        coBenefits: JSON.stringify(['Suelo', 'Agua', 'Seguridad alimentaria', 'Empleo local']),
      },
    }),
    // CHUQUISACA - REDD+
    prisma.project.create({
      data: {
        name: 'Conservacion Serranias Chuquisaca',
        type: ProjectType.REDD_PLUS,
        status: ProjectStatus.PENDING,
        description: 'Proteccion de bosques secos montanos en las serrannias de Chuquisaca',
        organizationId: organizations[8].id,
        department: 'Chuquisaca',
        municipality: 'Monteagudo',
        communities: 'Monteagudo, Huacareta, Muyupampa',
        geometry: createPolygon(-19.82, -63.95, 7),
        areaHectares: 15000,
        estimatedCo2TonsYear: 750000,
        forestCoveragePercent: 70,
        geeVerified: false,
        startDate: new Date('2024-06-01'),
        durationYears: 20,
        coBenefits: JSON.stringify(['Biodiversidad', 'Agua']),
      },
    }),
    // SANTA CRUZ - REDD+ (Large)
    prisma.project.create({
      data: {
        name: 'Gran Chaco Santa Cruz',
        type: ProjectType.REDD_PLUS,
        status: ProjectStatus.CERTIFIED,
        description: 'Proteccion del bosque chaqueno y sus servicios ecosistemicos',
        organizationId: organizations[2].id,
        department: 'Santa Cruz',
        municipality: 'Charagua',
        communities: 'Charagua, Cabezas, Gutierrez',
        geometry: createPolygon(-20.15, -63.15, 15),
        areaHectares: 95000,
        estimatedCo2TonsYear: 5700000,
        forestCoveragePercent: 85,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-22'),
        startDate: new Date('2022-03-01'),
        durationYears: 30,
        coBenefits: JSON.stringify(['Biodiversidad', 'Empleo local', 'Agua', 'Suelo']),
      },
    }),
    // BENI - Community Conservation
    prisma.project.create({
      data: {
        name: 'Manejo Sostenible TIM',
        type: ProjectType.COMMUNITY_CONSERVATION,
        status: ProjectStatus.ACTIVE,
        description: 'Gestion territorial integrada del Territorio Indigena Multietnico',
        organizationId: organizations[1].id,
        department: 'Beni',
        municipality: 'Trinidad',
        communities: 'Trinidad, San Javier, San Ramon',
        geometry: createPolygon(-14.83, -64.90, 11),
        areaHectares: 55000,
        estimatedCo2TonsYear: 3850000,
        forestCoveragePercent: 90,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-19'),
        startDate: new Date('2023-02-01'),
        durationYears: 25,
        coBenefits: JSON.stringify(['Biodiversidad', 'Agua', 'Empleo local', 'Educacion', 'Salud']),
      },
    }),
    // LA PAZ - Reforestation
    prisma.project.create({
      data: {
        name: 'Reforestacion Alto Beni',
        type: ProjectType.REFORESTATION,
        status: ProjectStatus.APPROVED,
        description: 'Restauracion de corredores biologicos en la region del Alto Beni',
        organizationId: organizations[6].id,
        department: 'La Paz',
        municipality: 'Caranavi',
        communities: 'Caranavi, Alto Beni, Palos Blancos',
        geometry: createPolygon(-15.83, -67.56, 6),
        areaHectares: 14000,
        estimatedCo2TonsYear: 700000,
        forestCoveragePercent: 40,
        geeVerified: false,
        startDate: new Date('2024-02-15'),
        durationYears: 20,
        coBenefits: JSON.stringify(['Biodiversidad', 'Agua', 'Suelo']),
      },
    }),
    // POTOSI - Renewable Energy (Small)
    prisma.project.create({
      data: {
        name: 'Energia Solar Uyuni',
        type: ProjectType.RENEWABLE_ENERGY,
        status: ProjectStatus.PENDING,
        description: 'Instalacion de paneles solares para comunidades rurales del altiplano',
        organizationId: organizations[9].id,
        department: 'Potosi',
        municipality: 'Uyuni',
        communities: 'Uyuni, Colchani, San Cristobal',
        geometry: createPolygon(-20.46, -66.82, 3),
        areaHectares: 2500,
        estimatedCo2TonsYear: 125000,
        geeVerified: false,
        startDate: new Date('2024-08-01'),
        durationYears: 15,
        coBenefits: JSON.stringify(['Energia renovable', 'Empleo local']),
      },
    }),
    // ORURO - Renewable Energy
    prisma.project.create({
      data: {
        name: 'Parque Eolico Oruro',
        type: ProjectType.RENEWABLE_ENERGY,
        status: ProjectStatus.APPROVED,
        description: 'Generacion de energia eolica en el altiplano orureno',
        organizationId: organizations[8].id,
        department: 'Oruro',
        municipality: 'Caracollo',
        communities: 'Caracollo, Oruro, Toledo',
        geometry: createPolygon(-17.68, -67.21, 4),
        areaHectares: 3500,
        estimatedCo2TonsYear: 175000,
        geeVerified: false,
        startDate: new Date('2024-05-01'),
        durationYears: 20,
        coBenefits: JSON.stringify(['Energia renovable', 'Empleo local']),
      },
    }),
    // SANTA CRUZ - Reforestation
    prisma.project.create({
      data: {
        name: 'Recuperacion Bosque Guardiana',
        type: ProjectType.REFORESTATION,
        status: ProjectStatus.ACTIVE,
        description: 'Restauracion de areas afectadas por incendios en la region de Guardiana',
        organizationId: organizations[3].id,
        department: 'Santa Cruz',
        municipality: 'Roboré',
        communities: 'Roboré, Santiago, Chochis',
        geometry: createPolygon(-18.33, -59.76, 8),
        areaHectares: 22000,
        estimatedCo2TonsYear: 1100000,
        forestCoveragePercent: 30,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-21'),
        startDate: new Date('2023-07-01'),
        durationYears: 25,
        coBenefits: JSON.stringify(['Biodiversidad', 'Suelo', 'Agua']),
      },
    }),
    // COCHABAMBA - Community Conservation
    prisma.project.create({
      data: {
        name: 'Conservacion Bosque Chapare',
        type: ProjectType.COMMUNITY_CONSERVATION,
        status: ProjectStatus.CERTIFIED,
        description: 'Manejo sostenible del bosque tropical en la region del Chapare',
        organizationId: organizations[0].id,
        department: 'Cochabamba',
        municipality: 'Villa Tunari',
        communities: 'Villa Tunari, Shinahota, Ivirgarzama',
        geometry: createPolygon(-16.98, -65.41, 9),
        areaHectares: 35000,
        estimatedCo2TonsYear: 2450000,
        forestCoveragePercent: 87,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-17'),
        startDate: new Date('2022-11-01'),
        durationYears: 30,
        coBenefits: JSON.stringify(['Biodiversidad', 'Agua', 'Empleo local', 'Seguridad alimentaria']),
      },
    }),
    // TARIJA - REDD+
    prisma.project.create({
      data: {
        name: 'Conservacion Bosque Chaqueno Tarija',
        type: ProjectType.REDD_PLUS,
        status: ProjectStatus.ACTIVE,
        description: 'Proteccion del bosque chaqueno en la region sur de Bolivia',
        organizationId: organizations[4].id,
        department: 'Tarija',
        municipality: 'Yacuiba',
        communities: 'Yacuiba, Carapari, Villamontes',
        geometry: createPolygon(-22.02, -63.68, 10),
        areaHectares: 42000,
        estimatedCo2TonsYear: 2520000,
        forestCoveragePercent: 80,
        geeVerified: true,
        geeLastCheck: new Date('2024-11-16'),
        startDate: new Date('2023-04-01'),
        durationYears: 25,
        coBenefits: JSON.stringify(['Biodiversidad', 'Empleo local', 'Agua']),
      },
    }),
  ]);

  console.log(`✓ Created ${projects.length} projects`);

  // ===========================
  // 3. STATUS HISTORY
  // ===========================
  console.log('Creating project status history...');

  // Add status changes for some certified projects
  await Promise.all([
    prisma.projectStatusHistory.create({
      data: {
        projectId: projects[0].id,
        fromStatus: ProjectStatus.PENDING,
        toStatus: ProjectStatus.APPROVED,
        notes: 'Aprobado tras revision tecnica inicial',
        createdAt: new Date('2023-02-15'),
      },
    }),
    prisma.projectStatusHistory.create({
      data: {
        projectId: projects[0].id,
        fromStatus: ProjectStatus.APPROVED,
        toStatus: ProjectStatus.CERTIFIED,
        notes: 'Certificado tras verificacion satelital GEE exitosa',
        createdAt: new Date('2023-06-01'),
      },
    }),
    prisma.projectStatusHistory.create({
      data: {
        projectId: projects[2].id,
        fromStatus: ProjectStatus.PENDING,
        toStatus: ProjectStatus.APPROVED,
        notes: 'Aprobado con observaciones menores',
        createdAt: new Date('2022-09-15'),
      },
    }),
    prisma.projectStatusHistory.create({
      data: {
        projectId: projects[2].id,
        fromStatus: ProjectStatus.APPROVED,
        toStatus: ProjectStatus.CERTIFIED,
        notes: 'Certificado - cumple todos los requisitos',
        createdAt: new Date('2023-01-10'),
      },
    }),
  ]);

  console.log('✓ Created status history');

  // ===========================
  // 4. DEFORESTATION ALERTS
  // ===========================
  console.log('Creating deforestation alerts...');

  const alertsData = [
    // High severity - near projects
    { lat: -14.87, lng: -66.78, severity: AlertSeverity.HIGH, projectId: projects[0].id, confidence: 95, brightness: 350.5 },
    { lat: -11.08, lng: -68.78, severity: AlertSeverity.HIGH, projectId: projects[1].id, confidence: 92, brightness: 345.2 },
    { lat: -20.18, lng: -63.18, severity: AlertSeverity.HIGH, projectId: projects[7].id, confidence: 98, brightness: 365.8 },
    { lat: -14.85, lng: -64.93, severity: AlertSeverity.HIGH, projectId: projects[8].id, confidence: 94, brightness: 355.4 },

    // Medium severity
    { lat: -16.40, lng: -60.98, severity: AlertSeverity.MEDIUM, projectId: projects[2].id, confidence: 78, brightness: 320.5 },
    { lat: -16.22, lng: -67.75, severity: AlertSeverity.MEDIUM, projectId: projects[3].id, confidence: 82, brightness: 325.3 },
    { lat: -21.56, lng: -64.75, severity: AlertSeverity.MEDIUM, projectId: projects[5].id, confidence: 75, brightness: 315.8 },
    { lat: -18.35, lng: -59.78, severity: AlertSeverity.MEDIUM, projectId: projects[12].id, confidence: 80, brightness: 322.6 },
    { lat: -17.00, lng: -65.43, severity: AlertSeverity.MEDIUM, projectId: projects[13].id, confidence: 85, brightness: 328.4 },

    // Low severity
    { lat: -16.38, lng: -60.95, severity: AlertSeverity.LOW, projectId: projects[2].id, confidence: 65, brightness: 305.2 },
    { lat: -17.37, lng: -66.17, severity: AlertSeverity.LOW, projectId: projects[4].id, confidence: 68, brightness: 308.5 },
    { lat: -15.85, lng: -67.58, severity: AlertSeverity.LOW, projectId: projects[9].id, confidence: 62, brightness: 302.8 },

    // Alerts without nearby projects (distant locations)
    { lat: -13.50, lng: -68.50, severity: AlertSeverity.MEDIUM, confidence: 80, brightness: 325.0 },
    { lat: -15.20, lng: -66.00, severity: AlertSeverity.LOW, confidence: 70, brightness: 310.0 },
    { lat: -17.00, lng: -64.50, severity: AlertSeverity.HIGH, confidence: 90, brightness: 360.0 },
    { lat: -19.00, lng: -65.00, severity: AlertSeverity.MEDIUM, confidence: 75, brightness: 320.0 },
    { lat: -18.50, lng: -62.00, severity: AlertSeverity.LOW, confidence: 65, brightness: 305.0 },
    { lat: -12.00, lng: -69.00, severity: AlertSeverity.HIGH, confidence: 93, brightness: 355.0 },
    { lat: -16.50, lng: -61.50, severity: AlertSeverity.MEDIUM, confidence: 78, brightness: 318.0 },
    { lat: -21.00, lng: -64.00, severity: AlertSeverity.LOW, confidence: 68, brightness: 307.0 },
  ];

  const alerts = await Promise.all(
    alertsData.map((alert, index) => {
      const detectedAt = new Date();
      detectedAt.setHours(detectedAt.getHours() - Math.floor(Math.random() * 48)); // Random time within last 48 hours

      return prisma.deforestationAlert.create({
        data: {
          latitude: alert.lat,
          longitude: alert.lng,
          severity: alert.severity,
          status: index < 5 ? AlertStatus.NEW : (index < 10 ? AlertStatus.INVESTIGATING : AlertStatus.RESOLVED),
          confidence: alert.confidence,
          brightness: alert.brightness,
          detectedAt,
          nearProjectId: alert.projectId || null,
          notes: alert.projectId ? `Alerta detectada cerca del proyecto ${projects.find(p => p.id === alert.projectId)?.name}` : null,
        },
      });
    })
  );

  console.log(`✓ Created ${alerts.length} deforestation alerts`);

  // ===========================
  // SUMMARY
  // ===========================
  console.log('\n🎉 Seed completed successfully!');
  console.log('\nSummary:');
  console.log(`  📋 Organizations: ${organizations.length}`);
  console.log(`  🌳 Projects: ${projects.length}`);
  console.log(`     - CERTIFIED: ${projects.filter(p => p.status === 'CERTIFIED').length}`);
  console.log(`     - ACTIVE: ${projects.filter(p => p.status === 'ACTIVE').length}`);
  console.log(`     - APPROVED: ${projects.filter(p => p.status === 'APPROVED').length}`);
  console.log(`     - PENDING: ${projects.filter(p => p.status === 'PENDING').length}`);
  console.log(`  🔥 Alerts: ${alerts.length}`);
  console.log(`     - HIGH: ${alerts.filter(a => a.severity === 'HIGH').length}`);
  console.log(`     - MEDIUM: ${alerts.filter(a => a.severity === 'MEDIUM').length}`);
  console.log(`     - LOW: ${alerts.filter(a => a.severity === 'LOW').length}`);
  console.log('\n✨ You can now test the platform with realistic data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
