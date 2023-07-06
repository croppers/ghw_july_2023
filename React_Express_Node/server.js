const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3001;
const db = new sqlite3.Database('./data.db');
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const reminderEmail = process.env.REMINDER_EMAIL;

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT)');
});

app.use(express.json());
app.use(cors());

app.get('/items', (req, res) => {
  db.all('SELECT * FROM items', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/items', (req, res) => {
  const item = req.body.item;
  db.run('INSERT INTO items (item) VALUES (?)', [item], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID });
    }
  });
});

app.put('/items/:id', (req, res) => {
  const id = req.params.id;
  const newItem = req.body.item;
  db.run('UPDATE items SET item = ? WHERE id = ?', [newItem, id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.sendStatus(200);
    }
  });
});

app.delete('/items/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM items WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.sendStatus(200);
    }
  });
});

app.post('/send_email', (req, res) => {
  const item = req.body.item;
  const subject = `Reminder: ${item}`;
  const body = `This is a reminder for the task: ${item}`;

  sgMail.setApiKey(sendgridApiKey);
  const msg = {
    to: 'sendgrid.tutorial@protonmail.com',
    from: reminderEmail,
    subject: subject,
    text: body,
  };

  sgMail
    .send(msg)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      res.status(500).json({ error: error.message });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});