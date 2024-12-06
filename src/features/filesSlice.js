import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const baseApi = import.meta.env.VITE_API_URL;

export const fetchFiles = createAsyncThunk(
  "/files/fetch",
  async ({ type, sortBy, orderDirection }, { rejectWithValue }) => {
    try {
      console.log(type);
      const res = await axios.get(`${baseApi}/files/get/${type}`, {
        params: {
            orderBy: sortBy,
            orderDirection: orderDirection,
          },
          withCredentials:true
      });
      return res.data;
    } catch (error) {
      console.log(error.response);
      return rejectWithValue(error.response.data);
    }
  }
);

export const uploadFile = createAsyncThunk(
  "/files/upload",
  async ( file , { rejectWithValue }) => {
    try {
  

      const res = await axios.post(`${baseApi}/files/upload`, file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      console.log(res)
      return res.data;
    } catch (error) {
        console.log("error", error);
      return rejectWithValue(error.response.data);
    }
  })

  export const editFileName = createAsyncThunk("/edit/file", async ({fileId, newName},{rejectWithValue})=>{
    try {
      const res = await axios.put(`${baseApi}/files/edit/name`, {fileId, newName}, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  })

  export const getLatestFiles = createAsyncThunk("get/latest", async(_,{rejectWithValue})=>{
    try {
      const res = await axios.get(`${baseApi}/files/get/latest`, {
        withCredentials: true,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  })

  export const deleteFile = createAsyncThunk("/files/delete", async (fileId, {rejectWithValue})=>{
    try {
        const res = await axios.post(`${baseApi}/trash/${fileId}`, null, {
            withCredentials: true,
          });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  })

  export const shareFile = createAsyncThunk("/shareFile",async (data,{rejectWithValue}) => {
    try {
      console.log("data", data)
      const res = await axios.post(`${baseApi}/files/share`, data, {
        withCredentials: true,
      });
      console.log("res", res)
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  })

  export const getSingleFile = createAsyncThunk("/files/getSingleFile",async (fileId,{rejectWithValue})=>{
    try {
      const res = await axios.get(`${baseApi}/files/get/file/${fileId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  })

  export const getAllAccessibleFiles = createAsyncThunk("/allAccessibleFiles",async(_,{rejectWithValue})=>{
    try {
      const res = await axios.get(`${baseApi}/files/get/shared`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  })

  export const getFilesSharedByMe = createAsyncThunk("/get/my/shared/files",async(_,{rejectWithValue})=>{
    try {
      const res = await axios.get(`${baseApi}/files/get/sharedByMe`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  })



const initialState = {
  loading: false,
  data: [],
  error: null,
  response: null,
};

const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFiles.pending, (state, action) => {
      state.loading = true;
      state.response = null;
      state.error = null;
    }),
      builder.addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.response = action.payload;
        state.error = null;
      }),
      builder.addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.response = action.payload;
      }),
      builder.addCase(uploadFile.pending, (state, action) => {
        state.loading = true;
        state.response = null;
        state.error = null;
      }),
      builder.addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
        state.error = null;
      }),
      builder.addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.response = action.payload;
      });
     
  },
});

export default fileSlice.reducer;