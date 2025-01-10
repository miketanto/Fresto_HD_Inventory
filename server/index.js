import express from 'express'
import {User} from './database/db.js'

const app = express()
const port = 3000

app.get('/', async (req, res) => {
  try {
    const jane = await User.create({
      username: 'janedoe',
      birthday: new Date(1980, 6, 20),
    });
    const users = await User.findAll();
    res.send(users); // Note: Changed from User to users to send the query results
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while processing your request');
  }
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})