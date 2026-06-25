import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiHelpers from '../../../api/apiHelper';

export const fetchConversations = createAsyncThunk('conversations/fetch', async () => {
  const res = await apiHelpers.get('/chat/conversations');
  return res.conversations || res || [];
});

const slice = createSlice({
  name: 'conversations',
  initialState: { items: [], status: 'idle' },
  reducers: {
    upsertConversation(state, action) {
      const conv = action.payload;
      const idx = state.items.findIndex((c) => c._id === conv._id);
      if (idx >= 0) state.items[idx] = conv;
      else state.items.unshift(conv);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchConversations.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchConversations.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.items = Array.isArray(a.payload) ? a.payload : [];
      })
      .addCase(fetchConversations.rejected, (s) => { s.status = 'failed'; });
  },
});

export const { upsertConversation } = slice.actions;
export default slice.reducer;
