import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);

  const addChat = (user) => {
    setChats((prev) => {
      if (prev.find((u) => u.id === user.id)) return prev;
      return [user, ...prev];
    });
  };

  return (
    <ChatContext.Provider value={{ chats, addChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChats = () => useContext(ChatContext);