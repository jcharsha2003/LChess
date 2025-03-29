const verifytoken=require("./middlewares/verifyToken")
const exp=require("express")
const coachapp=exp.Router()
const expressAsyncHandler=require("express-async-handler")
coachapp.get("/get-course/:role",expressAsyncHandler(async(request,response)=>{
    // get courseCollection
    const courseCollection=request.app.get("courseCollection")
    
  let courseObj=await courseCollection.find({role:(request.params.role)}).toArray()
  
  
  response.status(200).send({message:`role list`,payload:courseObj})
  }))

coachapp.use(exp.json())
coachapp.post("/add-course",expressAsyncHandler(async(request,response)=>{
      const courseCollection=request.app.get("courseCollection")
      
      const newCourse=request.body

      const courseOfDb=await courseCollection.findOne({ title:newCourse.title})
         if(courseOfDb!==null){
          response.status(200).send({message:"lecture video already exists"})
         }
         else{
         
          await courseCollection.insertOne(newCourse)
          response.status(201).send({message:"lecture video created"})
      
      
      }
         
      
  }))
  module.exports=coachapp