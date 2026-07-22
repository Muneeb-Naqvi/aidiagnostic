const { MongoClient } = require('mongodb');
const atlasUri = 'mongodb+srv://muneebnaqvi7212_db_user:bkSmCML9irvbClzt@cluster0.oapkb7b.mongodb.net/ai-medical?retryWrites=true&w=majority';

async function run() {
  const client = new MongoClient(atlasUri);
  try {
    await client.connect();
    const db = client.db();
    const reports = await db.collection('labReports').find({}).toArray();
    console.log('Total labReports:', reports.length);
    reports.forEach(r => {
      console.log(`ID: ${r._id}, Title: ${r.reportTitle}, fileUrl: ${r.fileUrl}, fileType: ${r.fileType}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
