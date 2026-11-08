import * as admin from 'firebase-admin';
import { INITIAL_OPPORTUNITIES, INITIAL_SPI_TEAM, INITIAL_DAILY_DIGEST } from '../../client/src/mock/initialData';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'spi-scanner'
  });
}

const db = admin.firestore();

async function seed() {
  console.log('Sembrando datos iniciales en Firestore (spi-scanner)...');

  // 1. Guardar oportunidades regulatorias
  for (const opp of INITIAL_OPPORTUNITIES) {
    await db.collection('regulatory_opportunities').doc(opp.id).set(opp);
    console.log(`✓ Oportunidad guardada: ${opp.title.substring(0, 45)}...`);
  }

  // 2. Guardar miembros del equipo SPI
  for (const member of INITIAL_SPI_TEAM) {
    await db.collection('team_members').doc(member.id).set(member);
    console.log(`✓ Consultor guardado: ${member.name}`);
  }

  // 3. Guardar Daily Digest inicial
  await db.collection('daily_digests').doc(INITIAL_DAILY_DIGEST.id).set(INITIAL_DAILY_DIGEST);
  console.log(`✓ Digest diario guardado: ${INITIAL_DAILY_DIGEST.id}`);

  console.log('¡Siembra en Firestore completada exitosamente!');
}

seed().catch(console.error);
