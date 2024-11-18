import React, { useState, useEffect } from 'react';
import './App.css';  // We will create this file for styling

const App = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editItem, setEditItem] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:5002');

        ws.onopen = () => {
            console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);
            if (message.type === 'initial') {
                setItems(message.items); // Set initial data
            } else if (message.type === 'update') {
                setItems(message.items); // Update data in real-time
            }
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            console.log('WebSocket error:', error);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    const handleAddItem = () => {
        if (newItem.trim() !== '') {
            const ws = new WebSocket('ws://localhost:5002');
            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'add', item: newItem }));
                setNewItem(''); // Reset input field
            };
        }
    };

    const handleRemoveItem = (item) => {
        const ws = new WebSocket('ws://localhost:5002');
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'remove', item }));
        };
    };

    const handleUpdateItem = () => {
        if (editItem && editItem.text.trim() !== '') {
            const ws = new WebSocket('ws://localhost:5002');
            ws.onopen = () => {
                ws.send(JSON.stringify({ type: 'update', item: editItem }));
                setEditItem(null); // Reset editing
            };
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const filteredItems = items.filter((item) =>
        item.toLowerCase().includes(searchTerm)
    );

    return (
        <div className="app-container">
            <h1>Item Management</h1>
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search Items"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>
            <div className="item-list-container">
                <ul className="item-list">
                    {filteredItems.map((item, index) => (
                        <li key={index} className="item">
                            <span>{item}</span>
                            <button
                                className="remove-btn"
                                onClick={() => handleRemoveItem(item)}
                            >
                                Remove
                            </button>
                            <button
                                className="edit-btn"
                                onClick={() => setEditItem({ text: item, index })}
                            >
                                Edit
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="add-item-container">
                <input
                    type="text"
                    className="add-item-input"
                    placeholder="Add a new item"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                />
                <button className="add-btn" onClick={handleAddItem}>
                    Add Item
                </button>
            </div>
            {editItem && (
                <div className="edit-item-container">
                    <input
                        type="text"
                        className="edit-item-input"
                        value={editItem.text}
                        onChange={(e) =>
                            setEditItem({ ...editItem, text: e.target.value })
                        }
                    />
                    <button className="update-btn" onClick={handleUpdateItem}>
                        Update Item
                    </button>
                    <button
                        className="cancel-btn"
                        onClick={() => setEditItem(null)}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
