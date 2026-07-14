import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiHelpers from '../../../api/apiHelper';

const STATUS_ORDER = { sent: 0, delivered: 1, read: 2 };

const shouldApplyStatusUpdate = (currentStatus, nextStatus) => {
  if (!currentStatus) return Boolean(nextStatus);
  return (STATUS_ORDER[nextStatus] ?? -1) >= (STATUS_ORDER[currentStatus] ?? -1);
};

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
      const arr = state.byConversation[conversationId] || [];
      if (!state.byConversation[conversationId]) {
        state.byConversation[conversationId] = arr;
      }

      const existingIndex = arr.findIndex((existingMessage) => existingMessage._id?.toString() === message?._id?.toString());
      if (existingIndex >= 0) {
        arr[existingIndex] = { ...arr[existingIndex], ...message };
        return;
      }

      arr.push(message);
    },
    updateMessageStatus(state, action) {
      const { conversationId, messageId, status, deliveredAt, readAt } = action.payload;
      const arr = state.byConversation[conversationId] || [];
      if (!state.byConversation[conversationId]) {
        state.byConversation[conversationId] = arr;
      }

      const target = arr.find((message) => message._id?.toString() === messageId?.toString());
      if (!target) {
        if (messageId) {
          arr.push({ _id: messageId, status, createdAt: new Date().toISOString(), conversationId });
        }
        return;
      }

      if (!shouldApplyStatusUpdate(target.status, status)) {
        return;
      }

      target.status = status;
      if (deliveredAt) target.deliveredAt = deliveredAt;
      if (readAt) target.readAt = readAt;
    },
    replaceConversationMessages(state, action) {
      const { conversationId, messages } = action.payload;
      const merged = [...(state.byConversation[conversationId] || [])];
      const messageMap = new Map(merged.map((message) => [message._id?.toString(), message]));

      messages.forEach((message) => {
        const key = message._id?.toString();
        if (key && messageMap.has(key)) {
          messageMap.set(key, { ...messageMap.get(key), ...message });
        } else if (key) {
          messageMap.set(key, message);
        }
      });

      state.byConversation[conversationId] = Array.from(messageMap.values()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    markSeen(state, action) {
      const { conversationId, messageIds, userId } = action.payload;
      const arr = state.byConversation[conversationId] || [];
      arr.forEach((m) => {
        if (messageIds.includes(m._id)) {
          m.seenBy = m.seenBy || [];
          if (!m.seenBy.includes(userId)) m.seenBy.push(userId);
        }
      });
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchMessages.fulfilled, (s, a) => {
      const existingMessages = s.byConversation[a.payload.conversationId] || [];
      const existingMap = new Map(existingMessages.map((message) => [message._id?.toString(), message]));

      a.payload.messages.forEach((message) => {
        const key = message._id?.toString();
        if (key && existingMap.has(key)) {
          existingMap.set(key, { ...existingMap.get(key), ...message });
        } else if (key) {
          existingMap.set(key, message);
        }
      });

      s.byConversation[a.payload.conversationId] = Array.from(existingMap.values()).sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
    });
  }
});

export const { addMessage, updateMessageStatus, replaceConversationMessages, markSeen } = slice.actions;
export default slice.reducer;
