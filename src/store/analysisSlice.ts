"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CohnReznickAnalysis, CtaStatuses } from "@/types/analysis";

interface AnalysisState {
  result: CohnReznickAnalysis | null;
  ctaStatuses: CtaStatuses;
}

const initialState: AnalysisState = {
  result: null,
  ctaStatuses: {},
};

export const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    setResult(state, action: PayloadAction<CohnReznickAnalysis>) {
      state.result = action.payload;
      state.ctaStatuses = {};
    },
    setCtaStatus(state, action: PayloadAction<{ id: string; status: "Approved" | "Dismissed" }>) {
      state.ctaStatuses[action.payload.id] = action.payload.status;
    },
    clearResult(state) {
      state.result = null;
      state.ctaStatuses = {};
    },
  },
});

export const { setResult, setCtaStatus, clearResult } = analysisSlice.actions;
export default analysisSlice.reducer;
