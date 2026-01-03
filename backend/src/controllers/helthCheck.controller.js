export const healthCheck = (req,res) => {
  return res.status(200).json({
    success:true,
    code:'RUNNING',
    message:'server is up and running'
  })
}