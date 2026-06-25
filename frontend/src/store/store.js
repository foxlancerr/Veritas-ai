import { configureStore } from '@reduxjs/toolkit';
import conversationsReducer from '../features/conversations/conversationsSlice';
import messagesReducer from '../features/messages/messagesSlice';
import onlineReducer from '../features/online/onlineSlice';

export const store = configureStore({
  reducer: {
    conversations: conversationsReducer,
    messages: messagesReducer,
    online: onlineReducer,
  },
});

export default store;
