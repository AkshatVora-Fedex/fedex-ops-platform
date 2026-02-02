import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../styles/CourierComms.css';

function CourierComms({ awb }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [courierInfo, setCourierInfo] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef(null);

  const quickCommands = [
    { id: 1, label: 'Prioritize Delivery', icon: 'priority_high', template: 'URGENT: Please prioritize this delivery. Customer waiting.' },
    { id: 2, label: 'Return to Station', icon: 'home', template: 'Please return package to station. Unable to deliver.' },
    { id: 3, label: 'Reroute to Alternate', icon: 'alt_route', template: 'Reroute to alternate drop-box location. Customer notified.' },
    { id: 4, label: 'Contact Customer', icon: 'phone', template: 'Please contact customer before attempting delivery.' },
    { id: 5, label: 'Verify Address', icon: 'location_on', template: 'Address verification needed. Please confirm with customer.' },
    { id: 6, label: 'Hold for Pickup', icon: 'pause', template: 'Hold package for customer pickup. Do not attempt delivery.' }
  ];

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5001', {
      transports: ['websocket'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-awb', awb);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('message-received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('courier-info', (info) => {
      setCourierInfo(info);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [awb]);

  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/comms/thread/${awb}`);
        const result = await response.json();
        if (result.success) {
          setMessages(result.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (awb) {
      fetchMessages();
    }
  }, [awb]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !socket) return;

    const message = {
      awb,
      text: messageText,
      sender: 'operations',
      timestamp: new Date().toISOString(),
      priority: messageText.includes('URGENT') ? 'high' : 'normal'
    };

    try {
      const response = await fetch('http://localhost:5000/api/comms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });

      const result = await response.json();
      if (result.success) {
        socket.emit('send-message', message);
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setShowTemplates(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuickCommand = (command) => {
    sendMessage(command.template);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(newMessage);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="courier-comms-container">
      {/* Header */}
      <div className="comms-header">
        <div className="header-left">
          <span className="material-icons">forum</span>
          <div>
            <h3>Courier Communication</h3>
            <p className="awb-label">AWB: {awb}</p>
          </div>
        </div>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Courier Info */}
      {courierInfo && (
        <div className="courier-info-bar">
          <div className="courier-avatar">
            <span className="material-icons">person</span>
          </div>
          <div className="courier-details">
            <strong>{courierInfo.name}</strong>
            <span className="courier-meta">
              Vehicle: {courierInfo.vehicle} • ID: {courierInfo.id}
            </span>
          </div>
          <div className="courier-status">
            <span className={`status-badge ${courierInfo.status}`}>
              {courierInfo.status === 'active' ? 'On Route' : 'Offline'}
            </span>
          </div>
        </div>
      )}

      {/* Quick Commands */}
      <div className="quick-commands">
        <button 
          className="templates-toggle"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          <span className="material-icons">bolt</span>
          Quick Commands
          <span className="material-icons">{showTemplates ? 'expand_less' : 'expand_more'}</span>
        </button>
        
        {showTemplates && (
          <div className="command-grid">
            {quickCommands.map(command => (
              <button
                key={command.id}
                className="command-button"
                onClick={() => handleQuickCommand(command)}
              >
                <span className="material-icons">{command.icon}</span>
                {command.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">chat_bubble_outline</span>
            <p>No messages yet</p>
            <span className="empty-hint">Send a message or use a quick command</span>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender === 'operations' ? 'sent' : 'received'}`}
              >
                <div className="message-bubble">
                  {msg.priority === 'high' && (
                    <div className="priority-badge">
                      <span className="material-icons">priority_high</span>
                      URGENT
                    </div>
                  )}
                  <p>{msg.text}</p>
                  <div className="message-meta">
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                    {msg.sender === 'operations' && (
                      <span className="message-status">
                        <span className="material-icons">{msg.delivered ? 'done_all' : 'done'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="message-input-container">
        <textarea
          className="message-input"
          placeholder="Type a message to the courier..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows="2"
        />
        <button 
          className="send-button"
          onClick={() => sendMessage(newMessage)}
          disabled={!newMessage.trim() || !isConnected}
        >
          <span className="material-icons">send</span>
        </button>
      </div>
    </div>
  );
}

export default CourierComms;
