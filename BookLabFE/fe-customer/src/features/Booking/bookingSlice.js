import { createSlice } from '@reduxjs/toolkit';

const bookingSlice = createSlice({
    name: 'booking',
    initialState: {
        bookings: [],
        loading: false,
    },
    reducers: {
        fetchBookingsStart(state) {
            state.loading = true;
        },
        fetchBookingsSuccess(state, action) {
            state.loading = false;
            state.bookings = action.payload;
        },
        fetchBookingsFailure(state) {
            state.loading = false;
        },
    },
});

export const { fetchBookingsStart, fetchBookingsSuccess, fetchBookingsFailure } = bookingSlice.actions;
export default bookingSlice.reducer;
