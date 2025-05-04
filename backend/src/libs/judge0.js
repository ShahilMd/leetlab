import axios from "axios"

export const getJudge0LanguageId=(language)=>{
  const languageMap = {
    "PYTHON":71,
    "JAVA":62,
    "JAVASCRIPT":63,
};
return languageMap[language];

}

export const submitBatch =async (submissions)=>{
  console.log(`submission:${submissions}`)
  console.log(process.env.JUDGE_URL)
  const {data} =await axios.post(`${process.env.JUDGE_URL}/submissions/batch?base64_encoded=false`,
  {
    submissions
  }
);
  console.log(`submission result ${data}`)
  return data // it will be array of multiple object token 
}


const sleep  = (ms)=> new Promise((resolve)=> setTimeout(resolve , ms))

export const pollBatchResults = async (tokens)=>{
    while(true){
        
        const {data} = await axios.get(`${process.env.JUDGE_URL}/submissions/batch`,{
            params:{
                tokens:tokens.join(","),
                base64_encoded:false,
            }
        })

        const results = data.submissions;

        const isAllDone = results.every(
            (r)=> r.status.id !== 1 && r.status.id !== 2
        )

        if(isAllDone) return results
        await sleep(1000)
    }
}