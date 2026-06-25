import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiHelpers from '../../../api/apiHelper';

export const fetchMessages = createAsyncThunk('messages/fetch', async ({conversationId, page=1, limit=50}) => {
  const res = await apiHelpers.get(`/chat/messages/${conversationId}?page=${page}&limit=${limit}`);
  return { conversationId, messages: Array.isArray(res.messages) ? res.messages : [] };
});

const slice = createSlice({
  name: 'messages',
  initialState: { byConversation: {}, status: 'idle' },
  reducers: {
    addMessage(state, action) {
      const { conversationId, message } = action.payload;
      state.byConversation[conversationId] = state.byConversation[conversationId] || [];
      state.byConversation[conversationId].push(message);
    },
    markSeen(state, action) {
      const { conversationId, messageIds, userId } = action.payload;
      const arr = state.byConversation[conversationId] || [];
      arr.forEach(m => {
        if (messageIds.includes(m._id)) {
          m.seenBy = m.seenBy || [];
          if (!m.seenBy.includes(userId)) m.seenBy.push(userId);
        }
      });
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchMessages.fulfilled, (s, a) => {
      s.byConversation[a.payload.conversationId] = a.payload.messages;
    });
  }
});

export const { addMessage, markSeen } = slice.actions;
export default slice.reducer;
