import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:3001/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const addItem = async () => {
    try {
      const response = await axios.post('http://localhost:3001/items', { item: newItem });
      const newItemObj = { id: response.data.id, item: newItem };
      setItems([...items, newItemObj]);
      setNewItem('');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/items/${id}`);
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const editItem = async (id, updatedItem) => {
    try {
      await axios.put(`http://localhost:3001/items/${id}`, { item: updatedItem });
      const updatedItems = items.map((item) =>
        item.id === id ? { ...item, item: updatedItem } : item
      );
      setItems(updatedItems);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const setReminder = async (id) => {
    try {
      const item = items.find((item) => item.id === id);
      const confirmed = window.confirm('Reminder: '+item.item);
      if (confirmed) {
        await axios.post('http://localhost:3001/send_email', { item: item.item });
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  return (
    <div class="container">
      <h1>Hack Planner</h1>
      <ul class="checklist-items">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.item}</span>
            <button class="remind-button" onClick={() => editItem(item.id, prompt('Enter updated item', item.item))}>
              Edit
            </button>
            <button onClick={() => deleteItem(item.id)}>Delete</button>
            <button onClick={() => setReminder(item.id)}>Remind</button>
          </li>
        ))}
      </ul>
      <div class="add-form">
        <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
        <button onClick={addItem}>Add</button>
      </div>
      
    </div>
  );
}

export default App;