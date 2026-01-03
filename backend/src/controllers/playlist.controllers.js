import { db } from "../libs/db.js"

export const getAllListDetails = async (req, res)=>{
  try {
    const userId = req.user.id;

    const playlists = await db.playlist.findMany({
      where:{
        userId
      },
      include:{
        problems:{
          include:{
            problem: true
          }
        }
      }
    })

    return res.status(200).json({
      success:true,
      message:"Playlist fetched Sucessfully",
      playlists
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"something went wrong Failed TO fetch details",
      error:error.message
    })
  }
}

export const getPlaylistDetails = async (req, res)=>{
  try {
    const userId = req.user.id;
    const {playlistId} = req.params;

    const playlist = await db.findUnique({
      where:{
        userId,
        id:playlistId
      },
      include:{
        problems:{
          include:{
            problem:true
          }
        }
      }
    })

    if(!playlist){
      return res.status(404).json({
        success:false,
        message:"playlist not found"
      })
    }

    return res.status(200).json({
      success:true,
      message:"Playlist fetched Sucessfully",
      playlist
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"something went wrong Failed TO fetch details",
      error:error.message
    })
  }
}

export const createPlaylist = async (req, res)=>{

  try {
    

    const {name , discription} = req.body;

    const userId = req.user.id;

    if(!name ||! discription){
      return res.status(400).json({
        success:false,
        message:"name or discription not found"
      })
    }
    const nameExists = await db.playlist.findFirst({
      where:{
        name:name.trim().toLowerCase(),
        userId: userId,
      }
    })

    if(nameExists){
      return res.status(400).json({
        success:false,
        message:"name already exists please use another name"
      })
    }

    const playlist = await db.playlist.create({
      data:{
        name:name.trim().toLowerCase(),
        discription,
        userId
      }
    })

    return res.status(200).json({
      success:true,
      message:"playlist created successfully",
      playlist
    })


  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"something went wrong",
      error:error.message
    })
  }
}

export const addToPlaylist = async (req, res)=>{
  try {
    const userId = req.user.id;
    const {playlistId} = req.params;
    const {problemIds} = req.body;

    if(!Array.isArray(problemIds) || problemIds.length === 0){
      return res.status(400).json({
        error:"Invaid or missing ProblemId"
      })
    }
    const existingProblemIds = await db.problemInPlaylist.findMany({
      where:problemIds.map((problemId)=>{
        playlistId,
        problemId
      })
    })

    if(existingProblemIds){
      return res.status(400).json({
        success:false,
        message:"problem already exists in playlist"
      })
    }
    const problemInPlaylist = await db.problemInPlaylist.create({
      data:problemIds.map((problemId=>{
        playlistId,
        problemId
      }))
    })

    return res.status(201).json({
      success:true,
      message:"Problem added To The Playlist",
      problemInPlaylist,
    })

  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Failed To Add problem Into Playlist",
      error:error.message
    })
  }
}

export const deletePlaylist = async (req, res)=>{
  try {
    const userId = req.user.id;
    const {playlistId} = req.params;

    await db.playlist.delete({
      where:{
        id:playlistId,
        userId,
      
      }
    })
    
    return res.status(200).json({
      success:true,
      message:"Playlist Deleted Sucessfull"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Failed To Delete Playlist",
      error:error.message
    })
  }
}

export const deleteProblemFromPlaylist = async (req, res)=>{
  try {
    const {playlistId} = req.params;
    const {problemIds} = req.body

    if(!Array.isArray(problemIds) || problemIds.length === 0){
       return res.status(400).json({
        error:"Invaid or missing ProblemId"
      })
    }

    const deleteProblem = await db.problemInPlaylist.deleteMany({
     where: {
     playlistId,
     problemId:
      { 
        in: problemIds
       }
     }
    })

    return res.status(200).json({
      success:true,
      message:"Problem Deleted Sucessfully From Playlist"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Failed To Delete Problem From Playlist"
    })
  }

}