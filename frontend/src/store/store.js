import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "./stockSlice";




export const store=configureStore({reducer:todoReducer});