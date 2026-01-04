import isLoggedin from "../middlewares/isLoggedin.js";
import express from "express";
import { addToPlaylist, createPlaylist, deletePlaylist, deleteProblemFromPlaylist, getAllListDetails, getPlaylistDetails } from "../controllers/playlist.controllers.js";

const playlistRoutes = express.Router();

playlistRoutes.get("/", isLoggedin, getAllListDetails);

playlistRoutes.get("/playlist-details/:playlistId", isLoggedin, getPlaylistDetails);

playlistRoutes.post("/create-playlist", isLoggedin, createPlaylist);

playlistRoutes.post("/add-to-playlist/:plalistId", isLoggedin, addToPlaylist);

playlistRoutes.delete("/delete/:playlistId", isLoggedin, deletePlaylist);

playlistRoutes.delete("/delete-problem/:playlistId", isLoggedin, deleteProblemFromPlaylist);

export default playlistRoutes