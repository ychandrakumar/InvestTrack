import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "../store/stockSlice";




export const store=configureStore({reducer:todoReducer});