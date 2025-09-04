import 'dotenv/config';
import { ChromaClient } from 'chromadb';

const chroma = new ChromaClient({ path: process.env.CHROMA_URL || 'http://localhost:8000' });

async function resetCollection() {
  console.log('Deleting collection: reflect-journal');
  await chroma.deleteCollection({ name: 'reflect-journal' });
  console.log('Collection deleted successfully.');
}

resetCollection().catch((err) => {
  console.error('Failed to delete collection:', err);
  process.exit(1);
});
