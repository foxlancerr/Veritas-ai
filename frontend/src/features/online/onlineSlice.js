import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'online',
  initialState: { users: [], typing: {} },
  reducers: {
    setOnlineUsers(state, action) {
      state.users = action.payload;
    },
    userOnline(state, action) {
      const id = action.payload.userId;
      if (!state.users.includes(id)) state.users.push(id);
    },
    userOffline(state, action) {
      const id = action.payload.userId;
      state.users = state.users.filter(u => u !== id);
    },
    setTyping(state, action) {
      const { conversationId, userId } = action.payload;
      state.typing[conversationId] = state.typing[conversationId] || [];
      if (!state.typing[conversationId].includes(userId)) {
        state.typing[conversationId].push(userId);
      }
    },
    stopTyping(state, action) {
      const { conversationId, userId } = action.payload;
      state.typing[conversationId] = state.typing[conversationId] || [];
      state.typing[conversationId] = state.typing[conversationId].filter((id) => id !== userId);
    }
  }
});

export const { setOnlineUsers, userOnline, userOffline, setTyping, stopTyping } = slice.actions;
export default slice.reducer;
