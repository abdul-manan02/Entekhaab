export default async function connectToMongoDB(client) {
    try {
      await client.connect();
      //console.log('Connected to MongoDB Atlas');
    } catch (error) {
      console.error('Error connecting to MongoDB Atlas', error);
    }
}